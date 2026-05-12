'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

interface Request { id: string; student_name: string; message: string; contact_number: string; status: string; created_at: string; }

export default function SessionsPage() {
  const { dbUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/requests?counsellorId=${dbUser.id}`).then(r => r.json()).then(d => { setRequests(d.requests || []); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [dbUser]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const grouped = {
    accepted: requests.filter(r => r.status === 'accepted'),
    pending: requests.filter(r => r.status === 'pending'),
    completed: requests.filter(r => r.status === 'completed'),
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Sessions</h2>

      {Object.entries(grouped).map(([status, items]) => (
        <div key={status} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${status}`}>{status}</span> ({items.length})
          </h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }} className="animate-slideUp">No {status} sessions.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {items.map((r, index) => (
                <div key={r.id} className={`glass-card animate-slideUp stagger-${(index % 10) + 1}`} style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.student_name || 'Student'}</h4>
                    <span className={`badge badge-${r.status}`}>{r.status}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{r.message}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>📞 {r.contact_number} · {new Date(r.created_at).toLocaleDateString()}</p>
                  {status === 'accepted' && <button onClick={() => updateStatus(r.id, 'completed')} className="btn-success" style={{ fontSize: '0.85rem', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>✓ Complete</button>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
