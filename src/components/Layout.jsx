import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, BarChart3, LogOut,
  GraduationCap, Menu, X, Brain, QrCode, MapPin, Sun, Moon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const NAV = [
  { to:'/',           icon:LayoutDashboard, label:'Dashboard',      color:'#8B5CF6' },
  { to:'/students',   icon:Users,            label:'Students',       color:'#3B82F6' },
  { to:'/attendance', icon:CalendarCheck,    label:'Attendance',     color:'#10B981' },
  { to:'/insights',   icon:Brain,            label:'Smart Insights', color:'#06B6D4' },
  { to:'/qr-checkin', icon:QrCode,           label:'QR Check-in',   color:'#F59E0B' },
  { to:'/geofence',   icon:MapPin,           label:'Geofence',       color:'#F43F5E' },
  { to:'/reports',    icon:BarChart3,        label:'Reports',        color:'#EC4899' },
];

function NavItem({ item, collapsed, onClick }) {
  const { pathname } = useLocation();
  const isActive = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
  const col = item.color;

  return (
    <NavLink to={item.to} onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding: collapsed ? '10px' : '9px 12px',
        borderRadius:10, border:'1px solid transparent',
        fontSize:'13.5px', fontWeight: isActive ? 700 : 500,
        color: isActive ? col : 'var(--t3)',
        background: isActive ? `${col}14` : 'transparent',
        borderColor: isActive ? `${col}30` : 'transparent',
        textDecoration:'none',
        transition:'all .18s ease',
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight:40,
        boxShadow: isActive ? `inset 3px 0 0 ${col}` : 'none',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background=`${col}0D`; e.currentTarget.style.color=col; }}}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--t3)'; }}}
    >
      <item.icon size={17} style={{ flexShrink:0, color: isActive ? col : 'inherit' }} />
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

  const initials = (userProfile?.teacherName || user?.email || '?')[0].toUpperCase();

  const Sidebar = ({ mini, onNav }) => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* Logo row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 14px 14px', borderBottom:'1px solid var(--border)' }}>
        <div style={{
          width:34, height:34, borderRadius:10, flexShrink:0,
          background:'linear-gradient(135deg,#8B5CF6,#3B82F6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 10px rgba(139,92,246,.4)',
        }}>
          <GraduationCap size={18} color="#fff" />
        </div>
        {!mini && (
          <>
            <div style={{ flex:1 }}>
              <p className="g-text" style={{ fontSize:'15px', fontWeight:900, letterSpacing:'-.02em' }}>TS:2</p>
              <p style={{ fontSize:'9px', color:'var(--t4)', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' }}>Smart Presence</p>
            </div>
            <button className="icon-btn" onClick={() => setTheme(t => t==='dark'?'light':'dark')} title="Toggle theme">
              {theme==='dark' ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {NAV.map(item => <NavItem key={item.to} item={item} collapsed={mini} onClick={onNav} />)}
      </nav>

      {/* Team */}
      {!mini && (
        <div style={{
          margin:'0 8px 8px', padding:'10px 12px', borderRadius:10,
          background:'var(--surface)', border:'1px solid var(--border)', textAlign:'center',
        }}>
          <p style={{ fontSize:'9px', fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--primary)', marginBottom:3 }}>Team</p>
          <p style={{ fontSize:'11px', color:'var(--t3)', fontWeight:500 }}>Sagar · Thejas · Supriya · Thousif</p>
        </div>
      )}

      {/* User + logout */}
      <div style={{ padding:'8px 8px 12px', borderTop:'1px solid var(--border)' }}>
        {!mini && (
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:'8px 10px', marginBottom:8,
            borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)',
          }}>
            <div style={{
              width:32, height:32, borderRadius:8, flexShrink:0,
              background:'linear-gradient(135deg,#8B5CF6,#3B82F6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:900, color:'#fff',
            }}>{initials}</div>
            <div style={{ flex:1, overflow:'hidden' }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'var(--t1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {userProfile?.teacherName || user?.email}
              </p>
              {userProfile?.subjectName && (
                <p style={{ fontSize:'10px', color:'var(--primary)', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {userProfile.subjectName} · {userProfile.semester}
                </p>
              )}
            </div>
          </div>
        )}
        <button id="logout-btn" onClick={logout} className="btn btn-secondary"
          style={{ width:'100%', justifyContent:mini?'center':'flex-start', fontSize:'12px', borderRadius:9, minHeight:36 }}>
          <LogOut size={14} />{!mini && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      {/* Desktop Sidebar */}
      <aside className="sidebar-bg" id="desk-sidebar" style={{
        width:collapsed?64:230, minWidth:collapsed?64:230,
        transition:'width .28s cubic-bezier(.22,1,.36,1), min-width .28s',
        flexDirection:'column', position:'relative', zIndex:20,
        display:'none',
      }}>
        <Sidebar mini={collapsed} />
        <button onClick={()=>setCollapsed(v=>!v)} style={{
          position:'absolute', right:-11, top:'50%', transform:'translateY(-50%)',
          width:22, height:22, borderRadius:99,
          background:'var(--primary)', border:'2px solid var(--bg)',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', zIndex:10, boxShadow:'0 2px 8px rgba(139,92,246,.4)',
        }}>
          {collapsed ? <ChevronRight size={11}/> : <ChevronLeft size={11}/>}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,.6)',backdropFilter:'blur(4px)' }}
          onClick={()=>setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className="sidebar-bg" style={{
        position:'fixed',top:0,left:0,height:'100%',width:240,zIndex:50,
        transform:mobileOpen?'translateX(0)':'translateX(-100%)',
        transition:'transform .28s cubic-bezier(.22,1,.36,1)',
      }}>
        <Sidebar mini={false} onNav={()=>setMobileOpen(false)} />
      </aside>

      {/* Content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Mobile topbar */}
        <header id="mob-bar" style={{
          display:'none', alignItems:'center', gap:12, padding:'10px 16px',
          background:'var(--nav-bg)', borderBottom:'1px solid var(--border)',
          backdropFilter:'var(--blur)', WebkitBackdropFilter:'var(--blur)',
        }}>
          <button className="icon-btn" onClick={()=>setMobileOpen(true)}><Menu size={17}/></button>
          <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#8B5CF6,#3B82F6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <GraduationCap size={14} color="#fff"/>
          </div>
          <span className="g-text" style={{ fontWeight:900, fontSize:'14px', flex:1 }}>TS:2</span>
          <button className="icon-btn" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>
            {theme==='dark'?<Sun size={14}/>:<Moon size={14}/>}
          </button>
        </header>

        <main style={{ flex:1, overflowY:'auto', padding:'22px 22px 90px' }}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav id="mob-nav" style={{
          display:'none', background:'var(--nav-bg)',
          borderTop:'1px solid var(--border)',
          backdropFilter:'var(--blur)', WebkitBackdropFilter:'var(--blur)',
        }}>
          {NAV.map(item => {
            const isActive = item.to==='/'?window.location.pathname==='/':window.location.pathname.startsWith(item.to);
            return (
              <NavLink key={item.to} to={item.to} style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:3, padding:'7px 0', textDecoration:'none', minHeight:52,
                color:isActive?item.color:'var(--t4)', fontSize:'9px', fontWeight:700,
                letterSpacing:'.05em', textTransform:'uppercase', transition:'color .18s',
              }}>
                <item.icon size={18}/>
                <span>{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <style>{`
        @media(min-width:768px){
          #desk-sidebar{display:flex!important;}
        }
        @media(max-width:767px){
          #mob-bar{display:flex!important;}
          #mob-nav{display:flex!important;}
        }
      `}</style>
    </div>
  );
}
