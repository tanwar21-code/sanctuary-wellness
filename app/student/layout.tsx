'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/student/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/student/ai-support', icon: '🤖', label: 'AI Support' },
  { href: '/student/counsellors', icon: '👨‍⚕️', label: 'Counsellors' },
  { href: '/student/resources', icon: '📚', label: 'Resources' },
  { href: '/student/mood-tracker', icon: '🎯', label: 'Mood Tracker' },
  { href: '/student/notifications', icon: '🔔', label: 'Notifications' },
  { href: '/student/profile', icon: '👤', label: 'Profile' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { dbUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !dbUser) router.push('/login');
    if (!loading && dbUser && dbUser.role === 'counsellor') router.push('/counsellor/dashboard');
  }, [dbUser, loading, router]);

  if (loading || !dbUser) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="portal-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 35 }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>🧠 Sanctuary</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Student Portal</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-light)' }}>
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
            <span className="icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {dbUser.name?.split(' ')[0]} 👋
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/student/notifications" style={{ fontSize: '1.3rem', textDecoration: 'none' }}>🔔</Link>
            <Link href="/student/profile">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {dbUser.profile_image ? <img src={dbUser.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{dbUser.name?.[0]}</span>}
              </div>
            </Link>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
