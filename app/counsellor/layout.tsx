'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/counsellor/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/counsellor/inbox', icon: '📥', label: 'Inbox' },
  { href: '/counsellor/sessions', icon: '📋', label: 'Sessions' },
  { href: '/counsellor/schedule', icon: '📅', label: 'Schedule' },
  { href: '/counsellor/resources', icon: '📚', label: 'Resources' },
  { href: '/counsellor/notifications', icon: '🔔', label: 'Notifications' },
  { href: '/counsellor/profile', icon: '👤', label: 'Profile' },
];

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  const { dbUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !dbUser) router.push('/login');
    if (!loading && dbUser && dbUser.role !== 'counsellor') router.push('/student/dashboard');
  }, [dbUser, loading, router]);

  if (loading || !dbUser) return <div className="loading-container"><div className="loading-spinner" /></div>;

  return (
    <div className="portal-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 35 }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: '#f8fafc' }}>
        <div className="sidebar-logo">
          <h1>🧠 Sanctuary</h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Counsellor Portal</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="icon">{item.icon}</span> {item.label}
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Welcome, Dr. {dbUser.name?.split(' ')[0]} 👋</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mint-dark)', background: '#d1fae5', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>🟢 Available</span>
            <Link href="/counsellor/notifications" style={{ fontSize: '1.3rem', textDecoration: 'none' }}>🔔</Link>
            <Link href="/counsellor/profile">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #1e40af, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
