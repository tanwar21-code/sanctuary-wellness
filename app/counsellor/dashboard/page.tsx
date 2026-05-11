'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Request { id: string; student_name: string; student_image: string; message: string; contact_number: string; status: string; created_at: string; }
interface Schedule { id: string; day: string; start_time: string; end_time: string; }

export default function CounsellorDashboard() {
  const { dbUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<{id: string}[]>([]);
  const [resources, setResources] = useState<{id: string}[]>([]);

  useEffect(() => {
    if (!dbUser) return;
    fetch(`/api/requests?counsellorId=${dbUser.id}`).then(r => r.json()).then(d => setRequests(d.requests || [])).catch(() => {});
    fetch(`/api/schedules?counsellorId=${dbUser.id}`).then(r => r.json()).then(d => setSchedules(d.schedules || [])).catch(() => {});
    fetch(`/api/notifications?userId=${dbUser.id}`).then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {});
    fetch('/api/resources').then(r => r.json()).then(d => setResources((d.resources || []).filter((r: {created_by: string}) => r.created_by === dbUser.id))).catch(() => {});
  }, [dbUser]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeCount = requests.filter(r => r.status === 'accepted').length;

  const stats = [
    { icon: '📩', label: 'Pending Requests', value: pendingCount, color: '#f59e0b' },
    { icon: '✅', label: 'Active Sessions', value: activeCount, color: '#10b981' },
    { icon: '📚', label: 'Resources Shared', value: resources.length, color: '#8b5cf6' },
    { icon: '🔔', label: 'Notifications', value: notifications.length, color: '#0ea5e9' },
  ];

  const todayDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const todaySchedule = schedules.filter(s => s.day === todayDay);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="animate-fadeIn">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Recent Requests */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📩 Recent Requests</h3>
            <Link href="/counsellor/inbox" style={{ fontSize: '0.85rem', color: 'var(--lavender-dark)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {requests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No requests yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.slice(0, 4).map(r => (
                <div key={r.id} style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.student_name || 'Student'}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.message.slice(0, 50)}...</p>
                  </div>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today Schedule */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📅 Today&apos;s Schedule ({todayDay})</h3>
          {todaySchedule.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sessions scheduled for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todaySchedule.map((s, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.2rem' }}>🕐</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.start_time} — {s.end_time}</span>
                </div>
              ))}
            </div>
          )}
          <Link href="/counsellor/schedule" style={{ display: 'inline-block', marginTop: 12, fontSize: '0.85rem', color: 'var(--lavender-dark)', fontWeight: 600, textDecoration: 'none' }}>Manage Schedule →</Link>
        </div>

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/counsellor/resources" className="btn-secondary" style={{ justifyContent: 'center' }}>📚 Add Resource</Link>
            <Link href="/counsellor/inbox" className="btn-secondary" style={{ justifyContent: 'center' }}>📥 View Inbox</Link>
            <Link href="/counsellor/schedule" className="btn-secondary" style={{ justifyContent: 'center' }}>📅 Manage Schedule</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
