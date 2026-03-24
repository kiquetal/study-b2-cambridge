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

  const loadStats = (sid: string) => {
    fetch(`/api/exercise-stats?sessionId=${sid}`).then(r => r.json()).then(setStats);
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
          let maxAttempt = 1;
          for (const a of attempts) {
            answers[a.exerciseId] = a.userAnswer;
            results[a.exerciseId] = a.result as 'correct' | 'close' | 'wrong';
            shown[a.exerciseId] = true;
            if (a.attemptNumber > maxAttempt) maxAttempt = a.attemptNumber;
          }
          setUserAnswers(answers);
          setEvaluated(results);
          setShowAnswers(shown);
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
      setAttemptNumber(1);
      setStats(null);
      setShowStats(false);
    }
  }, [selectedSession]);

  const toggleAnswer = (id: string) => setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const evaluate = (ex: Exercise) => {
    const user = (userAnswers[ex.id] || '').trim().toLowerCase();
    const correct = ex.answer.toLowerCase();
    if (!user) return;
    let result: 'correct' | 'close' | 'wrong';
    if (correct.includes(user) || user.includes(correct.split('(')[0].trim().toLowerCase())) {
      result = 'correct';
    } else {
      const userWords = user.split(/\s+/);
      const correctWords = correct.split(/\s+/);
      const matches = userWords.filter(w => correctWords.some(cw => cw.includes(w) || w.includes(cw)));
      result = matches.length >= correctWords.length * 0.4 ? 'close' : 'wrong';
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
                  {exs.map((ex, i) => (
                    <div key={ex.id} className={`p-4 rounded-lg bg-black/60 border transition-colors ${evalColor(ex.id)}`}>
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
                          disabled={!!evaluated[ex.id]}
                          className="flex-1 px-3 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary disabled:opacity-50"
                        />
                        {!evaluated[ex.id] ? (
                          <button
                            onClick={() => evaluate(ex)}
                            className="px-4 py-2 bg-primary text-white rounded text-[10px] font-bold uppercase hover:opacity-90"
                          >
                            Check
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleAnswer(ex.id)}
                            className="px-3 py-2 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30"
                          >
                            {showAnswers[ex.id] ? 'Hide' : 'Answer'}
                          </button>
                        )}
                      </div>
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
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
