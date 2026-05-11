'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

interface Request { id: string; student_name: string; student_image: string; message: string; contact_number: string; status: string; created_at: string; }

export default function InboxPage() {
  const { dbUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Request | null>(null);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/requests?counsellorId=${dbUser.id}`).then(r => r.json()).then(d => { setRequests(d.requests || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [dbUser]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Inbox</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Manage student support requests.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'pending', 'accepted', 'completed', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '0.85rem', textTransform: 'capitalize' }}>
            {f} {f !== 'all' ? `(${requests.filter(r => r.status === f).length})` : `(${requests.length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* List */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📥</div>
              <h3 style={{ fontWeight: 700 }}>No Requests</h3>
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} onClick={() => setSelected(r)} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: selected?.id === r.id ? 'var(--bg-accent)' : 'transparent', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.student_name || 'Student'}</span>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.message.slice(0, 80)}{r.message.length > 80 ? '...' : ''}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="glass-card" style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{selected.student_name || 'Student'}</h3>
            <span className={`badge badge-${selected.status}`} style={{ marginBottom: 16, display: 'inline-block' }}>{selected.status}</span>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Concern</label>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{selected.message}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Contact Number</label>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>📞 {selected.contact_number}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Received</label>
              <p style={{ fontSize: '0.85rem' }}>{new Date(selected.created_at).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selected.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(selected.id, 'accepted')} className="btn-success">✅ Accept</button>
                  <button onClick={() => updateStatus(selected.id, 'rejected')} className="btn-danger">✕ Reject</button>
                </>
              )}
              {selected.status === 'accepted' && <button onClick={() => updateStatus(selected.id, 'completed')} className="btn-primary">✓ Mark Completed</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
