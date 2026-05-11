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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !dbUser) router.push('/login');
    if (!loading && dbUser && dbUser.role === 'counsellor') router.push('/counsellor/dashboard');
  }, [dbUser, loading, router]);

  useEffect(() => {
    if (dbUser?.id) {
      fetch(`/api/notifications?userId=${dbUser.id}`)
        .then(r => r.json())
        .then(d => {
          const unread = d.notifications?.filter((n: any) => !n.is_read).length || 0;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [dbUser]);

  if (loading || !dbUser) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="portal-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 35 }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: sidebarCollapsed ? '70px' : '260px', transition: 'width 0.3s ease' }}>
        <div className="sidebar-logo" style={{ padding: sidebarCollapsed ? '24px 12px' : '24px', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          {!sidebarCollapsed && (
            <>
              <h1>🧠 Sanctuary</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Student Portal</p>
            </>
          )}
          {sidebarCollapsed && <h1>🧠</h1>}
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '4px',
            borderRadius: '0',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
        <nav className="sidebar-nav" style={{ padding: sidebarCollapsed ? '8px 8px' : '8px 12px' }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '12px' : '12px 16px' }}>
              <span className="icon">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div style={{ padding: sidebarCollapsed ? '16px 8px' : '16px 12px', borderTop: '1px solid var(--border-light)' }}>
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '12px' : '12px 16px' }}>
            <span className="icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? '70px' : '260px', transition: 'margin-left 0.3s ease' }}>
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {dbUser.name?.split(' ')[0]} 👋
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/student/notifications" style={{ fontSize: '1.3rem', textDecoration: 'none', position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/student/profile">
              <div style={{ width: 36, height: 36, borderRadius: '0', background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
