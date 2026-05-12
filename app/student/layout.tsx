'use client';

import Loader from '@/components/Loader';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const sidebarNavItems = [
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
    return <Loader />;
  }

  const isTabActive = (href: string) => pathname === href;

  return (
    <div className="portal-layout">
      {/* === DESKTOP SIDEBAR === */}
      <aside className="sidebar desktop-sidebar" style={{ width: sidebarCollapsed ? '70px' : '260px', transition: 'width 0.3s ease' }}>
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
            <Link href="/student/profile" className="profile-avatar">
              {dbUser.profile_image ? (
                <img src={dbUser.profile_image} alt="" />
              ) : (
                <div className="avatar-fallback">{dbUser.name?.[0]}</div>
              )}
            </Link>
            <span className="brand-name">Sanctuary</span>
          </div>
          <div className="header-right">
            <Link href="/student/resources" className="header-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </Link>
            <Link href="/student/notifications" className="header-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              {unreadCount > 0 && <span className="notif-badge" />}
            </Link>
          </div>
        </div>
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, {dbUser.name?.split(' ')[0]} 👋
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/student/notifications" style={{ fontSize: '1.3rem', textDecoration: 'none', position: 'relative' }}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 700, minWidth: '18px', height: '18px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/student/profile">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'var(--gradient-cta)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {dbUser.profile_image ? <img src={dbUser.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{dbUser.name?.[0]}</span>}
              </div>
            </Link>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      {/* === MOBILE BOTTOM TAB BAR === */}
      <nav className="bottom-tab-bar">
        <Link href="/student/dashboard" className={`tab-item ${isTabActive('/student/dashboard') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
          </span>
          <span>Dashboard</span>
        </Link>
        <Link href="/student/mood-tracker" className={`tab-item ${isTabActive('/student/mood-tracker') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
          </span>
          <span>Mood</span>
        </Link>
        <Link href="/student/ai-support" className={`tab-item center-tab ${isTabActive('/student/ai-support') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
          </span>
          <span>AI Support</span>
        </Link>
        <Link href="/student/counsellors" className={`tab-item ${isTabActive('/student/counsellors') ? 'active' : ''}`}>
          <span className="tab-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          </span>
          <span>Counselors</span>
        </Link>
      </nav>
    </div>
  );
}
