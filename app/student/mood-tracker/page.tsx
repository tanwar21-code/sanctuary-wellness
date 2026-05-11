'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#0ea5e9' },
  { value: 'stressed', emoji: '😔', label: 'Stressed', color: '#f59e0b' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: '#8b5cf6' },
  { value: 'overwhelmed', emoji: '😰', label: 'Overwhelmed', color: '#ef4444' },
];

interface MoodEntry { id: string; mood: string; note: string; created_at: string; }

export default function MoodTrackerPage() {
  const { dbUser } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchMoods = () => {
    if (!dbUser) return;
    fetch(`/api/mood?userId=${dbUser.id}`).then(r => r.json()).then(d => { setEntries(d.entries || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchMoods(); }, [dbUser]);

  const saveMood = async () => {
    if (!selectedMood || !dbUser) return;
    setSaving(true);
    try {
      await fetch('/api/mood', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: dbUser.id, mood: selectedMood, note: note || null }) });
      setSaved(true); setSelectedMood(''); setNote('');
      fetchMoods();
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const moodEmoji = (m: string) => moodOptions.find(o => o.value === m)?.emoji || '😐';
  const moodColor = (m: string) => moodOptions.find(o => o.value === m)?.color || '#ccc';

  // Simple week chart data
  const last7 = entries.slice(0, 7).reverse();
  const moodValues: Record<string, number> = { happy: 5, okay: 4, stressed: 3, sad: 2, overwhelmed: 1 };

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Mood Tracker</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Track your emotional wellbeing and discover patterns.</p>

      {/* Log Mood */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>How are you feeling right now?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {moodOptions.map(m => (
            <button key={m.value} className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`} onClick={() => setSelectedMood(m.value)} style={{ flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '1.6rem' }}>{m.emoji}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>{m.label}</span>
            </button>
          ))}
        </div>
        <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note about how you're feeling (optional)..." rows={2} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={saveMood} disabled={!selectedMood || saving} className="btn-primary" style={{ opacity: !selectedMood ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
          {saved && <span style={{ color: 'var(--mint-dark)', fontWeight: 500, fontSize: '0.9rem' }}>✅ Saved!</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* Weekly Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>📊 Weekly Overview</h3>
          {last7.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Start logging to see your chart!</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
              {last7.map((e, i) => {
                const val = moodValues[e.mood] || 3;
                const height = (val / 5) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '1.2rem' }}>{moodEmoji(e.mood)}</span>
                    <div style={{ width: '100%', maxWidth: 40, height: `${height}%`, borderRadius: 'var(--radius-md)', background: moodColor(e.mood), transition: 'height 0.5s ease', minHeight: 8 }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{new Date(e.created_at).toLocaleDateString('en', { weekday: 'short' })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📋 Recent Entries</h3>
          {entries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No entries yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {entries.slice(0, 15).map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: i % 2 === 0 ? 'var(--bg-accent)' : 'transparent' }}>
                  <span style={{ fontSize: '1.3rem' }}>{moodEmoji(e.mood)}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{e.mood}</span>
                    {e.note && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{e.note}</p>}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
