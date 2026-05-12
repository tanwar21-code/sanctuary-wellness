'use client';

import Loader from '@/components/Loader';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { extractVideoId, getEmbedUrl, getThumbnailUrl } from '@/lib/youtube';

interface Resource { id: string; title: string; description: string; type: string; category: string; content: string; youtube_url: string; thumbnail_url: string; created_at: string; }

export default function ResourceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resource, setResource] = useState<Resource | null>(null);
  const [related, setRelated] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/resources/${id}`).then(r => r.json()).then(d => { setResource(d.resource); setLoading(false); }).catch(() => setLoading(false));
    fetch('/api/resources').then(r => r.json()).then(d => { setRelated((d.resources || []).filter((r: Resource) => r.id !== id).slice(0, 5)); });
  }, [id]);

  if (loading) return <Loader />;
  if (!resource) return <div style={{ textAlign: 'center', padding: 48 }}><h3>Resource not found</h3></div>;

  const videoId = resource.youtube_url ? extractVideoId(resource.youtube_url) : null;

  return (
    <div className="animate-fadeIn">
      <Link href="/student/resources" style={{ fontSize: '0.9rem', color: 'var(--lavender-dark)', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>← Back to Resources</Link>

      <div style={{ display: 'grid', gridTemplateColumns: related.length > 0 ? '1fr 320px' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Main Content */}
        <div>
          {resource.type === 'video' && videoId ? (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe src={getEmbedUrl(videoId)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              </div>
            </div>
          ) : null}

          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge" style={{ background: resource.type === 'video' ? '#dbeafe' : '#ede9fe', color: resource.type === 'video' ? '#1e40af' : '#6d28d9' }}>
                {resource.type === 'video' ? '🎥 Video' : '📝 Article'}
              </span>
              {resource.category && <span className="badge" style={{ background: '#f0fdf4', color: '#166534' }}>{resource.category}</span>}
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>{resource.title}</h1>
            {resource.description && <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>{resource.description}</p>}
            {resource.type === 'article' && resource.content && (
              <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{resource.content}</div>
            )}
          </div>
        </div>

        {/* Sidebar - Related */}
        {related.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Related Resources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {related.map(r => {
                const rVideoId = r.youtube_url ? extractVideoId(r.youtube_url) : null;
                const rThumb = r.thumbnail_url || (rVideoId ? getThumbnailUrl(rVideoId) : null);
                return (
                  <Link key={r.id} href={`/student/resources/${r.id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', gap: 0 }}>
                      {r.type === 'video' && rThumb && (
                        <div style={{ width: 120, flexShrink: 0, position: 'relative' }}>
                          <img src={rThumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 68 }} />
                        </div>
                      )}
                      <div style={{ padding: 12, flex: 1 }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{r.title}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.type === 'video' ? '🎥' : '📝'} {r.category || r.type}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
