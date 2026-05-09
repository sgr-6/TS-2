import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, BarChart3, LogOut,
  GraduationCap, Menu, X, Brain, QrCode, MapPin, Sun, Moon,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',     id: 'nav-dashboard' },
  { to: '/students',   icon: Users,            label: 'Students',      id: 'nav-students' },
  { to: '/attendance', icon: CalendarCheck,    label: 'Attendance',    id: 'nav-attendance' },
  { to: '/insights',   icon: Brain,            label: 'Smart Insights',id: 'nav-insights' },
  { to: '/qr-checkin', icon: QrCode,           label: 'QR Check-in',  id: 'nav-qr' },
  { to: '/geofence',   icon: MapPin,           label: 'Geofence Radar',id: 'nav-geofence' },
  { to: '/reports',    icon: BarChart3,         label: 'Reports',       id: 'nav-reports' },
];

function NavItem({ item, collapsed, onClick }) {
  const location = useLocation();
  const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
  return (
    <NavLink
      id={item.id}
      to={item.to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        color: isActive ? 'var(--accent)' : 'var(--text-3)',
        background: isActive ? 'var(--accent-subtle)' : 'transparent',
        border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
        minHeight: '44px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        textDecoration: 'none',
        boxShadow: isActive ? '0 0 12px var(--accent-glow)' : 'none',
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--accent-subtle)'; e.currentTarget.style.color = 'var(--accent)'; }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; } }}
    >
      <item.icon size={19} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, userProfile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ts2-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ts2-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const SidebarContent = ({ isCollapsed, onNavClick }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            background: 'var(--grad-accent)',
            boxShadow: '0 4px 16px var(--accent-glow)',
          }}
        >
          <GraduationCap size={19} color="white" />
        </div>
        {!isCollapsed && (
          <span className="font-black text-lg gradient-text tracking-tight">TS:2</span>
        )}
        {!isCollapsed && (
          <div className="ml-auto flex items-center gap-1.5">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              id="sidebar-collapse-btn"
              className="theme-toggle"
              onClick={() => setCollapsed(v => !v)}
              aria-label="Toggle sidebar"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            id="sidebar-collapse-btn"
            className="theme-toggle"
            style={{ width: '32px', height: '32px' }}
            onClick={() => setCollapsed(v => !v)}
          >
            <Menu size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={isCollapsed} onClick={onNavClick} />
        ))}
      </nav>

      {/* Team */}
      {!isCollapsed && (
        <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>Team</p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: 'var(--text-3)' }}>
            Sagar · Thejas<br />Supriya · Thousif
          </p>
        </div>
      )}

      {/* User */}
      <div className="p-3">
        {!isCollapsed && (
          <div
            className="flex items-start gap-3 px-3 py-2.5 mb-2 rounded-xl"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
              style={{ background: 'var(--grad-accent)', color: 'white', boxShadow: '0 2px 10px var(--accent-glow)' }}
            >
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate" style={{ color: 'var(--text-1)' }}>
                {userProfile?.teacherName || user?.email}
              </p>
              {userProfile?.subjectName && (
                <p className="text-[10px] truncate font-semibold" style={{ color: 'var(--accent)' }}>
                  {userProfile.subjectName} · {userProfile.semester}
                </p>
              )}
              {userProfile?.department && (
                <p className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>
                  {userProfile.department}
                </p>
              )}
            </div>
          </div>
        )}
        <button
          id="logout-btn"
          onClick={logout}
          className="btn btn-secondary w-full text-xs"
          style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', borderRadius: '12px' }}
        >
          <LogOut size={15} />
          {!isCollapsed && 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col sidebar transition-all duration-300"
        style={{ width: collapsed ? '72px' : '248px', minWidth: collapsed ? '72px' : '248px' }}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className="fixed top-0 left-0 h-full z-50 md:hidden flex flex-col sidebar transition-transform duration-300"
        style={{ width: '260px', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <SidebarContent isCollapsed={false} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="flex md:hidden items-center gap-3 px-4 py-3"
          style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}
        >
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            className="theme-toggle"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl"
            style={{ background: 'var(--grad-accent)', boxShadow: '0 2px 10px var(--accent-glow)' }}
          >
            <GraduationCap size={15} color="white" />
          </div>
          <span className="font-black gradient-text">TS:2</span>
          <button className="theme-toggle ml-auto" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="flex md:hidden"
          style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}
        >
          {NAV_ITEMS.map((item) => {
            const path = window.location.pathname;
            const isActive = item.to === '/' ? path === '/' : path.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-4)', minHeight: '56px', textDecoration: 'none', transition: 'color 0.2s' }}
              >
                <item.icon size={19} />
                <span>{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
