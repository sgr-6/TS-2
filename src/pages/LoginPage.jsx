import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, BookOpen, Hash, Building2, ShieldCheck } from 'lucide-react';

const SEMS=['1st Sem','2nd Sem','3rd Sem','4th Sem','5th Sem','6th Sem','7th Sem','8th Sem'];

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [dept, setDept] = useState('');
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [semester, setSemester] = useState('4th Sem');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode==='register') {
        if (!teacherName||!dept||!subName||!subCode){setError('All fields are required.');return;}
        await register(email,pass,{teacherName,department:dept,subjectName:subName,subjectCode:subCode,semester});
      } else { await login(email,pass); }
    } catch(err) {
      setError(
        err.code==='auth/invalid-credential'?'Invalid email or password.':
        err.code==='auth/email-already-in-use'?'Email already registered.':
        err.code==='auth/weak-password'?'Password must be at least 6 characters.':err.message);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',background:'var(--bg)' }}>
      {/* Left — dark visual panel */}
      <div id="left-panel" style={{ display:'none',flex:'0 0 46%',position:'relative',overflow:'hidden',background:'var(--bg1)' }}>
        {/* Blobs */}
        {[
          {t:'8%',l:'15%',s:240,c:'rgba(126,173,124,.18)'},
          {t:'55%',l:'50%',s:200,c:'rgba(109,189,172,.14)'},
          {t:'25%',l:'40%',s:150,c:'rgba(232,188,96,.12)'},
          {t:'70%',l:'5%', s:180,c:'rgba(232,128,144,.10)'},
        ].map((b,i)=>(
          <div key={i} style={{
            position:'absolute',borderRadius:'50%',
            top:b.t,left:b.l,width:b.s,height:b.s,
            background:`radial-gradient(circle,${b.c},transparent)`,
            filter:'blur(50px)',pointerEvents:'none',
          }}/>
        ))}
        <div style={{ position:'relative',zIndex:1,padding:'2.5rem',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
          {/* Brand */}
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#7EAD7C,#6DBDAC)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(126,173,124,.4)' }}>
              <GraduationCap size={20} color="#fff"/>
            </div>
            <span style={{ fontWeight:900,fontSize:'16px',color:'var(--nav-t1)',letterSpacing:'-.02em' }}>TS:2</span>
          </div>
          {/* Hero text */}
          <div>
            <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:99,background:'rgba(126,173,124,.12)',border:'1px solid rgba(126,173,124,.25)',marginBottom:'1.2rem' }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#7EAD7C' }}/>
              <span style={{ fontSize:'10px',fontWeight:700,color:'#7EAD7C',letterSpacing:'.08em',textTransform:'uppercase' }}>Smart Attendance Platform</span>
            </div>
            <h1 style={{ fontSize:'2.5rem',fontWeight:900,color:'var(--nav-t1)',lineHeight:1.1,letterSpacing:'-.04em',marginBottom:'1rem' }}>
              Every<br/>presence<br/><span style={{ color:'#7EAD7C' }}>counts.</span>
            </h1>
            <p style={{ fontSize:'14px',color:'var(--nav-t2)',lineHeight:1.65,maxWidth:340 }}>
              Real-time attendance, smart insights, QR check-ins — built for educators.
            </p>
          </div>
          {/* Feature tags */}
          <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
            {[['#7EAD7C','QR Check-in'],['#7BB5E8','Smart Insights'],['#9B8AE8','Geo Fence'],['#E8BC60','Streaks'],['#E88090','PDF Reports']].map(([c,l])=>(
              <span key={l} style={{ padding:'5px 12px',borderRadius:99,fontSize:'11px',fontWeight:700,background:`${c}12`,border:`1px solid ${c}28`,color:c }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1.5rem',overflowY:'auto' }}>
        <div style={{ width:'100%',maxWidth:390 }} className="anim-scale">

          {/* Mobile brand */}
          <div id="mob-brand" style={{ textAlign:'center',marginBottom:'2rem' }}>
            <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#7EAD7C,#6DBDAC)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12,boxShadow:'0 6px 20px rgba(126,173,124,.35)' }}>
              <GraduationCap size={24} color="#fff"/>
            </div>
            <h1 style={{ fontSize:'1.6rem',fontWeight:900,letterSpacing:'-.04em',color:'var(--nav-t1)' }}>TS:2</h1>
            <p style={{ fontSize:'12px',color:'var(--nav-t2)',marginTop:4,fontWeight:500 }}>Smart Presence Simplified</p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding:'1.75rem' }}>
            <h2 style={{ fontSize:'1.2rem',fontWeight:800,color:'var(--ct1)',letterSpacing:'-.02em',marginBottom:4 }}>
              {mode==='admin'?'Admin Portal':mode==='register'?'Create Account':'Welcome back'}
            </h2>
            <p style={{ fontSize:'12px',color:'var(--ct3)',marginBottom:'1.2rem',fontWeight:500 }}>
              {mode==='admin'?'Principals & HODs access':mode==='register'?'Set up your subject profile':'Sign in to continue'}
            </p>

            {/* Tabs */}
            <div style={{ display:'flex',padding:3,borderRadius:12,marginBottom:'1.1rem',background:'var(--card2)',border:'1px solid var(--c-edge)' }}>
              {[['login','Sign In'],['register','Register'],['admin','Admin']].map(([k,l])=>(
                <button key={k} type="button" onClick={()=>{setMode(k);setError('');}}
                  style={{
                    flex:1,padding:'7px 0',borderRadius:9,border:'none',cursor:'pointer',
                    fontSize:'12px',fontWeight:700,transition:'all .18s',
                    fontFamily:'Plus Jakarta Sans,sans-serif',
                    background:mode===k?'var(--sage)':'transparent',
                    color:mode===k?'#fff':'var(--ct3)',
                    boxShadow:mode===k?'0 2px 8px var(--sage-b)':'none',
                  }}>{l}
                </button>
              ))}
            </div>

            {mode==='admin' && (
              <div style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 13px',borderRadius:10,marginBottom:14,background:'var(--sage-l)',border:'1px solid var(--sage-b)' }}>
                <ShieldCheck size={14} style={{ color:'var(--sage)',flexShrink:0 }}/>
                <span style={{ fontSize:'12px',color:'var(--sage)',fontWeight:600 }}>Admin credentials required</span>
              </div>
            )}

            {error && (
              <div style={{ padding:'9px 13px',borderRadius:10,marginBottom:12,background:'var(--rose-l)',color:'var(--rose)',border:'1px solid var(--rose-b)',fontSize:'13px',fontWeight:600 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {mode==='register' && (
                <Field label="Your Name">
                  <div style={{ position:'relative' }}>
                    <User size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                    <input className="input" type="text" placeholder="e.g. Supriya" value={teacherName} onChange={e=>setTeacherName(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
                  </div>
                </Field>
              )}

              <Field label="Email">
                <div style={{ position:'relative' }}>
                  <Mail size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                  <input className="input" type="email" placeholder={mode==='admin'?'admin@ts2.edu':'teacher@college.edu'} value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" style={{ paddingLeft:'2rem' }}/>
                </div>
              </Field>

              <Field label="Password">
                <div style={{ position:'relative' }}>
                  <Lock size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                  <input className="input" type={showPass?'text':'password'} placeholder="••••••••"
                    value={pass} onChange={e=>setPass(e.target.value)} required
                    style={{ paddingLeft:'2rem',paddingRight:'2.4rem' }}
                    autoComplete={mode==='register'?'new-password':'current-password'}/>
                  <button type="button" onClick={()=>setShowPass(v=>!v)}
                    style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--ct3)',display:'flex' }}>
                    {showPass?<EyeOff size={13}/>:<Eye size={13}/>}
                  </button>
                </div>
              </Field>

              {mode==='register' && <>
                <Field label="Department">
                  <div style={{ position:'relative' }}>
                    <Building2 size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                    <input className="input" type="text" placeholder="e.g. Mathematics, CSE" value={dept} onChange={e=>setDept(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
                  </div>
                </Field>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <Field label="Subject">
                    <div style={{ position:'relative' }}>
                      <BookOpen size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                      <input className="input" type="text" placeholder="Maths" value={subName} onChange={e=>setSubName(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
                    </div>
                  </Field>
                  <Field label="Subject Code">
                    <div style={{ position:'relative' }}>
                      <Hash size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                      <input className="input" type="text" placeholder="23IST420" value={subCode} onChange={e=>setSubCode(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
                    </div>
                  </Field>
                </div>
                <Field label="Semester">
                  <select className="input" value={semester} onChange={e=>setSemester(e.target.value)} style={{ appearance:'none' }}>
                    {SEMS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </>}

              <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading}
                style={{ marginTop:4,minHeight:42,borderRadius:12,fontSize:'14px',fontWeight:800,width:'100%' }}>
                {loading?(
                  <span style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .6s linear infinite' }}/>
                    {mode==='register'?'Creating account…':'Signing in…'}
                  </span>
                ):mode==='admin'?'🔐 Admin Sign In':mode==='register'?'Create Account →':'Sign In →'}
              </button>
            </form>

            {mode!=='admin' && (
              <p style={{ textAlign:'center',fontSize:'12px',color:'var(--ct3)',marginTop:14,fontWeight:500 }}>
                {mode==='register'?'Already have an account? ':'No account yet? '}
                <button type="button" onClick={()=>{setMode(mode==='register'?'login':'register');setError('');}}
                  style={{ color:'var(--sage)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:'12px',fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                  {mode==='register'?'Sign In':'Register free'}
                </button>
              </p>
            )}
          </div>

          <p style={{ textAlign:'center',fontSize:'11px',color:'var(--nav-t3)',marginTop:18,fontWeight:500 }}>© 2025 TS:2 · Powered by Firebase</p>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:900px){#left-panel{display:block!important}#mob-brand{display:none!important}}
      `}</style>
    </div>
  );
}
