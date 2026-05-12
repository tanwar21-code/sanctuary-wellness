'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sidebarNavItems = [
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

  if (loading || !dbUser) return <Loader />;

  const isTabActive = (href: string) => pathname === href;

  return (
    <div className="portal-layout">
      {/* === DESKTOP SIDEBAR === */}
      <aside className="sidebar desktop-sidebar" style={{ background: '#f8fafc', width: sidebarCollapsed ? '70px' : '260px', transition: 'width 0.3s ease' }}>
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
          style={{ position: 'absolute', top: '20px', right: '12px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
        <nav className="sidebar-nav" style={{ padding: sidebarCollapsed ? '8px 8px' : '8px 12px' }}>
          {sidebarNavItems.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start', padding: sidebarCollapsed ? '12px' : '12px 16px' }}>
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

      {/* === MAIN CONTENT === */}
      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? '70px' : '260px', transition: 'margin-left 0.3s ease' }}>
        {/* === MOBILE TOP HEADER === */}
        <div className="mobile-top-header">
          <div className="header-left">
            <Link href="/counsellor/profile" className="profile-avatar">
              {dbUser.profile_image ? (
                <img src={dbUser.profile_image} alt="" />
              ) : (
                <div className="avatar-fallback">{dbUser.name?.[0]}</div>
              )}
            </Link>
            <span className="brand-name">Sanctuary</span>
          </div>
          <div className="header-right">
            <Link href="/counsellor/resources" className="header-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </Link>
            <Link href="/counsellor/notifications" className="header-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              {unreadCount > 0 && <span className="notif-badge" />}
            </Link>
          </div>
        </div>
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Welcome, Dr. {dbUser.name?.split(' ')[0]} 👋</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mint-dark)', background: '#d1fae5', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>🟢 Available</span>
            <Link href="/counsellor/notifications" style={{ fontSize: '1.3rem', textDecoration: 'none', position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
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

      {/* === MOBILE BOTTOM TAB BAR === */}
      <nav className="bottom-tab-bar">
        <Link href="/counsellor/dashboard" className={`tab-item ${isTabActive('/counsellor/dashboard') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
          </span>
          <span>Dashboard</span>
        </Link>
        <Link href="/counsellor/inbox" className={`tab-item ${isTabActive('/counsellor/inbox') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-17.5 0a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h16.5a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25m-17.5 0V6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v6.75" /></svg>
          </span>
          <span>Inbox</span>
        </Link>
        <Link href="/counsellor/schedule" className={`tab-item center-tab ${isTabActive('/counsellor/schedule') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          </span>
          <span>Schedule</span>
        </Link>
        <Link href="/counsellor/sessions" className={`tab-item ${isTabActive('/counsellor/sessions') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
          </span>
          <span>Sessions</span>
        </Link>
      </nav>
    </div>
  );
}
