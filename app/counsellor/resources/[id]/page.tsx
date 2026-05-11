'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { extractVideoId, getEmbedUrl, getThumbnailUrl } from '@/lib/youtube';

interface Resource { id: string; title: string; description: string; type: string; category: string; content: string; youtube_url: string; thumbnail_url: string; created_at: string; }

export default function CounsellorResourceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [related, setRelated] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resources/${id}`).then(r => r.json()).then(d => { setResource(d.resource); setLoading(false); }).catch(() => setLoading(false));
    fetch('/api/resources').then(r => r.json()).then(d => setRelated((d.resources || []).filter((r: Resource) => r.id !== id).slice(0, 5)));
  }, [id]);

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;
  if (!resource) return <div style={{ textAlign: 'center', padding: 48 }}><h3>Resource not found</h3></div>;

  const videoId = resource.youtube_url ? extractVideoId(resource.youtube_url) : null;

  return (
    <div className="animate-fadeIn">
      <Link href="/counsellor/resources" style={{ fontSize: '0.9rem', color: 'var(--lavender-dark)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>← Back</Link>
      <div style={{ display: 'grid', gridTemplateColumns: related.length > 0 ? '1fr 300px' : '1fr', gap: 24 }}>
        <div>
          {resource.type === 'video' && videoId && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe src={getEmbedUrl(videoId)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
              </div>
            </div>
          )}
          <div className="glass-card" style={{ padding: 28 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>{resource.title}</h1>
            {resource.description && <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{resource.description}</p>}
            {resource.type === 'article' && resource.content && <div style={{ fontSize: '0.95rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{resource.content}</div>}
          </div>
        </div>
        {related.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Related</h3>
            {related.map(r => {
              const vid = r.youtube_url ? extractVideoId(r.youtube_url) : null;
              return (
                <Link key={r.id} href={`/counsellor/resources/${r.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
                  <div className="glass-card" style={{ padding: 12, display: 'flex', gap: 10 }}>
                    {r.type === 'video' && vid && <img src={getThumbnailUrl(vid)} alt="" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />}
                    <div><h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.title}</h4></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
