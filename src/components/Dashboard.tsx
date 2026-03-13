import { useStore } from '@nanostores/react';
import { templatesStore, logsStore, markAsReviewed, getDueTemplates, getStats, loadTemplates, loadLogs } from '../lib/store';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const templates = useStore(templatesStore);
  const logs = useStore(logsStore);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, currentStreak: 0 });
  const [dueTemplates, setDueTemplates] = useState<ReturnType<typeof getDueTemplates>>([]);

  useEffect(() => {
    loadTemplates();
    loadLogs();
  }, []);

  useEffect(() => {
    setStats(getStats());
    setDueTemplates(getDueTemplates());
  }, [templates, logs]);

  useEffect(() => {
    const checkNotifications = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      if (Notification.permission === 'granted') {
        const due = getDueTemplates();
        if (due.length > 0) {
          new Notification('B2 Study Tracker', {
            body: `${due.length} session${due.length > 1 ? 's' : ''} due for review!`,
            icon: '/favicon.svg'
          });
        }
      }
    };
    if (Object.keys(templates).length > 0) {
      checkNotifications();
    }
  }, [templates]);

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
      {dueTemplates.length > 0 && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
          <div className="flex items-center gap-2 text-primary mb-3">
            <span className="material-symbols-outlined">warning</span>
            <h3 className="text-xs font-black uppercase tracking-widest">Due for Review ({dueTemplates.length})</h3>
          </div>
          <div className="space-y-2">
            {dueTemplates.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5">
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.skillArea} • {t.topic}</p>
                </div>
                <button onClick={() => markAsReviewed(t.id)} className="px-3 py-1.5 rounded bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90">
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
