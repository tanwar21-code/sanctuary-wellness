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

export default function StudentDashboard() {
  const { dbUser } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [recentMoods, setRecentMoods] = useState<Array<{ mood: string; created_at: string }>>([]);
  const quote = getTodayQuote();

  const greeting = new Date().getHours() < 12 ? 'Good morning!' : new Date().getHours() < 17 ? 'Good afternoon!' : 'Good evening!';

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

  // Get weekly mood data (last 7 days mapped to weekdays)
  const getWeeklyMoods = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const todayDayIndex = (today.getDay() + 6) % 7; // Mon=0
    const result: Array<{ day: string; emoji: string; isToday: boolean }> = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (todayDayIndex - i));
      const dateStr = date.toDateString();
      const entry = recentMoods.find(m => new Date(m.created_at).toDateString() === dateStr);
      result.push({
        day: days[i],
        emoji: entry ? moodEmoji(entry.mood) : '',
        isToday: i === todayDayIndex,
      });
    }
    return result;
  };

  const weeklyMoods = getWeeklyMoods();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* AI Greeting Card */}
      <div className="animate-slideUp stagger-1" style={{ background: 'var(--bg-accent)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--sage-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{greeting}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
            {selectedMood === 'stressed' || selectedMood === 'overwhelmed' || selectedMood === 'sad'
              ? "It seems like you're going through a tough time. How can I support you right now?"
              : "You're doing great. How can I support you right now?"}
          </p>
          <Link href="/student/ai-support" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 20px' }}>
            Start Chat →
          </Link>
        </div>
      </div>

      {/* Mood Check-In */}
      <div className="glass-card animate-slideUp stagger-2" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>How are you feeling?</h3>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {moodOptions.map(m => (
            <button key={m.value} className={`mood-btn ${selectedMood === m.value ? 'selected' : ''}`} onClick={() => saveMood(m.value)} style={{ flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>{m.label}</span>
            </button>
          ))}
        </div>
        {moodSaved && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--sage-dark)', fontWeight: 500, textAlign: 'center' }}>✅ Mood saved!</p>}
      </div>

      {/* Quick Actions - Stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/student/ai-support" className="animate-slideUp stagger-3" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--sage-dark)" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>AI Support</span>
          </div>
        </Link>

        <Link href="/student/counsellors" className="animate-slideUp stagger-4" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--sage-dark)" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Find Counselor</span>
          </div>
        </Link>

        <Link href="/student/resources" className="animate-slideUp stagger-5" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--bg-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="var(--sage-dark)" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Resources</span>
          </div>
        </Link>
      </div>

      {/* Daily Quote */}
      <div className="animate-slideUp stagger-6" style={{ background: 'var(--bg-accent)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--sage-dark)', lineHeight: 1 }}>99</span>
        <p style={{ fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6, marginTop: 8, color: 'var(--text-primary)' }}>
          &ldquo;{quote.text}&rdquo;
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>— {quote.author}</p>
      </div>

      {/* Recent Moods */}
      <div className="glass-card animate-slideUp stagger-7" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Moods</h3>
          <Link href="/student/mood-tracker" style={{ fontSize: '0.85rem', color: 'var(--sage-dark)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
        </div>
        <div className="week-mood-row">
          {weeklyMoods.map((d, i) => (
            <div key={i} className={`day-item animate-slideUp stagger-${i > 0 && i < 10 ? i : 8}`}>
              <div className={`day-emoji ${d.isToday ? 'today' : ''}`}>
                {d.emoji || '·'}
              </div>
              <span className="day-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
