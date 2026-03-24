import { useStore } from '@nanostores/react';
import { sessionsStore, loadSessions } from '../lib/store';
import { useEffect, useState } from 'react';
import type { Exercise, ExerciseAttempt } from '../lib/types';

const TYPE_LABELS: Record<string, string> = {
  vocabulary: 'Vocabulary',
  open_cloze: 'Open Cloze (Part 2)',
  word_formation: 'Word Formation (Part 3)',
  key_word_transformation: 'Key Word Transformation (Part 4)',
  error_correction: 'Error Correction',
};

export default function Exercises() {
  const sessions = useStore(sessionsStore);
  const [selectedSession, setSelectedSession] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluated, setEvaluated] = useState<Record<string, 'correct' | 'close' | 'wrong'>>({});
  const [filter, setFilter] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<{ byAttempt: any[]; byType: any[] } | null>(null);
  const [clozeAnswers, setClozeAnswers] = useState<Record<string, Record<number, string>>>({});

  const loadStats = (sid: string) => {
    fetch(`/api/exercise-stats?sessionId=${sid}`).then(r => r.json()).then(setStats);
  };

  // Parse multi-gap exercises: detect numbered gaps and extract answer map
  const parseMultiGap = (question: string, answer: string) => {
    // Match ___(N)___ or ___N___ patterns
    const gapPattern = /___\(?(\d+)\)?___/g;
    const gaps: number[] = [];
    let match;
    while ((match = gapPattern.exec(question)) !== null) gaps.push(parseInt(match[1]));

    // If no inline gaps, try numbered list format: "1. sentence ___" or "1. sentence ______"
    if (gaps.length === 0) {
      const linePattern = /^(\d+)\.\s/gm;
      while ((match = linePattern.exec(question)) !== null) gaps.push(parseInt(match[1]));
    }

    if (gaps.length === 0) return null;

    // Parse answers: "1. word  2. word" or "1. word\n2. word"
    const answerMap: Record<number, string> = {};
    const ansPattern = /(\d+)\.\s*([^\d]+?)(?=\s*\d+\.|$)/g;
    while ((match = ansPattern.exec(answer)) !== null) {
      answerMap[parseInt(match[1])] = match[2].trim().split(/\s*[(/]/)[0].trim();
    }

    return { gaps, answerMap };
  };

  const hasMultiGap = (ex: Exercise) => {
    return parseMultiGap(ex.question, ex.answer) !== null;
  };

  // Parse key word transformation: "Rewrite using WORD: "sentence" → Stem ..."
  const parseKWT = (question: string) => {
    const m = question.match(/^(.*?)["""](.+?)["""].*?→\s*(.+?)\s*\.\.\.$/s);
    if (!m) return null;
    return { instruction: m[1].trim(), original: m[2].trim(), stem: m[3].trim() };
  };

  // Parse error correction: "Find the error: "sentence""
  const parseErrorCorrection = (question: string) => {
    const m = question.match(/^(.*?)["""](.+?)["""]\s*(.*)$/s);
    if (!m) return null;
    return { instruction: m[1].trim(), sentence: m[2].trim(), hint: m[3].trim() };
  };

  // Check if a user answer matches the correct answer (handles "X -> Y" error correction format)
  const isGapCorrect = (userInput: string, correctAnswer: string): boolean => {
    const u = userInput.trim().toLowerCase().replace(/\s*[→⟶]\s*/g, ' -> ');
    const c = correctAnswer.toLowerCase();
    const arrowMatch = c.match(/^(.+?)\s*->\s*(.+)$/);
    if (arrowMatch) {
      const wrongWord = arrowMatch[1].trim();
      const replacement = arrowMatch[2].trim();
      const userArrow = u.match(/^(.+?)\s*->\s*(.+)$/);
      return !!(u && (
        u === c ||
        (userArrow && userArrow[1].trim() === wrongWord && userArrow[2].trim() === replacement) ||
        (!userArrow && u.includes(replacement))
      ));
    }
    return !!(u && (c.includes(u) || u.includes(c)));
  };

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    const handler = (e: Event) => setSelectedSession((e as CustomEvent).detail);
    window.addEventListener('select-exercise-session', handler);
    return () => window.removeEventListener('select-exercise-session', handler);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      Promise.all([
        fetch(`/api/exercises?sessionId=${selectedSession}`).then(r => r.json()),
        fetch(`/api/exercise-attempts?sessionId=${selectedSession}`).then(r => r.json()),
      ]).then(([exs, attempts]: [Exercise[], ExerciseAttempt[]]) => {
        setExercises(exs);
        if (attempts.length > 0) {
          const answers: Record<string, string> = {};
          const results: Record<string, 'correct' | 'close' | 'wrong'> = {};
          const shown: Record<string, boolean> = {};
          const restoredCloze: Record<string, Record<number, string>> = {};
          let maxAttempt = 1;
          for (const a of attempts) {
            answers[a.exerciseId] = a.userAnswer;
            results[a.exerciseId] = a.result as 'correct' | 'close' | 'wrong';
            shown[a.exerciseId] = true;
            if (a.attemptNumber > maxAttempt) maxAttempt = a.attemptNumber;
            // Restore cloze gap answers from "1. word  2. word" format
            const clozeMatch = a.userAnswer.match(/(\d+)\.\s/);
            if (clozeMatch) {
              const gapAnswers: Record<number, string> = {};
              const pat = /(\d+)\.\s*([^\d]+?)(?=\s*\d+\.|$)/g;
              let m;
              while ((m = pat.exec(a.userAnswer)) !== null) {
                gapAnswers[parseInt(m[1])] = m[2].trim();
              }
              restoredCloze[a.exerciseId] = gapAnswers;
            }
          }
          setUserAnswers(answers);
          setEvaluated(results);
          setShowAnswers(shown);
          setClozeAnswers(restoredCloze);
          setAttemptNumber(maxAttempt);
        } else {
          setUserAnswers({});
          setEvaluated({});
          setShowAnswers({});
          setAttemptNumber(1);
        }
        loadStats(selectedSession);
      });
    } else {
      setExercises([]);
      setShowAnswers({});
      setUserAnswers({});
      setEvaluated({});
      setClozeAnswers({});
      setAttemptNumber(1);
      setStats(null);
      setShowStats(false);
    }
  }, [selectedSession]);

  const toggleAnswer = (id: string) => setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const evaluate = (ex: Exercise) => {
    const parsed = hasMultiGap(ex) ? parseMultiGap(ex.question, ex.answer) : null;

    let user: string;
    let result: 'correct' | 'close' | 'wrong';

    if (parsed) {
      const answers = clozeAnswers[ex.id] || {};
      const total = parsed.gaps.length;
      let correct = 0;
      for (const n of parsed.gaps) {
        const u = (answers[n] || '').trim();
        if (u && isGapCorrect(u, parsed.answerMap[n] || '')) correct++;
      }
      user = parsed.gaps.map(n => `${n}. ${(answers[n] || '').trim()}`).join('  ');
      result = correct === total ? 'correct' : correct >= total * 0.5 ? 'close' : 'wrong';
    } else {
      user = (userAnswers[ex.id] || '').trim().toLowerCase();
      const correct = ex.answer.toLowerCase();
      if (!user) return;
      if (correct.includes(user) || user.includes(correct.split('(')[0].trim().toLowerCase())) {
        result = 'correct';
      } else {
        const userWords = user.split(/\s+/);
        const correctWords = correct.split(/\s+/);
        const matches = userWords.filter(w => correctWords.some(cw => cw.includes(w) || w.includes(cw)));
        result = matches.length >= correctWords.length * 0.4 ? 'close' : 'wrong';
      }
    }

    setEvaluated(prev => ({ ...prev, [ex.id]: result }));
    setShowAnswers(prev => ({ ...prev, [ex.id]: true }));
    fetch('/api/exercise-attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId: ex.id, sessionId: selectedSession, userAnswer: user, result }),
    }).then(() => loadStats(selectedSession));
  };

  const resetLesson = () => {
    if (!selectedSession) return;
    fetch('/api/exercise-attempts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: selectedSession }),
    }).then(() => {
      setUserAnswers({});
      setEvaluated({});
      setShowAnswers({});
      setClozeAnswers({});
      setAttemptNumber(prev => prev + 1);
    });
  };

  const evalColor = (id: string) => {
    const r = evaluated[id];
    if (r === 'correct') return 'border-green-500 bg-green-500/5';
    if (r === 'close') return 'border-yellow-500 bg-yellow-500/5';
    if (r === 'wrong') return 'border-red-500 bg-red-500/5';
    return 'border-primary/20';
  };

  const evalLabel = (id: string) => {
    const r = evaluated[id];
    if (r === 'correct') return '✅ Correct!';
    if (r === 'close') return '🟡 Close — check the answer';
    if (r === 'wrong') return '❌ Not quite — see the correct answer';
    return null;
  };

  const sessionList = Object.values(sessions)
    .filter(s => !filter || s.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  const grouped = exercises.reduce((acc, ex) => {
    (acc[ex.type] = acc[ex.type] || []).push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const totalAnswered = Object.keys(evaluated).length;
  const totalCorrect = Object.values(evaluated).filter(v => v === 'correct').length;

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Session List */}
      <div className="w-72 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Exercises</h2>
          <p className="text-sm text-slate-400">Select a session to practice</p>
        </div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter sessions..."
          className="px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
        />
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {sessionList.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSession(s.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedSession === s.id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-black/40 border-primary/20 hover:border-primary/40'
              }`}
            >
              <p className="font-bold text-sm text-slate-100">{s.title}</p>
              <p className="text-xs text-slate-500">{s.skillArea} · {s.createdDate}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Exercises */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {!selectedSession ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-30">quiz</span>
              <p className="text-sm">Select a session to see exercises</p>
            </div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-30">inbox</span>
              <p className="text-sm">No exercises yet for this session</p>
              <p className="text-xs text-slate-600 mt-2">Use Kiro CLI: "Generate exercises from {sessions[selectedSession]?.title}"</p>
            </div>
          </div>
        ) : (
          <>
            {totalAnswered > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Score: {totalCorrect}/{totalAnswered} answered
                  {attemptNumber > 1 && <span className="ml-2 text-primary">· Attempt #{attemptNumber}</span>}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary">{Math.round((totalCorrect / totalAnswered) * 100)}%</span>
                  <button onClick={resetLesson} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase hover:bg-red-500/30">
                    Reset
                  </button>
                </div>
              </div>
            )}
            {totalAnswered === 0 && Object.keys(evaluated).length === 0 && exercises.length > 0 && attemptNumber > 1 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                <span className="text-xs text-slate-300">Attempt #{attemptNumber} — fresh start!</span>
              </div>
            )}
            {stats && stats.byAttempt.length > 0 && (
              <div className="rounded-lg border border-primary/20 overflow-hidden">
                <button onClick={() => setShowStats(p => !p)} className="w-full p-3 bg-black/60 flex items-center justify-between hover:bg-black/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Session Stats</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-400">{showStats ? 'expand_less' : 'expand_more'}</span>
                </button>
                {showStats && (
                  <div className="p-4 bg-black/40 space-y-4">
                    {/* Progress across attempts */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Progress by Attempt</p>
                      <div className="flex gap-3">
                        {stats.byAttempt.map((a: any) => {
                          const pct = Math.round((a.correct / a.total) * 100);
                          return (
                            <div key={a.attemptNumber} className="flex-1 p-3 rounded bg-black/60 border border-primary/10 text-center">
                              <p className="text-[10px] text-slate-500 mb-1">#{a.attemptNumber}</p>
                              <p className={`text-lg font-black ${pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{pct}%</p>
                              <p className="text-[10px] text-slate-500">{a.correct}/{a.total}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Accuracy by type */}
                    {stats.byType.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Accuracy by Type (Latest Attempt)</p>
                        <div className="space-y-2">
                          {stats.byType.map((t: any) => {
                            const pct = Math.round((t.correct / t.total) * 100);
                            return (
                              <div key={t.type} className="flex items-center gap-3">
                                <span className="text-xs text-slate-300 w-44 truncate">{TYPE_LABELS[t.type] || t.type}</span>
                                <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-300 w-16 text-right">{t.correct}/{t.total}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {Object.entries(grouped).map(([type, exs]) => (
              <div key={type} className="mb-6">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <span className="material-symbols-outlined text-sm">school</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em]">{TYPE_LABELS[type] || type} ({exs.length})</h3>
                </div>
                <div className="space-y-3">
                  {exs.map((ex, i) => {
                    const parsed = hasMultiGap(ex) ? parseMultiGap(ex.question, ex.answer) : null;
                    const kwt = !parsed && ex.type === 'key_word_transformation' ? parseKWT(ex.question) : null;
                    const ec = !parsed && !kwt && ex.type === 'error_correction' ? parseErrorCorrection(ex.question) : null;
                    const isChecked = !!evaluated[ex.id];
                    const hasInlineGaps = parsed && /_{3,}/.test(ex.question);
                    return (
                    <div key={ex.id} className={`p-4 rounded-lg bg-black/60 border transition-colors ${evalColor(ex.id)}`}>
                      {parsed && hasInlineGaps ? (
                        /* Multi-gap with inline blanks (open cloze, word formation, KWT with ______) */
                        <>
                          <div className="text-sm text-slate-100 font-medium mb-3 leading-relaxed">
                            <span className="text-primary font-mono mr-2">{i + 1}.</span>
                            {ex.question.split(/___\(?\d+\)?___|_{3,}/).reduce((parts: React.ReactNode[], text, idx) => {
                              if (idx > 0 && parsed.gaps[idx - 1] !== undefined) {
                                const gapNum = parsed.gaps[idx - 1];
                                const gapVal = (clozeAnswers[ex.id] || {})[gapNum] || '';
                                const isRight = isChecked && isGapCorrect(gapVal, parsed.answerMap[gapNum] || '');
                                const isWrong = isChecked && gapVal.trim() !== '' && !isRight;
                                parts.push(
                                  <span key={`gap-${gapNum}`} className="inline-flex items-center mx-1 align-baseline">
                                    <span className="text-[10px] text-primary font-mono mr-1">({gapNum})</span>
                                    <input
                                      type="text"
                                      value={gapVal}
                                      onChange={(e) => setClozeAnswers(prev => ({
                                        ...prev,
                                        [ex.id]: { ...(prev[ex.id] || {}), [gapNum]: e.target.value }
                                      }))}
                                      disabled={isChecked}
                                      className={`${ex.type === 'open_cloze' ? 'w-24' : 'w-40'} px-2 py-0.5 bg-black/60 border rounded text-sm text-center text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary disabled:opacity-70 ${
                                        isRight ? 'border-green-500 bg-green-500/10' :
                                        isWrong ? 'border-red-500 bg-red-500/10' :
                                        'border-primary/30'
                                      }`}
                                      placeholder="..."
                                    />
                                    {isWrong && <span className="text-[10px] text-green-400 ml-1">{parsed.answerMap[gapNum]}</span>}
                                  </span>
                                );
                              }
                              parts.push(...text.split('\n').flatMap((line, li) =>
                                li > 0 ? [<br key={`br-${idx}-${li}`} />, line] : [line]
                              ));
                              return parts;
                            }, [])}
                          </div>
                          {!isChecked && (
                            <button onClick={() => evaluate(ex)} className="px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90">Check All</button>
                          )}
                        </>
                      ) : parsed && !hasInlineGaps ? (
                        /* Multi-gap without blanks — numbered lines with input next to each (error correction) */
                        <>
                          {(() => {
                            const lines = ex.question.split('\n');
                            const header = lines.filter(l => !/^\d+\.\s/.test(l)).join(' ').trim();
                            return (
                              <div className="space-y-3">
                                {header && (
                                  <p className="text-sm text-slate-100 font-medium">
                                    <span className="text-primary font-mono mr-2">{i + 1}.</span>
                                    {header}
                                  </p>
                                )}
                                {parsed.gaps.map(gapNum => {
                                  const line = lines.find(l => l.match(new RegExp(`^${gapNum}\\.\\s`)));
                                  const sentence = line?.replace(/^\d+\.\s*/, '').trim() || '';
                                  const gapVal = (clozeAnswers[ex.id] || {})[gapNum] || '';
                                  const isRight = isChecked && isGapCorrect(gapVal, parsed.answerMap[gapNum] || '');
                                  const isWrong = isChecked && gapVal.trim() !== '' && !isRight;
                                  return (
                                    <div key={gapNum} className="flex items-start gap-2">
                                      <span className="text-[10px] text-primary font-mono mt-2 shrink-0">({gapNum})</span>
                                      <div className="flex-1">
                                        <p className={`text-sm mb-1 ${ex.type === 'error_correction' ? 'text-red-400/80' : 'text-slate-300'}`}>{sentence}</p>
                                        <input
                                          type="text"
                                          value={gapVal}
                                          onChange={(e) => setClozeAnswers(prev => ({
                                            ...prev,
                                            [ex.id]: { ...(prev[ex.id] || {}), [gapNum]: e.target.value }
                                          }))}
                                          disabled={isChecked}
                                          placeholder={ex.type === 'error_correction' ? 'e.g. from -> of  or  full corrected sentence' : 'Your answer...'}
                                          className={`w-full px-3 py-1.5 bg-black/60 border rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary disabled:opacity-70 ${
                                            isRight ? 'border-green-500 bg-green-500/10' :
                                            isWrong ? 'border-red-500 bg-red-500/10' :
                                            'border-primary/20'
                                          }`}
                                        />
                                        {isWrong && <p className="text-[10px] text-green-400 mt-1">{parsed.answerMap[gapNum]}</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                          {!isChecked && (
                            <button onClick={() => evaluate(ex)} className="mt-3 px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90">Check All</button>
                          )}
                        </>
                      ) : kwt ? (
                        /* Key Word Transformation — instruction + original + stem with inline input */
                        <>
                          <p className="text-sm text-slate-100 font-medium mb-1">
                            <span className="text-primary font-mono mr-2">{i + 1}.</span>
                            {kwt.instruction}
                          </p>
                          <p className="text-sm text-slate-400 italic mb-3">"{kwt.original}"</p>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-sm text-slate-300">→ {kwt.stem}</span>
                            <input
                              type="text"
                              value={userAnswers[ex.id] || ''}
                              onChange={(e) => setUserAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && evaluate(ex)}
                              placeholder="complete the sentence..."
                              disabled={isChecked}
                              className="flex-1 min-w-[200px] px-3 py-1.5 bg-black/60 border border-primary/30 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary disabled:opacity-50"
                            />
                            {!isChecked ? (
                              <button onClick={() => evaluate(ex)} className="px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90">Check</button>
                            ) : (
                              <button onClick={() => toggleAnswer(ex.id)} className="px-3 py-2 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30">{showAnswers[ex.id] ? 'Hide' : 'Answer'}</button>
                            )}
                          </div>
                        </>
                      ) : ec ? (
                        /* Error Correction — erroneous sentence + input for corrected version */
                        <>
                          <p className="text-sm text-slate-100 font-medium mb-1">
                            <span className="text-primary font-mono mr-2">{i + 1}.</span>
                            {ec.instruction}
                          </p>
                          <p className="text-sm text-red-400/80 line-through mb-1">"{ec.sentence}"</p>
                          {ec.hint && <p className="text-[10px] text-slate-500 mb-3">{ec.hint}</p>}
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-slate-400">→</span>
                            <input
                              type="text"
                              value={userAnswers[ex.id] || ''}
                              onChange={(e) => setUserAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && evaluate(ex)}
                              placeholder="Write the corrected sentence..."
                              disabled={isChecked}
                              className="flex-1 px-3 py-1.5 bg-black/60 border border-primary/30 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary disabled:opacity-50"
                            />
                            {!isChecked ? (
                              <button onClick={() => evaluate(ex)} className="px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90">Check</button>
                            ) : (
                              <button onClick={() => toggleAnswer(ex.id)} className="px-3 py-2 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30">{showAnswers[ex.id] ? 'Hide' : 'Answer'}</button>
                            )}
                          </div>
                        </>
                      ) : (
                        /* Standard single-answer exercise (vocabulary, word formation, single-gap cloze) */
                        <>
                          <p className="text-sm text-slate-100 font-medium mb-3">
                            <span className="text-primary font-mono mr-2">{i + 1}.</span>
                            {ex.question}
                          </p>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={userAnswers[ex.id] || ''}
                              onChange={(e) => setUserAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && evaluate(ex)}
                              placeholder="Type your answer..."
                              disabled={isChecked}
                              className="flex-1 px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary disabled:opacity-50"
                            />
                            {!isChecked ? (
                              <button onClick={() => evaluate(ex)} className="px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90">Check</button>
                            ) : (
                              <button onClick={() => toggleAnswer(ex.id)} className="px-3 py-2 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30">{showAnswers[ex.id] ? 'Hide' : 'Answer'}</button>
                            )}
                          </div>
                        </>
                      )}
                      {evaluated[ex.id] && (
                        <p className={`text-xs mt-2 font-bold ${
                          evaluated[ex.id] === 'correct' ? 'text-green-400' :
                          evaluated[ex.id] === 'close' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{evalLabel(ex.id)}</p>
                      )}
                      {showAnswers[ex.id] && (
                        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded">
                          <p className="text-sm text-green-400 font-medium">{ex.answer}</p>
                          {ex.grammarLink && (
                            <a href={ex.grammarLink} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary hover:underline">
                              <span className="material-symbols-outlined text-xs">link</span>
                              Grammar Reference
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
