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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !dbUser) router.push('/login');
    if (!loading && dbUser && dbUser.role !== 'counsellor') router.push('/student/dashboard');
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

  if (loading || !dbUser) return <div className="loading-container"><div className="loading-spinner" /></div>;

  return (
    <div className="portal-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 35 }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ background: '#f8fafc', width: sidebarCollapsed ? '70px' : '260px', transition: 'width 0.3s ease' }}>
        <div className="sidebar-logo" style={{ padding: sidebarCollapsed ? '24px 12px' : '24px', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          {!sidebarCollapsed && (
            <>
              <h1>🧠 Sanctuary</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Counsellor Portal</p>
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
            borderRadius: '4px',
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Welcome, Dr. {dbUser.name?.split(' ')[0]} 👋</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mint-dark)', background: '#d1fae5', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>🟢 Available</span>
            <Link href="/counsellor/notifications" style={{ fontSize: '1.3rem', textDecoration: 'none', position: 'relative' }}>
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
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
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
