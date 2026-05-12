'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect, useMemo } from 'react';

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy', color: '#5B7553', category: 'positive' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#8fa888', category: 'neutral' },
  { value: 'stressed', emoji: '😔', label: 'Stressed', color: '#c9a96e', category: 'low' },
  { value: 'sad', emoji: '😢', label: 'Sad', color: '#b8857a', category: 'low' },
  { value: 'overwhelmed', emoji: '😰', label: 'Overwhelmed', color: '#d4a0a0', category: 'low' },
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
  const [showLogForm, setShowLogForm] = useState(false);

  const [showBreathing, setShowBreathing] = useState(false);

  const fetchMoods = () => {
    if (!dbUser) return;
    fetch(`/api/mood?userId=${dbUser.id}`)
      .then(r => r.json())
      .then(d => { setEntries(d.entries || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMoods(); }, [dbUser]);

  const saveMood = async () => {
    if (!selectedMood || !dbUser) return;
    setSaving(true);
    try {
      await fetch('/api/mood', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: dbUser.id, mood: selectedMood, note: note || null }) });
      setSaved(true); setSelectedMood(''); setNote(''); setShowLogForm(false);
      fetchMoods();
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const moodEmoji = (m: string) => moodOptions.find(o => o.value === m)?.emoji || '😐';
  const moodColor = (m: string) => moodOptions.find(o => o.value === m)?.color || '#ccc';
  const moodCategory = (m: string) => moodOptions.find(o => o.value === m)?.category || 'neutral';

  // Analytics: This Week
  const weeklyMoods = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const todayDayIndex = (today.getDay() + 6) % 7;
    const result: Array<{ day: string; emoji: string; mood: string; isToday: boolean }> = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (todayDayIndex - i));
      const dateStr = date.toDateString();
      const entry = entries.find(m => new Date(m.created_at).toDateString() === dateStr);
      result.push({ day: days[i], emoji: entry ? moodEmoji(entry.mood) : '', mood: entry?.mood || '', isToday: i === todayDayIndex });
    }
    return result;
  }, [entries]);

  // Analytics: Insights
  const insights = useMemo(() => {
    if (entries.length === 0) return null;
    const counts: Record<string, number> = {};
    let positive = 0, neutral = 0, low = 0;
    entries.forEach(e => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
      const cat = moodCategory(e.mood);
      if (cat === 'positive') positive++;
      else if (cat === 'neutral') neutral++;
      else low++;
    });
    const total = entries.length;
    const mostFrequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const moodLabel = mostFrequent[0].charAt(0).toUpperCase() + mostFrequent[0].slice(1);
    return {
      mostFrequent: moodLabel,
      totalEntries: total,
      positivePercent: Math.round((positive / total) * 100),
      neutralPercent: Math.round((neutral / total) * 100),
      lowPercent: Math.round((low / total) * 100),
    };
  }, [entries]);

  // Analytics: Last 30 Days bar chart
  const last30Days = useMemo(() => {
    const moodValues: Record<string, number> = { happy: 5, okay: 4, stressed: 3, sad: 2, overwhelmed: 1 };
    const today = new Date();
    const result: Array<{ date: Date; value: number; color: string; label: string }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toDateString();
      const entry = entries.find(m => new Date(m.created_at).toDateString() === dateStr);
      result.push({
        date,
        value: entry ? moodValues[entry.mood] || 3 : 0,
        color: entry ? moodColor(entry.mood) : 'transparent',
        label: date.getDate() === 1 || date.getDate() === 15 || i === 29 || i === 0
          ? `${date.getDate()}${date.getDate() === 1 ? 'st' : date.getDate() === 15 ? 'th' : date.getDate() === 30 || date.getDate() === 31 ? 'th' : ''}`
          : '',
      });
    }
    return result;
  }, [entries]);

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero Card */}
      <div style={{ background: 'var(--bg-accent)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>How is your heart today?</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20, maxWidth: 300, margin: '0 auto 20px' }}>
          Taking a moment to check in builds emotional resilience. No judgment, just observation.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowLogForm(true)} className="btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
            + Log Mood
          </button>
          <button onClick={() => setShowBreathing(true)} className="btn-secondary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
            Take a deep breath
          </button>
        </div>
        {saved && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--sage-dark)', fontWeight: 500 }}>✅ Mood logged!</p>}
      </div>

      {/* Breathing Exercise Modal */}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

      {/* Log Mood Form (expandable) */}
      {showLogForm && (
        <div className="glass-card" style={{ padding: 24, animation: 'slideUp 0.3s ease-out' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>How are you feeling right now?</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            {moodOptions.map(m => (
              <button key={m.value} className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`} onClick={() => setSelectedMood(m.value)} style={{ flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>{m.label}</span>
              </button>
            ))}
          </div>
          <textarea className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)..." rows={2} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={saveMood} disabled={!selectedMood || saving} className="btn-primary" style={{ opacity: !selectedMood ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
            <button onClick={() => setShowLogForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* This Week */}
      <div className="glass-card animate-slideUp stagger-1" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>This Week</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>A gentle rhythm of your days.</p>
          </div>
          <button onClick={() => {}} style={{ fontSize: '0.8rem', color: 'var(--sage-dark)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>View History</button>
        </div>
        <div className="week-mood-row" style={{ marginTop: 16 }}>
          {weeklyMoods.map((d, i) => (
            <div key={i} className={`day-item animate-slideUp stagger-${(i % 10) + 1}`}>
              <span className="day-label">{d.day}</span>
              <div className={`day-emoji ${d.isToday ? 'today' : ''}`}>
                {d.emoji || '·'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight */}
      {insights && (
        <div className="glass-card animate-slideUp stagger-2" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--sage-dark)" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Insight</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Most frequent mood</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{insights.mostFrequent}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--sage-dark)', fontWeight: 600, background: 'var(--bg-accent)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>{insights.totalEntries} entries</span>
          </div>
          <div className="insight-progress" style={{ marginBottom: 12 }}>
            <div className="segment positive animate-slideUp stagger-3" style={{ width: `${insights.positivePercent}%` }} />
            <div className="segment neutral animate-slideUp stagger-4" style={{ width: `${insights.neutralPercent}%` }} />
            <div className="segment low animate-slideUp stagger-5" style={{ width: `${insights.lowPercent}%` }} />
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--sage-dark)', display: 'inline-block' }} />
              Positive
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: 'var(--sage-light)', display: 'inline-block' }} />
              Neutral
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: '#d4a0a0', display: 'inline-block' }} />
              Low
            </span>
          </div>
        </div>
      )}

      {/* Last 30 Days */}
      <div className="glass-card animate-slideUp stagger-6" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Last 30 Days</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>The ebb and flow of your month.</p>
        <div className="mood-bar-chart">
          {last30Days.map((d, i) => (
            <div key={i} className={`bar-wrapper animate-slideUp stagger-${(i % 5) + 1}`}>
              <div
                className="bar"
                style={{
                  height: d.value > 0 ? `${(d.value / 5) * 100}%` : '4px',
                  background: d.value > 0 ? d.color : 'var(--cream-dark)',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1st</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>15th</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30th</span>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="glass-card animate-slideUp stagger-7" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📋 Recent Entries</h3>
        {entries.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No entries yet. Start logging your mood!</p>
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
  );
}

function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 7;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 8;
          } else {
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const duration = phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center', maxWidth: 400, background: 'var(--bg-primary)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>4-7-8 Breathing</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 32 }}>Follow the circle to relax your mind.</p>
        
        <div style={{ 
          width: 200, height: 200, margin: '0 auto 40px', borderRadius: '50%',
          background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: `transform ${duration}s linear`,
          transform: phase === 'inhale' ? 'scale(1.3)' : phase === 'hold' ? 'scale(1.3)' : 'scale(0.8)'
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: '50%', background: 'var(--sage-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            flexDirection: 'column',
            transform: phase === 'inhale' ? 'scale(0.77)' : phase === 'hold' ? 'scale(0.77)' : 'scale(1.25)',
            transition: `transform ${duration}s linear`,
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{phase}</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{timeLeft}</span>
          </div>
        </div>

        <button onClick={onClose} className="btn-secondary" style={{ width: '100%', borderRadius: 'var(--radius-full)' }}>Done</button>
      </div>
    </div>
  );
}
