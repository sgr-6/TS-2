import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Brain,
  QrCode,
  MapPin,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'nav-dashboard' },
  { to: '/students', icon: Users, label: 'Students', id: 'nav-students' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance', id: 'nav-attendance' },
  { to: '/insights', icon: Brain, label: 'Smart Insights', id: 'nav-insights' },
  { to: '/qr-checkin', icon: QrCode, label: 'QR Check-in', id: 'nav-qr' },
  { to: '/geofence', icon: MapPin, label: 'Geofence Radar', id: 'nav-geofence' },
  { to: '/reports', icon: BarChart3, label: 'Reports', id: 'nav-reports' },
];

function NavItem({ item, collapsed, onClick }) {
  const location = useLocation();
  const isActive = item.to === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(item.to);

  return (
    <NavLink
      id={item.id}
      to={item.to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        color: isActive ? '#a5b4fc' : '#64748b',
        background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
        border: isActive ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
        minHeight: '44px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      <item.icon size={20} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#020617' }}>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col transition-all duration-300"
        style={{
          width: sidebarCollapsed ? '72px' : '240px',
          background: 'rgba(15,23,42,0.95)',
          borderRight: '1px solid rgba(99,102,241,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 border-b"
          style={{ borderColor: 'rgba(99,102,241,0.08)' }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            <GraduationCap size={20} color="white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-lg gradient-text">TS:2</span>
          )}
          <button
            id="sidebar-collapse-btn"
            className="ml-auto p-1 rounded-lg"
            style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white' }}
              >
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium truncate" style={{ color: '#e2e8f0' }}>
                  {user?.email}
                </p>
                <p className="text-xs" style={{ color: '#475569' }}>Administrator</p>
              </div>
            </div>
          )}
          <button
            id="logout-btn"
            onClick={logout}
            className="btn btn-secondary w-full text-xs"
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <LogOut size={16} />
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className="fixed top-0 left-0 h-full z-50 md:hidden flex flex-col transition-transform duration-300"
        style={{
          width: '260px',
          background: 'rgba(9,16,35,0.98)',
          borderRight: '1px solid rgba(99,102,241,0.1)',
          backdropFilter: 'blur(16px)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-5 border-b"
          style={{ borderColor: 'rgba(99,102,241,0.08)' }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            <GraduationCap size={20} color="white" />
          </div>
          <span className="font-bold text-lg gradient-text">TS:2</span>
          <button
            className="ml-auto"
            style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={false} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white' }}
            >
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium truncate" style={{ color: '#e2e8f0' }}>{user?.email}</p>
              <p className="text-xs" style={{ color: '#475569' }}>Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary w-full text-xs">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="flex md:hidden items-center gap-3 px-4 py-3 border-b"
          style={{
            background: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(99,102,241,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl"
            style={{ color: '#94a3b8', background: 'rgba(99,102,241,0.08)', border: 'none', cursor: 'pointer', minHeight: '44px', minWidth: '44px' }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            <GraduationCap size={16} color="white" />
          </div>
          <span className="font-bold gradient-text">TS:2</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav
          className="flex md:hidden border-t"
          style={{
            background: 'rgba(9,16,35,0.98)',
            borderColor: 'rgba(99,102,241,0.1)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const location = window.location.pathname;
            const isActive = item.to === '/' ? location === '/' : location.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium"
                style={{
                  color: isActive ? '#a5b4fc' : '#475569',
                  minHeight: '56px',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
