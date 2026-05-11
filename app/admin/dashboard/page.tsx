'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'students' | 'counsellors'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [counsellors, setCounsellors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCounsellor, setShowAddCounsellor] = useState(false);
  const [newCounsellor, setNewCounsellor] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    bio: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_session');
    if (!token) {
      router.push('/admin');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_session');
      const [studentsRes, counsellorsRes] = await Promise.all([
        fetch('/api/admin/students', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/counsellors', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const studentsData = await studentsRes.json();
      const counsellorsData = await counsellorsRes.json();

      if (studentsRes.ok) setStudents(studentsData.students || []);
      if (counsellorsRes.ok) setCounsellors(counsellorsData.counsellors || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCounsellor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_session');
      const res = await fetch('/api/admin/counsellors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCounsellor),
      });

      if (res.ok) {
        setShowAddCounsellor(false);
        setNewCounsellor({ name: '', email: '', specialization: '', experience: '', bio: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add counsellor');
      }
    } catch (error) {
      console.error('Error adding counsellor:', error);
      alert('An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(248, 247, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🔐</span>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Admin Panel</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Sanctuary Management</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost">
          Logout
        </button>
      </header>

      {/* Tabs */}
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 32, borderBottom: '2px solid var(--border-light)', paddingBottom: 16 }}>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'students' ? 'var(--gradient-cta)' : 'transparent',
              color: activeTab === 'students' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('counsellors')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'counsellors' ? 'var(--gradient-cta)' : 'transparent',
              color: activeTab === 'counsellors' ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Counsellors ({counsellors.length})
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            {students.length === 0 ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No students registered yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {students.map((student) => (
                  <div key={student.id} className="glass-card" style={{
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--gradient-cta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {student.profile_image ? (
                        <img src={student.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                          {student.name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{student.name || 'Unknown'}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{student.email || 'No email'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Counsellors Tab */}
        {activeTab === 'counsellors' && (
          <div>
            <button
              onClick={() => setShowAddCounsellor(true)}
              className="btn-primary"
              style={{ marginBottom: 24 }}
            >
              + Add a Counsellor
            </button>

            {showAddCounsellor && (
              <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Add New Counsellor</h3>
                <form onSubmit={handleAddCounsellor} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Name *</label>
                    <input
                      type="text"
                      value={newCounsellor.name}
                      onChange={(e) => setNewCounsellor({ ...newCounsellor, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Email *</label>
                    <input
                      type="email"
                      value={newCounsellor.email}
                      onChange={(e) => setNewCounsellor({ ...newCounsellor, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Specialization *</label>
                    <input
                      type="text"
                      value={newCounsellor.specialization}
                      onChange={(e) => setNewCounsellor({ ...newCounsellor, specialization: e.target.value })}
                      className="input-field"
                      required
                      placeholder="e.g., Anxiety, Depression, Student Counseling"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Experience (years)</label>
                    <input
                      type="number"
                      value={newCounsellor.experience}
                      onChange={(e) => setNewCounsellor({ ...newCounsellor, experience: e.target.value })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>Bio (optional)</label>
                    <textarea
                      value={newCounsellor.bio}
                      onChange={(e) => setNewCounsellor({ ...newCounsellor, bio: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Brief description about the counsellor"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn-primary">Add Counsellor</button>
                    <button
                      type="button"
                      onClick={() => setShowAddCounsellor(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {counsellors.length === 0 ? (
              <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No counsellors added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {counsellors.map((counsellor) => (
                  <div key={counsellor.id} className="glass-card" style={{
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                  }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--gradient-cta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {counsellor.profile_image ? (
                        <img src={counsellor.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                          {counsellor.name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{counsellor.name || 'Unknown'}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 4 }}>{counsellor.email || 'No email'}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-accent)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--lavender-dark)',
                        }}>
                          {counsellor.specialization || 'No specialization'}
                        </span>
                        {counsellor.experience && (
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-accent)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--lavender-dark)',
                          }}>
                            {counsellor.experience} years exp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
