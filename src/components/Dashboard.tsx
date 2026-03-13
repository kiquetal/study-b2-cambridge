import { useStore } from '@nanostores/react';
import { sessionsStore, logsStore, markAsReviewed, getDueSessions, getStats, loadSessions, loadLogs } from '../lib/store';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const sessions = useStore(sessionsStore);
  const logs = useStore(logsStore);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, currentStreak: 0 });
  const [dueSessions, setDueSessions] = useState<ReturnType<typeof getDueSessions>>([]);

  useEffect(() => {
    loadSessions();
    loadLogs();
  }, []);

  useEffect(() => {
    setStats(getStats());
    setDueSessions(getDueSessions());
  }, [sessions, logs]);

  useEffect(() => {
    const checkNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      if (Notification.permission === 'granted') {
        const due = getDueSessions();
        if (due.length > 0) {
          new Notification('B2 Study Tracker', {
            body: `${due.length} session${due.length > 1 ? 's' : ''} due for review!`,
            icon: '/favicon.svg'
          });
        }
      }
    };
    if (Object.keys(sessions).length > 0) {
      checkNotifications();
    }
  }, [sessions]);

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
    </div>
  );
}
