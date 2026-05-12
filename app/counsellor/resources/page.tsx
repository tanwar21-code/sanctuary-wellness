'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { extractVideoId, getThumbnailUrl } from '@/lib/youtube';

interface Resource { id: string; title: string; description: string; type: string; category: string; content: string; youtube_url: string; thumbnail_url: string; created_by: string; created_at: string; }

const categories = ['Stress', 'Anxiety', 'Motivation', 'Sleep', 'Productivity', 'Relationships'];

export default function CounsellorResourcesPage() {
  const { dbUser } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'article', category: 'Stress', content: '', youtube_url: '' });
  const [saving, setSaving] = useState(false);

  const fetchResources = () => {
    fetch('/api/resources').then(r => r.json()).then(d => { setResources((d.resources || []).filter((r: Resource) => r.created_by === dbUser?.id)); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { if (dbUser) fetchResources(); }, [dbUser]);

  const saveResource = async () => {
    if (!dbUser || !form.title) return;
    setSaving(true);
    const videoId = form.youtube_url ? extractVideoId(form.youtube_url) : null;
    const body = { ...form, thumbnail_url: videoId ? getThumbnailUrl(videoId) : null, created_by: dbUser.id };

    if (editId) {
      await fetch(`/api/resources/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setShowForm(false); setEditId(null);
    setForm({ title: '', description: '', type: 'article', category: 'Stress', content: '', youtube_url: '' });
    fetchResources();
    setSaving(false);
  };

  const deleteResource = async (id: string) => {
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const editResource = (r: Resource) => {
    setForm({ title: r.title, description: r.description || '', type: r.type, category: r.category || 'Stress', content: r.content || '', youtube_url: r.youtube_url || '' });
    setEditId(r.id);
    setShowForm(true);
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Resources</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage wellness content.</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', description: '', type: 'article', category: 'Stress', content: '', youtube_url: '' }); }} className="btn-primary">+ Add Resource</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>{editId ? 'Edit Resource' : 'Add Resource'}</h3>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {['article', 'video'].map(t => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} className={form.type === t ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}>
                  {t === 'article' ? '📝' : '🎥'} {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input className="input-field" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              {form.type === 'article' && <textarea className="input-field" placeholder="Article Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} />}
              {form.type === 'video' && <input className="input-field" placeholder="YouTube URL" value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} />}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveResource} disabled={!form.title || saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Resource List */}
      {resources.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📚</div>
          <h3 style={{ fontWeight: 700 }}>No Resources Created</h3>
          <p style={{ color: 'var(--text-muted)' }}>Click &quot;Add Resource&quot; to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {resources.map(r => {
            const videoId = r.youtube_url ? extractVideoId(r.youtube_url) : null;
            const thumb = r.thumbnail_url || (videoId ? getThumbnailUrl(videoId) : null);
            return (
              <div key={r.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {r.type === 'video' && thumb && (
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img src={thumb} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span className="badge" style={{ background: r.type === 'video' ? '#dbeafe' : '#ede9fe', color: r.type === 'video' ? '#1e40af' : '#6d28d9' }}>
                      {r.type === 'video' ? '🎥 Video' : '📝 Article'}
                    </span>
                    {r.category && <span className="badge" style={{ background: '#f0fdf4', color: '#166534' }}>{r.category}</span>}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>{r.title}</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => editResource(r)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '8px' }}>Edit</button>
                    <button onClick={() => deleteResource(r.id)} className="btn-danger" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '8px' }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
