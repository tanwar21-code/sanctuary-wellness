'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

interface Schedule { id: string; day: string; start_time: string; end_time: string; }

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const { dbUser } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [adding, setAdding] = useState(false);

  const fetchSchedules = () => {
    if (!dbUser) return;
    fetch(`/api/schedules?counsellorId=${dbUser.id}`).then(r => r.json()).then(d => { setSchedules(d.schedules || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchSchedules(); }, [dbUser]);

  const addSlot = async () => {
    if (!dbUser) return;
    setAdding(true);
    await fetch('/api/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ counsellor_id: dbUser.id, day, start_time: startTime, end_time: endTime }) });
    fetchSchedules();
    setAdding(false);
  };

  const deleteSlot = async (id: string) => {
    await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Schedule</h2>

      {/* Add Slot */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Add Availability</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Day</label>
            <select className="input-field" value={day} onChange={e => setDay(e.target.value)} style={{ minWidth: 140 }}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Start</label>
            <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>End</label>
            <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          <button onClick={addSlot} disabled={adding} className="btn-primary" style={{ padding: '12px 24px' }}>
            {adding ? 'Adding...' : '+ Add Slot'}
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {schedules.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📅</div>
            <h3 style={{ fontWeight: 700 }}>No Schedule Set</h3>
            <p style={{ color: 'var(--text-muted)' }}>Add your availability above.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-accent)' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Day</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Start Time</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>End Time</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600, fontSize: '0.9rem' }}>{s.day}</td>
                  <td style={{ padding: '12px 20px', fontSize: '0.9rem' }}>{s.start_time}</td>
                  <td style={{ padding: '12px 20px', fontSize: '0.9rem' }}>{s.end_time}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <button onClick={() => deleteSlot(s.id)} className="btn-danger" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
