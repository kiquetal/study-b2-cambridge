import { useStore } from '@nanostores/react';
import { sessionsStore, logsStore, loadSessions, loadLogs } from '../lib/store';
import { useEffect } from 'react';

export default function RecentSessions() {
  const sessions = useStore(sessionsStore);
  const logs = useStore(logsStore);

  useEffect(() => {
    loadSessions();
    loadLogs();
  }, []);

  const logsList = Object.values(logs);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-primary mb-2">
        <span className="material-symbols-outlined text-sm">history</span>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Study Log History</h3>
      </div>

      {logsList.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">inbox</span>
          <p className="text-sm">No study logs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logsList.map(log => {
            const session = sessions[log.sessionId];
            return (
              <div key={log.id} className="p-5 rounded-lg bg-black/60 border border-primary/20 hover:border-primary/40 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-black text-xl text-slate-100 uppercase tracking-tight mb-1">
                      {session?.title || 'Unknown Session'}
                    </p>
                    {session && (
                      <>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {session.topics.map((topic, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              {topic}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">Skill: {session.skillArea}</p>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-primary/60 font-mono">{log.date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary font-bold">{log.duration}min</span>
                  <span>{log.exerciseCount} exercises</span>
                  <span>Confidence: {log.confidenceLevel}/5</span>
                </div>
                {session && <p className="text-xs text-slate-400">Source: {session.source}</p>}
                {log.notes && <p className="text-xs text-slate-400 mt-2 italic border-l-2 border-primary/20 pl-3">{log.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
