import { useStore } from '@nanostores/react';
import { sessionsStore, logsStore, markAsReviewed, getDueSessions, getStats, loadSessions, loadLogs } from '../lib/store';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const sessions = useStore(sessionsStore);
  const logs = useStore(logsStore);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, currentStreak: 0 });
  const [dueSessions, setDueSessions] = useState<ReturnType<typeof getDueSessions>>([]);
  const [weekComparison, setWeekComparison] = useState({
    thisWeek: { hours: 0, sessions: 0, exercises: 0, avgConfidence: 0 },
    lastWeek: { hours: 0, sessions: 0, exercises: 0, avgConfidence: 0 }
  });

  useEffect(() => {
    loadSessions();
    loadLogs();
  }, []);

  const calculateWeekComparison = () => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const allLogs = Object.values(logs);
    
    const thisWeekLogs = allLogs.filter(l => new Date(l.date) >= thisWeekStart);
    const lastWeekLogs = allLogs.filter(l => {
      const d = new Date(l.date);
      return d >= lastWeekStart && d <= lastWeekEnd;
    });

    const calcStats = (logsList: typeof allLogs) => ({
      hours: +(logsList.reduce((sum, l) => sum + l.duration, 0) / 60).toFixed(1),
      sessions: logsList.length,
      exercises: logsList.reduce((sum, l) => sum + l.exerciseCount, 0),
      avgConfidence: logsList.length > 0 
        ? +(logsList.reduce((sum, l) => sum + l.confidenceLevel, 0) / logsList.length).toFixed(1)
        : 0
    });

    setWeekComparison({
      thisWeek: calcStats(thisWeekLogs),
      lastWeek: calcStats(lastWeekLogs)
    });
  };

  useEffect(() => {
    setStats(getStats());
    setDueSessions(getDueSessions());
    calculateWeekComparison();
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

  const ComparisonCard = ({ title, thisWeek, lastWeek, unit = '' }: any) => {
    const diff = thisWeek - lastWeek;
    const percentChange = lastWeek > 0 ? ((diff / lastWeek) * 100).toFixed(0) : 0;
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    return (
      <div className="p-5 rounded-lg bg-black/60 border border-primary/20">
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3">{title}</p>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">This Week</p>
            <p className="text-3xl font-black text-slate-100">{thisWeek}{unit}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Last Week</p>
            <p className="text-xl font-bold text-slate-400">{lastWeek}{unit}</p>
          </div>
        </div>
        {!isNeutral && (
          <div className={`flex items-center gap-2 text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <span className="material-symbols-outlined text-sm">{isPositive ? 'trending_up' : 'trending_down'}</span>
            <span>{isPositive ? '+' : ''}{diff}{unit}</span>
            {lastWeek > 0 && <span>({isPositive ? '+' : ''}{percentChange}%)</span>}
          </div>
        )}
        {isNeutral && <div className="text-xs text-slate-600">No change</div>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Week Comparison */}
      <div>
        <div className="flex items-center gap-2 text-primary mb-4">
          <span className="material-symbols-outlined text-sm">compare_arrows</span>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em]">This Week vs Last Week</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <ComparisonCard 
            title="Study Hours" 
            thisWeek={weekComparison.thisWeek.hours} 
            lastWeek={weekComparison.lastWeek.hours}
            unit="h"
          />
          <ComparisonCard 
            title="Sessions" 
            thisWeek={weekComparison.thisWeek.sessions} 
            lastWeek={weekComparison.lastWeek.sessions}
          />
          <ComparisonCard 
            title="Exercises" 
            thisWeek={weekComparison.thisWeek.exercises} 
            lastWeek={weekComparison.lastWeek.exercises}
          />
          <ComparisonCard 
            title="Avg Confidence" 
            thisWeek={weekComparison.thisWeek.avgConfidence} 
            lastWeek={weekComparison.lastWeek.avgConfidence}
            unit="/5"
          />
        </div>
      </div>

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
                  <p className="text-xs text-slate-500 mb-1">{s.skillArea}</p>
                  <div className="flex flex-wrap gap-1">
                    {s.topics.map((topic, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {topic}
                      </span>
                    ))}
                  </div>
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
