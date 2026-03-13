import { useStore } from '@nanostores/react';
import { sessionsStore, loadSessions } from '../lib/store';
import { useEffect } from 'react';

export default function RecentSessions() {
  const sessions = useStore(sessionsStore);

  useEffect(() => {
    loadSessions();
  }, []);

  const recentSessions = Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-primary mb-2">
        <span className="material-symbols-outlined text-sm">history</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Session History</h3>
      </div>

      {recentSessions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inbox</span>
          <p className="text-sm">No sessions recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentSessions.map(s => (
            <div key={s.id} className="p-5 rounded-lg bg-black/60 border border-primary/20 hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-black text-xl text-slate-100 uppercase tracking-tight mb-1">{s.title}</p>
                  <p className="text-xs text-slate-500">Topics: {s.topic}</p>
                </div>
                <span className="text-xs text-primary/60 font-mono">{s.date}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="px-2 py-1 rounded bg-primary/10 text-primary font-bold">{s.skillArea}</span>
                <span>{s.duration}min</span>
                <span>{s.exerciseCount} exercises</span>
                <span>Confidence: {s.confidenceLevel}/5</span>
              </div>
              <p className="text-xs text-slate-400">Source: {s.source}</p>
              {s.notes && <p className="text-xs text-slate-400 mt-2 italic border-l-2 border-primary/20 pl-3">{s.notes}</p>}
              <div className="mt-3 pt-3 border-t border-primary/10 text-[10px] text-primary/40 font-mono">
                Next Review: {s.nextReviewDate} • Review #{s.reviewCount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
