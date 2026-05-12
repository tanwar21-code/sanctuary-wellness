'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

interface Counsellor {
  id: string; name: string; email: string; profile_image: string | null;
  specialization: string; bio: string; experience: number; availability: string; verified: boolean;
}

export default function CounsellorsPage() {
  const { dbUser } = useAuth();
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [message, setMessage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [requests, setRequests] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/counsellors').then(r => r.json()).then(d => { setCounsellors(d.counsellors || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/requests?studentId=${dbUser.id}`)
        .then(r => r.json())
        .then(d => {
          const reqMap: Record<string, any> = {};
          d.requests?.forEach((req: any) => {
            reqMap[req.counsellor_id] = req;
          });
          setRequests(reqMap);
        })
        .catch(() => {});
    }
  }, [dbUser]);

  // Check for expired requests every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setRequests(prev => {
        const updated: Record<string, any> = {};
        Object.entries(prev).forEach(([counsellorId, req]) => {
          const createdAt = new Date(req.created_at);
          const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          if (hoursPassed < 6) {
            updated[counsellorId] = req;
          }
        });
        return updated;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const requestCall = async () => {
    if (!dbUser || !selectedCounsellor || !message || !contactNumber) return;
    setSending(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: dbUser.id, counsellor_id: selectedCounsellor.id, message, contact_number: contactNumber }),
      });
      const data = await res.json();
      setSent(true);
      // Refresh requests after sending
      if (data.request) {
        setRequests(prev => ({ ...prev, [selectedCounsellor.id]: data.request }));
      }
      setTimeout(() => { setShowModal(false); setSent(false); setMessage(''); setContactNumber(''); }, 2000);
    } catch {}
    setSending(false);
  };

  const getButtonState = (counsellorId: string) => {
    const request = requests[counsellorId];
    if (!request) return 'request';
    if (request.status === 'accepted') return 'accepted';
    if (request.status === 'pending') return 'requested';
    return 'request';
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Our Counsellors</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Connect with verified professionals who care about your wellbeing.</p>

      {counsellors.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>👨‍⚕️</div>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No Counsellors Available Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Counsellors will be available soon. Please check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {counsellors.map((c, index) => (
            <div key={c.id} className={`glass-card animate-slideUp stagger-${(index % 10) + 1}`} style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {c.profile_image ? <img src={c.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>{c.name[0]}</span>}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</h3>
                  <span className="badge badge-accepted" style={{ fontSize: '0.7rem' }}>✓ Verified</span>
                </div>
              </div>
              {c.specialization && <div style={{ marginBottom: 8 }}><span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--sage-dark)' }}>🎯 {c.specialization}</span></div>}
              {c.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{c.bio}</p>}
              <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {c.experience > 0 && <span>📅 {c.experience} yrs exp</span>}
                {c.availability && <span>🕐 {c.availability}</span>}
              </div>
              {(() => {
                const buttonState = getButtonState(c.id);
                if (buttonState === 'requested') {
                  return (
                    <button disabled className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '10px 20px', opacity: 0.7 }}>
                      Requested
                    </button>
                  );
                } else if (buttonState === 'accepted') {
                  return (
                    <button disabled className="btn-success" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '10px 20px' }}>
                      Accepted
                    </button>
                  );
                } else {
                  return (
                    <button onClick={() => { setSelectedCounsellor(c); setShowModal(true); }} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.9rem', padding: '10px 20px' }}>
                      Request a Call
                    </button>
                  );
                }
              })()}
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {showModal && selectedCounsellor && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <h3 style={{ fontWeight: 700 }}>Request Sent!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The counsellor will contact you soon.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>Request a Call</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>with {selectedCounsellor.name}</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Your Concern</label>
                  <textarea className="input-field" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe what you'd like to discuss..." rows={3} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>Contact Number</label>
                  <input className="input-field" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="Your phone number" type="tel" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={requestCall} disabled={!message || !contactNumber || sending} className="btn-primary" style={{ flex: 1, justifyContent: 'center', opacity: (!message || !contactNumber) ? 0.5 : 1 }}>
                    {sending ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
