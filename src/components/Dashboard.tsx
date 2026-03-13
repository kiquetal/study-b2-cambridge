import { useStore } from '@nanostores/react';
import { sessionsStore, markAsReviewed, getDueSessions, getStats, loadSessions } from '../lib/store';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const sessions = useStore(sessionsStore);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, currentStreak: 0 });
  const [dueSessions, setDueSessions] = useState<ReturnType<typeof getDueSessions>>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    setStats(getStats());
    setDueSessions(getDueSessions());
  }, [sessions]);

  useEffect(() => {
    const checkNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      if (Notification.permission === 'granted') {
        const due = getDueSessions();
        if (due.length > 0) {
          new Notification('B2 Study Tracker', {
            body: `${due.length} topic${due.length > 1 ? 's' : ''} due for review!`,
            icon: '/favicon.svg'
          });
        }
      }
    };
    if (Object.keys(sessions).length > 0) {
      checkNotifications();
    }
  }, [sessions]);

  const recentSessions = Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Sessions</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.totalSessions}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Hours</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.totalHours}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Streak</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.currentStreak}<span className="text-sm ml-1">days</span></p>
        </div>
      </div>

      {/* Due for Review */}
      {dueSessions.length > 0 && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
          <div className="flex items-center gap-2 text-primary mb-3">
            <span className="material-symbols-outlined">warning</span>
            <h3 className="text-xs font-black uppercase tracking-widest">Due for Review ({dueSessions.length})</h3>
          </div>
          <div className="space-y-2">
            {dueSessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.skillArea} • {s.topic}</p>
                </div>
                <button onClick={() => markAsReviewed(s.id)} className="px-3 py-1.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90">
                  Mark Reviewed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Recent Sessions</h3>
        <div className="space-y-2">
          {recentSessions.map(s => (
            <div key={s.id} className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-900/30 border border-slate-200 dark:border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-1">Topics: {s.topic}</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{s.date}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{s.skillArea}</span>
                <span>{s.duration}min</span>
                <span>{s.exerciseCount} exercises</span>
                <span>Confidence: {s.confidenceLevel}/5</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Source: {s.source}</p>
              {s.notes && <p className="text-xs text-slate-400 mt-1 italic">{s.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
