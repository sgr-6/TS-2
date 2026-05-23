import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, LayoutDashboard, Users, GraduationCap, BarChart3, LogOut, Menu, X, ChevronLeft, ChevronRight, Settings, Upload, Megaphone } from 'lucide-react';

const ADMIN_NAV = [
  { key:'overview',  icon:LayoutDashboard, label:'Overview',       dot:'#6366f1' },
  { key:'teachers',  icon:GraduationCap,   label:'All Teachers',   dot:'#10b981' },
  { key:'students',  icon:Users,           label:'All Students',   dot:'#7BB5E8' },
  { key:'reports',   icon:BarChart3,       label:'System Reports', dot:'#f59e0b' },
  { key:'onboarding',icon:Upload,          label:'Bulk Onboard',   dot:'#ec4899' },
  { key:'broadcasts',icon:Megaphone,       label:'Broadcasts',     dot:'#14b8a6' },
  { key:'settings',  icon:Settings,        label:'Settings',       dot:'#8B5CF6' },
];

export default function AdminLayout({ children, active, onNav }) {
  const { user, logout } = useAuth();
  const [mini, setMini] = useState(false);
  const [mob, setMob] = useState(false);
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('ts2-theme', 'light');
  },[]);

  function Rail({ isMini, onNavClick }) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 14px 16px', borderBottom:'1px solid var(--nav-edge)' }}>
          <div style={{ width:34,height:34,borderRadius:10,flexShrink:0, background:'linear-gradient(135deg,#6366f1,#8B5CF6)', display:'flex',alignItems:'center',justifyContent:'center', boxShadow:'0 3px 10px rgba(99,102,241,.35)' }}>
            <ShieldCheck size={18} color="#fff"/>
          </div>
          {!isMini && (
            <div>
              <p style={{ fontWeight:900, fontSize:'13px', color:'var(--nav-t1)', letterSpacing:'-.02em', lineHeight:1 }}>ADMIN</p>
              <p style={{ fontSize:'9px', fontWeight:600, color:'#6366f1', letterSpacing:'.08em', textTransform:'uppercase' }}>SJBIT CONTROL</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'10px 8px', display:'flex', flexDirection:'column', gap:3 }}>
          {ADMIN_NAV.map(item => {
            const isActive = active === item.key;
            return (
              <button key={item.key} onClick={()=>{ onNav(item.key); onNavClick?.(); }}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding: isMini ? '10px 14px' : '9px 12px',
                  borderRadius:12, border:`1px solid ${isActive?`${item.dot}28`:'transparent'}`,
                  background: isActive ? `${item.dot}14` : 'transparent',
                  color: isActive ? item.dot : 'var(--nav-t2)',
                  cursor:'pointer', fontSize:'13.5px', fontWeight:isActive?700:500,
                  width:'100%', textAlign:'left', fontFamily:'Plus Jakarta Sans,sans-serif',
                  transition:'all .18s ease', minHeight:40,
                  justifyContent: isMini ? 'center' : 'flex-start',
                  position:'relative',
                }}>
                {isActive && !isMini && <span style={{ position:'absolute',left:0,top:'20%',bottom:'20%',width:3,borderRadius:99,background:item.dot }}/>}
                <item.icon size={17} style={{ flexShrink:0 }}/>
                {!isMini && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom: profile + sign out */}
        <div style={{ padding:'10px 8px 14px', borderTop:'1px solid var(--nav-edge)' }}>
          {!isMini && (
            <div style={{ padding:'10px 12px', borderRadius:12, background:'rgba(99,102,241,.08)', border:'1px solid rgba(99,102,241,.18)', marginBottom:8 }}>
              <p style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', color:'#6366f1', marginBottom:2 }}>🔐 Admin</p>
              <p style={{ fontSize:'11px', fontWeight:600, color:'var(--ct2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
            </div>
          )}
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={logout}
              style={{ flex:1, height:36, borderRadius:10, border:'1px solid var(--nav-edge)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'var(--nav-t2)', fontSize:'12px', fontWeight:600, fontFamily:'inherit' }}>
              <LogOut size={14}/>
              {!isMini && 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>
      {/* Desktop sidebar */}
      <aside id="admin-desk-rail" className="sidebar-bg"
        style={{ display:'none', flexDirection:'column', width:mini?62:220, flexShrink:0, transition:'width .28s cubic-bezier(.22,1,.36,1)', position:'relative' }}>
        <button onClick={()=>setMini(v=>!v)}
          style={{ position:'absolute',top:'50%',right:-11,zIndex:10,width:22,height:22,borderRadius:'50%',border:'1px solid var(--nav-edge)',background:'var(--nav-bg)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--nav-t2)' }}>
          {mini?<ChevronRight size={11}/>:<ChevronLeft size={11}/>}
        </button>
        <Rail isMini={mini}/>
      </aside>

      {/* Mobile overlay */}
      {mob && <div style={{ position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,.55)',backdropFilter:'blur(4px)' }} onClick={()=>setMob(false)}/>}
      <aside className="sidebar-bg" style={{ position:'fixed',top:0,left:0,height:'100%',width:240,zIndex:50, transform:mob?'translateX(0)':'translateX(-100%)', transition:'transform .28s cubic-bezier(.22,1,.36,1)' }}>
        <Rail isMini={false} onNavClick={()=>setMob(false)}/>
      </aside>

      {/* Main area */}
      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0 }}>
        {/* Mobile header */}
        <header id="admin-mob-hdr" style={{ display:'none',alignItems:'center',gap:12,padding:'10px 16px', background:'var(--nav-bg)',borderBottom:'1px solid var(--nav-edge)', backdropFilter:'blur(20px)' }}>
          <button onClick={()=>setMob(true)} style={{ width:34,height:34,borderRadius:10,border:'1px solid var(--nav-edge)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--nav-t2)' }}>
            <Menu size={17}/>
          </button>
          <div style={{ width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#6366f1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <ShieldCheck size={14} color="#fff"/>
          </div>
          <span style={{ fontWeight:900,fontSize:'14px',flex:1,color:'var(--nav-t1)' }}>Admin Panel</span>
        </header>

        <main style={{ flex:1,overflowY:'auto',padding:'20px 20px 100px' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media(min-width:768px){#admin-desk-rail{display:flex!important}}
        @media(max-width:767px){#admin-mob-hdr{display:flex!important}}
      `}</style>
    </div>
  );
}
