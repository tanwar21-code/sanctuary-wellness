'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTodayQuote } from '@/lib/quotes';

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'stressed', emoji: '😔', label: 'Stressed' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'overwhelmed', emoji: '😰', label: 'Overwhelmed' },
];

const quickActions = [
  { icon: '🤖', title: 'Talk to AI', desc: 'Get instant support', href: '/student/ai-support', color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { icon: '👨‍⚕️', title: 'Find Counsellor', desc: 'Professional help', href: '/student/counsellors', color: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)' },
  { icon: '📚', title: 'Resources', desc: 'Explore content', href: '/student/resources', color: 'linear-gradient(135deg, #10b981, #6ee7b7)' },
];

export default function StudentDashboard() {
  const { dbUser } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [recentMoods, setRecentMoods] = useState<Array<{ mood: string; created_at: string }>>([]);
  const quote = getTodayQuote();

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/mood?userId=${dbUser.id}`)
        .then(r => r.json())
        .then(d => setRecentMoods(d.entries || []))
        .catch(() => {});
    }
  }, [dbUser]);

  const saveMood = async (mood: string) => {
    setSelectedMood(mood);
    if (!dbUser) return;
    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: dbUser.id, mood }),
      });
      setMoodSaved(true);
      setTimeout(() => setMoodSaved(false), 3000);
    } catch {}
  };

  const moodEmoji = (mood: string) => moodOptions.find(m => m.value === mood)?.emoji || '😐';

  return (
    <div className="animate-fadeIn">
      {/* Mood Check-In */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>How are you feeling today?</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {moodOptions.map(m => (
            <button key={m.value} className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`} onClick={() => saveMood(m.value)} style={{ flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '1.6rem' }}>{m.emoji}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>{m.label}</span>
            </button>
          ))}
        </div>
        {moodSaved && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--mint-dark)', fontWeight: 500 }}>✅ Mood saved!</p>}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {quickActions.map((a, i) => (
          <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 24, cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 0, background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12, boxShadow: 'none' }}>
                {a.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{a.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* AI Companion */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 0, background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧠</div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Companion</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--mint-dark)' }}>● Available</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg-accent)', borderRadius: '0', padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {selectedMood === 'stressed' || selectedMood === 'overwhelmed' || selectedMood === 'sad'
                ? "It seems like you're going through a tough time. Want to talk about it? 💙"
                : "Hey there! I'm here whenever you need to talk. How can I help you today? 😊"}
            </p>
          </div>
          <Link href="/student/ai-support" className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
            Start Chat →
          </Link>
        </div>

        {/* Daily Quote */}
        <div className="glass-card" style={{ padding: 24, background: 'var(--gradient-card)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--lavender-dark)', marginBottom: 16 }}>💜 Daily Inspiration</h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 12, color: 'var(--text-primary)' }}>
            &ldquo;{quote.text}&rdquo;
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>— {quote.author}</p>
        </div>

        {/* Recent Moods */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>📈 Recent Moods</h3>
          {recentMoods.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No mood entries yet. Start tracking!</p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {recentMoods.slice(0, 7).map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem' }}>{moodEmoji(m.mood)}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {new Date(m.created_at).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/student/mood-tracker" style={{ display: 'inline-block', marginTop: 12, fontSize: '0.85rem', color: 'var(--lavender-dark)', fontWeight: 600, textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
      </div>
    </div>
  );
}
