'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

interface Notification { id: string; title: string; message: string; is_read: boolean; created_at: string; }

export default function CounsellorNotificationsPage() {
  const { dbUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/notifications?userId=${dbUser.id}`).then(r => r.json()).then(d => { setNotifications(d.notifications || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [dbUser]);

  const markRead = async (ids: string[]) => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n));
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notifications</h2>
        <button onClick={() => markRead(notifications.filter(n => !n.is_read).map(n => n.id))} className="btn-ghost">Mark all read</button>
      </div>
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontWeight: 700 }}>No Notifications</h3>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`} onClick={() => !n.is_read && markRead([n.id])} style={{ cursor: !n.is_read ? 'pointer' : 'default' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{n.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{n.message}</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(n.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
