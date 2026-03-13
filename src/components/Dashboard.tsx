import { useStore } from '@nanostores/react';
import { sessionsStore, markAsReviewed, getDueSessions, getStats } from '../lib/store';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const sessions = useStore(sessionsStore);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0, currentStreak: 0 });
  const [dueSessions, setDueSessions] = useState<ReturnType<typeof getDueSessions>>([]);

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
    checkNotifications();
  }, []);

  const recentSessions = Object.values(sessions).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  const upcomingReviews = Object.values(sessions).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)).slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ padding: '16px', background: '#f0f0f0', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Total Sessions</h3>
          <p style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>{stats.totalSessions}</p>
        </div>
        <div style={{ padding: '16px', background: '#f0f0f0', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Total Hours</h3>
          <p style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>{stats.totalHours}</p>
        </div>
        <div style={{ padding: '16px', background: '#f0f0f0', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Current Streak</h3>
          <p style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>{stats.currentStreak} days</p>
        </div>
      </div>

      {dueSessions.length > 0 && (
        <div style={{ padding: '16px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
          <h3>⚠️ Due for Review ({dueSessions.length})</h3>
          {dueSessions.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <div>
                <strong>{s.topic}</strong> ({s.skillArea}) - {s.source}
              </div>
              <button onClick={() => markAsReviewed(s.id)} style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Mark Reviewed
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3>Upcoming Reviews</h3>
        {upcomingReviews.map(s => (
          <div key={s.id} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
            <strong>{s.topic}</strong> ({s.skillArea}) - Review on: {s.nextReviewDate}
          </div>
        ))}
      </div>

      <div>
        <h3>Recent Sessions</h3>
        {recentSessions.map(s => (
          <div key={s.id} style={{ padding: '12px', marginBottom: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong>{s.topic}</strong>
              <span>{s.date}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {s.skillArea} • {s.duration}min • {s.exerciseCount} exercises • Confidence: {s.confidenceLevel}/5
            </div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>Source: {s.source}</div>
            {s.notes && <div style={{ fontSize: '14px', marginTop: '4px', fontStyle: 'italic' }}>{s.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
