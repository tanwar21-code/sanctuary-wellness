'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect, useRef } from 'react';
import { compressImage } from '@/lib/image';

export default function CounsellorProfilePage() {
  const { dbUser, logout, refreshUser } = useAuth();
  const [name, setName] = useState(dbUser?.name || '');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/counsellor-profile?userId=${dbUser.id}`).then(r => r.json()).then(d => {
        if (d.profile) {
          setSpecialization(d.profile.specialization || '');
          setBio(d.profile.bio || '');
          setExperience(d.profile.experience?.toString() || '');
          setAvailability(d.profile.availability || '');
        }
      }).catch(() => {});
    }
  }, [dbUser]);

  const saveProfile = async () => {
    if (!dbUser) return;
    setSaving(true);
    try {
      await fetch(`/api/users/${dbUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      await fetch('/api/counsellor-profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: dbUser.id, specialization, bio, experience: parseInt(experience) || 0, availability }) });
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
          <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #1e40af, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
            {dbUser.profile_image ? <img src={dbUser.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>{dbUser.name?.[0]}</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <div>
            <h3 style={{ fontWeight: 700 }}>{dbUser.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Counsellor</p>
            {uploading && <p style={{ fontSize: '0.8rem', color: 'var(--lavender-dark)' }}>Uploading...</p>}
          </div>
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>Personal Information</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Name</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
          <input className="input-field" value={dbUser.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>Professional Information</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Specialization</label>
          <input className="input-field" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g., Exam Stress, Anxiety, Burnout" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Bio</label>
          <textarea className="input-field" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell students about yourself..." rows={3} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Years of Experience</label>
            <input className="input-field" type="number" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g., 5" />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Availability</label>
            <input className="input-field" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g., Mon-Fri 5-8 PM" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={saveProfile} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
          {saved && <span style={{ color: 'var(--mint-dark)', fontWeight: 500 }}>✅ Saved!</span>}
        </div>
      </div>

      <button onClick={logout} className="btn-danger" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>🚪 Logout</button>
    </div>
  );
}
