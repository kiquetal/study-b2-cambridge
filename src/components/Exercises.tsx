import { useStore } from '@nanostores/react';
import { sessionsStore, loadSessions } from '../lib/store';
import { useEffect, useState } from 'react';
import type { Exercise } from '../lib/types';

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
  const [filter, setFilter] = useState('');

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    if (selectedSession) {
      fetch(`/api/exercises?sessionId=${selectedSession}`)
        .then(r => r.json())
        .then(setExercises);
    } else {
      setExercises([]);
    }
  }, [selectedSession]);

  const toggleAnswer = (id: string) => setShowAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const sessionList = Object.values(sessions)
    .filter(s => !filter || s.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  const grouped = exercises.reduce((acc, ex) => {
    (acc[ex.type] = acc[ex.type] || []).push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Session List */}
      <div className="w-72 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Exercises</h2>
          <p className="text-sm text-slate-400">Select a session to view exercises</p>
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
              onClick={() => { setSelectedSession(s.id); setShowAnswers({}); }}
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
              <p className="text-xs text-slate-600 mt-2">Generate exercises via Kiro CLI: "Generate exercises from [session name]"</p>
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
          Object.entries(grouped).map(([type, exs]) => (
            <div key={type} className="mb-6">
              <div className="flex items-center gap-2 text-primary mb-3">
                <span className="material-symbols-outlined text-sm">school</span>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">{TYPE_LABELS[type] || type} ({exs.length})</h3>
              </div>
              <div className="space-y-3">
                {exs.map((ex, i) => (
                  <div key={ex.id} className="p-4 rounded-lg bg-black/60 border border-primary/20">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-slate-100 font-medium">
                        <span className="text-primary font-mono mr-2">{i + 1}.</span>
                        {ex.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => toggleAnswer(ex.id)}
                        className="px-3 py-1 bg-primary/20 text-primary rounded text-[10px] font-bold uppercase hover:bg-primary/30"
                      >
                        {showAnswers[ex.id] ? 'Hide Answer' : 'Show Answer'}
                      </button>
                      {ex.grammarLink && (
                        <a
                          href={ex.grammarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-[10px] font-bold uppercase hover:bg-slate-600 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">link</span>
                          Grammar Reference
                        </a>
                      )}
                    </div>
                    {showAnswers[ex.id] && (
                      <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded">
                        <p className="text-sm text-green-400 font-medium">{ex.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
