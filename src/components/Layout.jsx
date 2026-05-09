import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, BarChart3, LogOut,
  GraduationCap, Menu, X, Brain, QrCode, MapPin, Sun, Moon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV = [
  { to:'/',           icon:LayoutDashboard, label:'Dashboard'    },
  { to:'/students',   icon:Users,            label:'Students'     },
  { to:'/attendance', icon:CalendarCheck,    label:'Attendance'   },
  { to:'/insights',   icon:Brain,            label:'Smart Insights'},
  { to:'/qr-checkin', icon:QrCode,           label:'QR Check-in'  },
  { to:'/geofence',   icon:MapPin,           label:'Geofence'     },
  { to:'/reports',    icon:BarChart3,        label:'Reports'      },
];

function NavItem({ item, collapsed, onClick }) {
  const { pathname } = useLocation();
  const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={`nav-item${isActive ? ' active' : ''}`}
      style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
    >
      <item.icon size={18} style={{ flexShrink:0 }} />
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

  const Logo = () => (
    <div style={{
      width:38, height:38, borderRadius:12, flexShrink:0,
      background:'var(--g-hero)',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 4px 16px var(--pglow)',
    }}>
      <GraduationCap size={20} color="#fff" />
    </div>
  );

  const SideContent = ({ isCol, onNav }) => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'18px 14px', borderBottom:'1px solid var(--edge)',
      }}>
        <Logo />
        {!isCol && <>
          <div style={{ flex:1, overflow:'hidden' }}>
            <p className="aurora-text" style={{ fontSize:'1.05rem', fontWeight:900, letterSpacing:'-.02em' }}>TS:2</p>
            <p style={{ fontSize:'9px', color:'var(--ink4)', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase' }}>Smart Presence</p>
          </div>
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme==='dark' ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
        </>}
        <button
          className="theme-btn"
          onClick={() => setCollapsed(v => !v)}
          style={{ display: 'none' }}
          id="sidebar-collapse-btn"
        />
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:10, display:'flex', flexDirection:'column', gap:3, overflowY:'auto' }}>
        {NAV.map(item => <NavItem key={item.to} item={item} collapsed={isCol} onClick={onNav} />)}
      </nav>

      {/* Team tag */}
      {!isCol && (
        <div style={{
          padding:'10px 14px', margin:'0 10px 8px',
          borderRadius:12, background:'var(--psub)', border:'1px solid rgba(124,111,255,.12)',
          textAlign:'center',
        }}>
          <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--p)', marginBottom:3 }}>Team</p>
          <p style={{ fontSize:'11px', color:'var(--ink3)', fontWeight:500 }}>Sagar · Thejas · Supriya · Thousif</p>
        </div>
      )}

      {/* User */}
      <div style={{ padding:'10px 10px 14px' }}>
        {!isCol && (
          <div style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'8px 10px', marginBottom:8,
            borderRadius:12, background:'var(--surface)', border:'1px solid var(--edge)',
          }}>
            <div style={{
              width:34, height:34, borderRadius:10, flexShrink:0,
              background:'var(--g-hero)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:900, color:'#fff',
              boxShadow:'0 2px 8px var(--pglow)',
            }}>
              {(userProfile?.teacherName || user?.email || '?')[0].toUpperCase()}
            </div>
            <div style={{ overflow:'hidden', flex:1 }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'var(--ink1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {userProfile?.teacherName || user?.email}
              </p>
              {userProfile?.subjectName && (
                <p style={{ fontSize:'10px', color:'var(--p)', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {userProfile.subjectName} · {userProfile.semester}
                </p>
              )}
            </div>
          </div>
        )}
        <button
          id="logout-btn"
          onClick={logout}
          className="btn btn-secondary"
          style={{ width:'100%', justifyContent: isCol ? 'center' : 'flex-start', fontSize:'12px', borderRadius:10 }}
        >
          <LogOut size={14} />
          {!isCol && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg0)' }}>

      {/* Desktop sidebar */}
      <aside
        className="sidebar-rail"
        style={{
          width: collapsed ? 68 : 240,
          minWidth: collapsed ? 68 : 240,
          transition:'width .3s cubic-bezier(.22,1,.36,1)',
          display:'none',
          flexDirection:'column',
          position:'relative',
          zIndex:20,
        }}
        id="desktop-sidebar"
      >
        <SideContent isCol={collapsed} />
        {/* Collapse pill */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            position:'absolute', right:-12, top:'50%', transform:'translateY(-50%)',
            width:24, height:24, borderRadius:999,
            background:'var(--p)', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px var(--pglow)', color:'#fff', zIndex:10,
          }}
        >
          {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position:'fixed', inset:0, zIndex:40, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="sidebar-rail"
        style={{
          position:'fixed', top:0, left:0, height:'100%',
          width:260, zIndex:50,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition:'transform .3s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <SideContent isCol={false} onNav={() => setMobileOpen(false)} />
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Mobile topbar */}
        <header style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'10px 16px',
          background:'var(--nav)',
          borderBottom:'1px solid var(--edge)',
          backdropFilter:'var(--blur)',
          WebkitBackdropFilter:'var(--blur)',
        }}>
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            className="theme-btn"
            style={{ flexShrink:0 }}
          >
            <Menu size={18} />
          </button>
          <Logo />
          <span className="aurora-text" style={{ fontWeight:900, fontSize:'1rem', flex:1 }}>TS:2</span>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme==='dark' ? <Sun size={15}/> : <Moon size={15}/>}
          </button>
        </header>

        {/* Page */}
        <main style={{ flex:1, overflowY:'auto', padding:'20px 20px 100px' }}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav style={{
          display:'flex',
          background:'var(--nav)',
          borderTop:'1px solid var(--edge)',
          backdropFilter:'var(--blur)',
          WebkitBackdropFilter:'var(--blur)',
        }}>
          {NAV.map(item => {
            const isActive = item.to==='/' ? window.location.pathname==='/' : window.location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  gap:3, padding:'8px 0',
                  color: isActive ? 'var(--p)' : 'var(--ink4)',
                  textDecoration:'none', fontSize:'9px', fontWeight:700,
                  letterSpacing:'.04em', minHeight:56, transition:'color .2s',
                  textTransform:'uppercase',
                }}
              >
                <item.icon size={19} />
                <span>{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* CSS fix for desktop sidebar visibility */}
      <style>{`
        @media(min-width:768px){
          #desktop-sidebar{display:flex!important;}
          header:has(#mobile-menu-btn){display:none;}
          nav:has(a[style*="minHeight: 56"]){display:none;}
        }
        @media(max-width:767px){
          #desktop-sidebar{display:none!important;}
        }
      `}</style>
    </div>
  );
}
