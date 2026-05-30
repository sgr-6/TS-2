import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, BarChart3, LogOut,
  GraduationCap, Menu, Brain,
  ChevronLeft, ChevronRight, Settings
} from 'lucide-react';

const NAV = [
  { to:'/',           icon:LayoutDashboard, label:'Dashboard',      dot:'#7EAD7C' },
  { to:'/students',   icon:Users,            label:'Students',       dot:'#7BB5E8' },
  { to:'/attendance', icon:CalendarCheck,    label:'Attendance',     dot:'#E08B6A' },
  { to:'/insights',   icon:Brain,            label:'Smart Insights', dot:'#9B8AE8' },
  { to:'/reports',    icon:BarChart3,        label:'Reports',        dot:'#6DBDAC' },
  { to:'/settings',   icon:Settings,         label:'Settings',       dot:'#8B5CF6' },
];

function NavItem({ item, mini, onClick }) {
  const { pathname } = useLocation();
  const active = item.to==='/' ? pathname==='/' : pathname.startsWith(item.to);
  return (
    <NavLink to={item.to} onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding: mini ? '10px 14px' : '9px 12px',
        borderRadius:12, border:'1px solid transparent',
        textDecoration:'none', fontSize:'13.5px', fontWeight:active?700:500,
        color: active ? item.dot : 'var(--nav-t2)',
        background: active ? `${item.dot}14` : 'transparent',
        borderColor: active ? `${item.dot}28` : 'transparent',
        transition:'all .18s ease', minHeight:40,
        justifyContent: mini ? 'center' : 'flex-start',
        position:'relative',
      }}
      onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=`${item.dot}0D`;e.currentTarget.style.color=item.dot;} }}
      onMouseLeave={e=>{ if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--nav-t2)';} }}
    >
      {active && !mini && <span style={{ position:'absolute',left:0,top:'20%',bottom:'20%',width:3,borderRadius:99,background:item.dot }} />}
      <item.icon size={17} style={{ flexShrink:0 }} />
      {!mini && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const { user, userProfile, activeClassIndex, setActiveClassIndex, logout } = useAuth();
  const [mini, setMini] = useState(false);
  const [mob, setMob] = useState(false);

  useEffect(()=>{
    // Force Light Creme theme for SJBIT branding
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('sjbit-theme', 'light');
  }, []);

  const initial = (userProfile?.teacherName||user?.email||'?')[0].toUpperCase();

  const Rail = ({ isMini, onNav }) => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', justifyContent: isMini ? 'center' : 'flex-start', gap:10, padding: isMini ? '14px 8px 12px' : '14px 14px 12px', borderBottom:'1px solid var(--nav-edge)' }}>
        <img src="/sjbit-logo-v2.jpg" alt="SJBIT Logo" style={{ width: isMini ? 42 : 56, height: isMini ? 42 : 56, borderRadius:8, objectFit:'contain', flexShrink:0, transition: 'all 0.28s' }} />
        {!isMini && (
          <div style={{ flex:1 }}>
            <p style={{ fontSize:'16px',fontWeight:900,letterSpacing:'-.025em',color:'var(--nav-t1)', lineHeight:1.1, marginBottom: 2 }}>SJBIT</p>
            <p style={{ fontSize:'9px',fontWeight:600,color:'var(--nav-t3)',letterSpacing:'.1em',textTransform:'uppercase' }}>Attendance Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:'10px 8px',display:'flex',flexDirection:'column',gap:2,overflowY:'auto' }}>
        {NAV.map(item=><NavItem key={item.to} item={item} mini={isMini} onClick={onNav}/>)}
      </nav>

      {/* Team */}
      {!isMini && (
        <div style={{ margin:'0 8px 8px',padding:'9px 12px',borderRadius:12,background:'rgba(126,173,124,.08)',border:'1px solid rgba(126,173,124,.15)',textAlign:'center' }}>
          <p style={{ fontSize:'9px',fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--sage)',marginBottom:3 }}>SJBIT Admin</p>
          <p style={{ fontSize:'11px',color:'var(--nav-t2)',fontWeight:500 }}>Smart Attendance System</p>
        </div>
      )}

      {/* User */}
      <div style={{ padding:'8px 8px 14px',borderTop:'1px solid var(--nav-edge)' }}>
        {userProfile?.classes && userProfile.classes.length > 0 && !isMini && (
          <div style={{ marginBottom: 8, padding: '0 8px' }}>
            <p style={{ fontSize:'9px', fontWeight:700, color:'var(--nav-t3)', marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em' }}>Active Class</p>
            <select
              value={activeClassIndex}
              onChange={(e) => setActiveClassIndex(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid var(--nav-edge)', background: 'rgba(255,255,255,0.04)', color: 'var(--nav-t1)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
            >
              {userProfile.classes.map((cls, idx) => (
                <option key={idx} value={idx} style={{ color: '#000' }}>
                  {cls.subjectName} · {cls.section}
                </option>
              ))}
            </select>
          </div>
        )}
        {!isMini && (
          <div style={{ display:'flex',alignItems:'center',gap:9,padding:'8px 10px',marginBottom:8,borderRadius:12,background:'rgba(255,255,255,0.04)',border:'1px solid var(--nav-edge)' }}>
            <div style={{ width:30,height:30,borderRadius:8,flexShrink:0,background:'linear-gradient(135deg,#7EAD7C,#6DBDAC)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff' }}>
              {initial}
            </div>
            <div style={{ flex:1,overflow:'hidden' }}>
              <p style={{ fontSize:'12px',fontWeight:700,color:'var(--nav-t1)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
                {userProfile?.teacherName||user?.email}
              </p>
              {(userProfile?.classes ? userProfile.classes[activeClassIndex]?.subjectName : userProfile?.subjectName) && (
                <p style={{ fontSize:'10px',color:'var(--sage)',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
                  {userProfile?.classes ? userProfile.classes[activeClassIndex]?.subjectName : userProfile?.subjectName} · {userProfile?.classes ? userProfile.classes[activeClassIndex]?.semester : userProfile?.semester}
                </p>
              )}
            </div>
          </div>
        )}
        <button id="logout-btn" onClick={logout} className="btn btn-secondary"
          style={{ width:'100%',justifyContent:isMini?'center':'flex-start',fontSize:'12px',borderRadius:10,minHeight:36,background:'transparent',color:'var(--nav-t2)',border:'1px solid var(--nav-edge)' }}>
          <LogOut size={14}/>{!isMini&&'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex',height:'100vh',overflow:'hidden',background:'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className="sidebar-bg" id="desk-rail" style={{
        width:mini?64:230, minWidth:mini?64:230,
        transition:'width .28s cubic-bezier(.22,1,.36,1),min-width .28s',
        display:'none', flexDirection:'column', position:'relative', zIndex:20,
      }}>
        <Rail isMini={mini}/>
        <button onClick={()=>setMini(v=>!v)} style={{
          position:'absolute',right:-11,top:'50%',transform:'translateY(-50%)',
          width:22,height:22,borderRadius:99,
          background:'var(--sage)',border:'2px solid var(--bg)',
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
          color:'#fff',zIndex:10,boxShadow:'0 2px 8px rgba(126,173,124,.4)',
        }}>
          {mini?<ChevronRight size={10}/>:<ChevronLeft size={10}/>}
        </button>
      </aside>

      {mob && <div style={{ position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,.55)',backdropFilter:'blur(4px)' }} onClick={()=>setMob(false)}/>}

      <aside className="sidebar-bg" style={{
        position:'fixed',top:0,left:0,height:'100%',width:240,zIndex:50,
        transform:mob?'translateX(0)':'translateX(-100%)',
        transition:'transform .28s cubic-bezier(.22,1,.36,1)',
      }}>
        <Rail isMini={false} onNav={()=>setMob(false)}/>
      </aside>

      <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0 }}>
        {/* Mobile header */}
        <header id="mob-hdr" style={{
          display:'none',alignItems:'center',gap:12,padding:'10px 16px',
          background:'var(--nav-bg)',borderBottom:'1px solid var(--nav-edge)',
          backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
        }}>
          <button className="icon-btn" onClick={()=>setMob(true)}><Menu size={17}/></button>
          <img src="/sjbit-logo-v2.jpg" alt="SJBIT Logo" style={{ width:32, height:32, objectFit:'contain' }} />
          <span style={{ fontWeight:900,fontSize:'14px',flex:1,color:'var(--nav-t1)',letterSpacing:'-.02em' }}>SJBIT</span>
        </header>

        <main style={{ flex:1,overflowY:'auto',padding:'20px 20px 100px' }}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav id="mob-nav" style={{
          display:'none',background:'var(--nav-bg)',
          borderTop:'1px solid var(--nav-edge)',
          backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
        }}>
          {NAV.map(item=>{
            const active=item.to==='/'?window.location.pathname==='/':window.location.pathname.startsWith(item.to);
            return(
              <NavLink key={item.to} to={item.to} style={{
                flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                gap:3,padding:'7px 0',textDecoration:'none',minHeight:52,
                color:active?item.dot:'var(--nav-t3)',fontSize:'9px',fontWeight:700,
                letterSpacing:'.05em',textTransform:'uppercase',transition:'color .18s',
              }}>
                <item.icon size={18}/><span>{item.label.split(' ')[0]}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <style>{`
        @media(min-width:768px){#desk-rail{display:flex!important}}
        @media(max-width:767px){#mob-hdr{display:flex!important}#mob-nav{display:flex!important}}
      `}</style>

    </div>
  );
}
