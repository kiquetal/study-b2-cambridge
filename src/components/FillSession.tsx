import { useStore } from '@nanostores/react';
import { sessionsStore, logsStore, loadSessions, loadLogs, addLog } from '../lib/store';
import { useEffect, useState } from 'react';

export default function FillSession() {
  const sessions = useStore(sessionsStore);
  const logs = useStore(logsStore);
  const [selectedSession, setSelectedSession] = useState('');
  const [duration, setDuration] = useState('');
  const [exerciseCount, setExerciseCount] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('3');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadSessions();
    loadLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLog({
      sessionId: selectedSession,
      date: new Date().toISOString().split('T')[0],
      duration: parseInt(duration),
      exerciseCount: parseInt(exerciseCount),
      confidenceLevel: parseInt(confidenceLevel),
      notes,
    });
    setDuration('');
    setExerciseCount('');
    setConfidenceLevel('3');
    setNotes('');
  };

  const sessionList = Object.values(sessions)
    .filter(s => !filter || s.title.toLowerCase().includes(filter.toLowerCase()) || s.topic.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  
  const selectedSessionData = sessions[selectedSession];

  return (
    <div className="flex gap-8 h-full">
      {/* Left: Session List */}
      <div className="w-80 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Select Session</h2>
          <p className="text-sm text-slate-400 mb-4">Choose which session you just studied</p>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter sessions..."
          className="w-full px-4 py-2 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary"
        />

        {sessionList.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No sessions created yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {sessionList.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSession(s.id)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedSession === s.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-black/40 border-primary/20 hover:border-primary/40'
                }`}
              >
                <p className="font-bold text-sm text-slate-100">{s.title}</p>
                <p className="text-xs text-slate-500 mt-1">{s.skillArea} • {s.topic}</p>
                <p className="text-xs text-slate-600 mt-1">{s.createdDate}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Form */}
      <div className="flex-1">
        {!selectedSession ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-30">arrow_back</span>
              <p className="text-sm">Select a session to fill</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 h-full">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">{selectedSessionData?.title}</h2>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded text-sm text-slate-400">
                <p><strong className="text-primary">Skill:</strong> {selectedSessionData?.skillArea}</p>
                <p className="mt-1"><strong className="text-primary">Topics:</strong> {selectedSessionData?.topic}</p>
                <p className="mt-1"><strong className="text-primary">Source:</strong> {selectedSessionData?.source}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Duration (min)</span>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  min="1"
                  placeholder="45"
                  className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Exercises</span>
                <input
                  type="number"
                  value={exerciseCount}
                  onChange={(e) => setExerciseCount(e.target.value)}
                  required
                  min="0"
                  placeholder="10"
                  className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Confidence (1-5)</span>
                <input
                  type="number"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(e.target.value)}
                  required
                  min="1"
                  max="5"
                  placeholder="4"
                  className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary transition-colors"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 flex-1">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="What did you learn today?"
                className="w-full px-4 py-2.5 bg-black/60 border border-primary/20 rounded text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none transition-colors"
              />
            </label>

            <button
              type="submit"
              className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded hover:opacity-90 transition-opacity"
            >
              Save Study Log
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
