'use client';

import Loader from '@/components/Loader';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { extractVideoId, getThumbnailUrl } from '@/lib/youtube';

interface Resource { id: string; title: string; description: string; type: string; category: string; content: string; youtube_url: string; thumbnail_url: string; created_at: string; }

const categories = ['All', 'Stress', 'Anxiety', 'Motivation', 'Sleep', 'Productivity', 'Relationships'];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('All');

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(d => { setResources(d.resources || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (catFilter !== 'All' && r.category !== catFilter) return false;
    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Resources</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Explore articles and videos for your mental wellness.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'article', 'video'].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={typeFilter === t ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            {t === 'all' ? '📋 All' : t === 'article' ? '📝 Articles' : '🎥 Videos'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: catFilter === c ? 'var(--sage-dark)' : 'var(--bg-accent)', color: catFilter === c ? 'white' : 'var(--text-secondary)', border: 'none', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card animate-slideUp" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📚</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No Resources Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Resources will be added by counsellors soon.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((r, index) => {
            const videoId = r.youtube_url ? extractVideoId(r.youtube_url) : null;
            const thumb = r.thumbnail_url || (videoId ? getThumbnailUrl(videoId) : null);
            return (
              <Link key={r.id} href={`/student/resources/${r.id}`} className={`animate-slideUp stagger-${(index % 10) + 1}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', height: '100%' }}>
                  {r.type === 'video' && thumb && (
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                      <img src={thumb} alt={r.title} loading="lazy" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20 }}>▶</div>
                    </div>
                  )}
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <span className="badge" style={{ background: r.type === 'video' ? '#dbeafe' : 'var(--sage-light)', color: r.type === 'video' ? '#1e40af' : 'var(--sage-dark)', fontSize: '0.7rem' }}>
                        {r.type === 'video' ? '🎥 Video' : '📝 Article'}
                      </span>
                      {r.category && <span className="badge" style={{ background: '#f0fdf4', color: '#166534', fontSize: '0.7rem' }}>{r.category}</span>}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{r.title}</h3>
                    {r.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.description.slice(0, 100)}{r.description.length > 100 ? '...' : ''}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
