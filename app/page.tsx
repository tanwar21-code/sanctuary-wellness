'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useState, useEffect } from 'react';

const trustItems = [
  { icon: '🔒', title: 'Anonymous Support', desc: 'Your privacy is our priority' },
  { icon: '🤖', title: 'AI Guidance', desc: 'Instant emotional support 24/7' },
  { icon: '✅', title: 'Verified Counsellors', desc: 'Professional & experienced' },
  { icon: '🎓', title: 'Student-Focused', desc: 'Built for campus life' },
];

const steps = [
  { num: '01', icon: '💭', title: 'Share How You Feel', desc: 'Express your emotions in a safe and judgment-free space.' },
  { num: '02', icon: '🤖', title: 'Get AI Support', desc: 'Receive quick emotional guidance anytime you need it.' },
  { num: '03', icon: '🤝', title: 'Connect With Counsellors', desc: 'Reach out to professionals for deeper support.' },
];

const mockChat = [
  { role: 'user', text: 'I feel stressed about my exams...' },
  { role: 'ai', text: "It's completely okay to feel overwhelmed sometimes. Let's take this one step at a time. Would you like to talk about what's making you most anxious? 💙" },
];

const prompts = ['I feel lonely', "I can't focus", "I'm burned out", 'I feel anxious'];

const testimonials = [
  { text: 'This platform helped me during exam stress. The AI felt like talking to a friend.', author: 'Anonymous Student' },
  { text: 'The AI support made me feel calmer instantly. I use it every week now.', author: 'Engineering Student' },
  { text: 'Anonymous support made it easier to open up about my struggles.', author: 'First Year Student' },
];

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Stressed' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Overwhelmed' },
];

export default function HomePage() {
  const { dbUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisibleSections(prev => new Set(prev).add(e.target.id));
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const dashLink = dbUser ? (dbUser.role === 'counsellor' ? '/counsellor/dashboard' : '/student/dashboard') : '/login';

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* NAVBAR */}
      <nav className="glass" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: scrolled ? '1px solid var(--border-light)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🧠</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, background: 'var(--gradient-cta)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sanctuary</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#resources-preview" className="btn-ghost" style={{ display: 'none' }}>Resources</a>
          <Link href={dashLink} className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
            {dbUser ? 'Dashboard' : 'Get Started'}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--gradient-hero)', position: 'relative', overflow: 'hidden',
        padding: '120px 5% 80px', textAlign: 'center',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(196,181,253,0.25)', top: -100, left: -100, filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(125,211,252,0.2)', bottom: -80, right: -80, filter: 'blur(70px)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(110,231,183,0.15)', top: '50%', left: '60%', filter: 'blur(60px)', animation: 'float 9s ease-in-out infinite' }} />

        <div className="animate-slideUp" style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--lavender-dark)', marginBottom: 24 }}>
            🌿 Safe Space for Students
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, color: 'var(--text-primary)' }}>
            You Don&apos;t Have to Handle<br />
            <span style={{ background: 'var(--gradient-cta)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everything Alone.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Get emotional support through AI guidance, counsellors, and wellness resources designed for students.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={dashLink} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              ✨ Talk to AI
            </Link>
            <Link href={dashLink} className="btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Find Support
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" data-animate style={{
        padding: '80px 5%', display: 'flex', justifyContent: 'center',
        opacity: isVisible('trust') ? 1 : 0, transform: isVisible('trust') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ maxWidth: 1000, width: '100%' }}>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, marginBottom: 32 }}>
            Safe, supportive, and designed for student wellbeing.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {trustItems.map((item, i) => (
              <div key={i} className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" data-animate style={{
        padding: '80px 5%', background: 'var(--bg-secondary)',
        opacity: isVisible('how') ? 1 : 0, transform: isVisible('how') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>How It Works</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 48 }}>Getting support is simple and easy.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--lavender-dark)', marginBottom: 8 }}>STEP {step.num}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI PREVIEW */}
      <section id="ai-preview" data-animate style={{
        padding: '80px 5%',
        opacity: isVisible('ai-preview') ? 1 : 0, transform: isVisible('ai-preview') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>AI Support — Always Here For You</h2>
            <p style={{ color: 'var(--text-muted)' }}>Get instant emotional guidance anytime.</p>
          </div>
          <div className="glass-card" style={{ maxWidth: 550, margin: '0 auto', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧠</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sanctuary AI</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--mint-dark)' }}>● Online</div>
              </div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}>
              {mockChat.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`} style={{ animationDelay: `${i * 0.3}s` }}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {prompts.map((p, i) => (
                <span key={i} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--bg-accent)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--lavender-dark)' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MOOD PREVIEW */}
      <section id="mood-preview" data-animate style={{
        padding: '80px 5%', background: 'var(--bg-secondary)',
        opacity: isVisible('mood-preview') ? 1 : 0, transform: isVisible('mood-preview') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Track Your Wellness</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Understand your emotional patterns and wellness journey.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            {moods.map((m, i) => (
              <div key={i} className="mood-btn" style={{ flexDirection: 'column', width: 80, height: 80, gap: 4 }}>
                <span style={{ fontSize: '1.8rem' }}>{m.emoji}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" data-animate style={{
        padding: '80px 5%',
        opacity: isVisible('testimonials') ? 1 : 0, transform: isVisible('testimonials') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 40 }}>What Students Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card" style={{ padding: 28, textAlign: 'left' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12, color: 'var(--lavender)' }}>&ldquo;</div>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 16, color: 'var(--text-secondary)' }}>{t.text}</p>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--lavender-dark)' }}>— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMERGENCY */}
      <section style={{ padding: '48px 5%', background: '#fef2f2', borderTop: '1px solid #fecaca', borderBottom: '1px solid #fecaca' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>🚨 Emergency Support</h3>
          <p style={{ fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.6, marginBottom: 16 }}>
            If you are experiencing severe emotional distress, please seek immediate professional help.
          </p>
          <p style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>
            ⚠️ AI support is not a replacement for professional medical care.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        padding: '100px 5%', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #0ea5e9 50%, #10b981 100%)',
      }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: -100, right: -50, filter: 'blur(60px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
            Your Mental Health Matters.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Take the first step toward feeling better. We&apos;re here for you.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={dashLink} style={{ background: 'white', color: '#8b5cf6', border: 'none', padding: '14px 32px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              Get Started ✨
            </Link>
            <Link href={dashLink} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', padding: '14px 32px', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
              Talk to AI
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 5% 32px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>🧠</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', background: 'var(--gradient-cta)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sanctuary</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            Built to support student wellbeing with accessible emotional guidance.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {['About', 'Resources', 'Privacy Policy', 'Contact', 'Terms'].map(link => (
              <span key={link} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>{link}</span>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Sanctuary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
