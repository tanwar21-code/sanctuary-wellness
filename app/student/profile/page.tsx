'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useRef } from 'react';
import { compressImage } from '@/lib/image';

export default function ProfilePage() {
  const { dbUser, logout, refreshUser } = useAuth();
  const [name, setName] = useState(dbUser?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveName = async () => {
    if (!dbUser || !name.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/users/${dbUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim() }) });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dbUser) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      await fetch(`/api/users/${dbUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile_image: compressed }) });
      await refreshUser();
    } catch {}
    setUploading(false);
  };

  if (!dbUser) return null;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Profile Settings</h2>

      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            {dbUser.profile_image ? <img src={dbUser.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>{dbUser.name?.[0]}</span>}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
              <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 600 }}>📷 Edit</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <div>
            <h3 style={{ fontWeight: 700 }}>{dbUser.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dbUser.role}</p>
            {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--lavender-dark)' }}>Uploading...</p>}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Name</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
          <input className="input-field" value={dbUser.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={saveName} disabled={saving || !name.trim()} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && <span style={{ color: 'var(--mint-dark)', fontWeight: 500, fontSize: '0.9rem' }}>✅ Saved!</span>}
        </div>
      </div>

      <button onClick={logout} className="btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}>
        🚪 Logout
      </button>
    </div>
  );
}
