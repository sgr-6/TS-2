import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, BookOpen, Hash, Building2, ShieldCheck } from 'lucide-react';

const SEMS = ['1st Sem','2nd Sem','3rd Sem','4th Sem','5th Sem','6th Sem','7th Sem','8th Sem'];

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label style={{ display:'block', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--ink3)', marginBottom:6 }}>
      {label}
    </label>
    <div style={{ position:'relative' }}>
      {Icon && <Icon size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--p)', pointerEvents:'none' }} />}
      {React.cloneElement(children, { style: { ...children.props.style, paddingLeft: Icon ? '2.25rem' : '1rem' } })}
    </div>
  </div>
);

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // login | register | admin
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [semester, setSemester] = useState('4th Sem');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'register') {
        if (!teacherName || !department || !subjectName || !subjectCode) { setError('All fields are required.'); return; }
        await register(email, pass, { teacherName, department, subjectName, subjectCode, semester });
      } else {
        await login(email, pass);
      }
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
        err.code === 'auth/email-already-in-use' ? 'Email already registered.' :
        err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.' :
        err.message
      );
    } finally { setLoading(false); }
  }

  const tabs = [
    { key:'login',    label:'Login'    },
    { key:'register', label:'Register' },
    { key:'admin',    label:'🔐 Admin' },
  ];

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1.5rem',
      background: 'radial-gradient(ellipse 90% 50% at 50% -10%,rgba(124,111,255,.22) 0%,transparent 60%), radial-gradient(ellipse at 95% 90%,rgba(63,169,255,.12) 0%,transparent 40%), var(--bg0)',
      position:'relative', overflow:'hidden',
    }}>
      {/* Aurora orbs */}
      {[
        { top:'-8rem', left:'-8rem', size:'28rem', color:'rgba(124,111,255,.12)' },
        { bottom:'-6rem', right:'-6rem', size:'24rem', color:'rgba(63,169,255,.10)' },
        { top:'40%', left:'45%', size:'16rem', color:'rgba(207,123,255,.08)' },
      ].map((o,i) => (
        <div key={i} style={{
          position:'fixed', borderRadius:'50%',
          width:o.size, height:o.size,
          top:o.top, bottom:o.bottom, left:o.left, right:o.right,
          background:`radial-gradient(circle,${o.color},transparent)`,
          filter:'blur(60px)', pointerEvents:'none',
        }} />
      ))}

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }} className="animate-scale-in">

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{
            width:72, height:72, borderRadius:20, margin:'0 auto 1rem',
            background:'var(--g-hero)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px var(--pglow)',
          }}>
            <GraduationCap size={34} color="#fff" />
          </div>
          <h1 style={{ fontSize:'2.2rem', fontWeight:900, letterSpacing:'-.04em', lineHeight:1 }} className="aurora-text">TS:2</h1>
          <p style={{ fontSize:'13px', color:'var(--ink3)', marginTop:6, fontWeight:500 }}>Smart Presence Simplified</p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display:'flex', padding:4,
          background:'var(--surface)', backdropFilter:'blur(16px)',
          border:'1px solid var(--edge)', borderRadius:14,
          marginBottom:'1.5rem',
        }}>
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => { setMode(t.key); setError(''); }}
              style={{
                flex:1, padding:'9px 0', borderRadius:10, border:'none', cursor:'pointer',
                fontSize:'12px', fontWeight:700, transition:'all .2s',
                background: mode===t.key ? 'var(--g-hero)' : 'transparent',
                color: mode===t.key ? '#fff' : 'var(--ink3)',
                boxShadow: mode===t.key ? '0 4px 14px var(--pglow)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background:'var(--surface)', backdropFilter:'blur(28px) saturate(200%)',
          WebkitBackdropFilter:'blur(28px) saturate(200%)',
          border:'1px solid var(--edge)', borderRadius:24,
          padding:'1.75rem',
          boxShadow:'0 24px 60px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)',
        }}>

          {/* Admin notice */}
          {mode === 'admin' && (
            <div style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'10px 14px', borderRadius:12, marginBottom:18,
              background:'var(--psub)', border:'1px solid rgba(124,111,255,.2)',
            }}>
              <ShieldCheck size={15} style={{ color:'var(--p)', flexShrink:0 }} />
              <span style={{ fontSize:'12px', color:'var(--p2)', fontWeight:600 }}>Admin access — Principals &amp; HODs only</span>
            </div>
          )}

          <h2 style={{ fontSize:'1.15rem', fontWeight:800, color:'var(--ink1)', marginBottom:4 }}>
            {mode==='admin' ? 'Admin Portal' : mode==='register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize:'12px', color:'var(--ink3)', marginBottom:'1.25rem' }}>
            {mode==='admin' ? 'Sign in with your admin credentials' :
             mode==='register' ? 'Register your subject & teaching profile' :
             'Sign in to your attendance dashboard'}
          </p>

          {error && (
            <div style={{
              padding:'10px 14px', borderRadius:12, marginBottom:16,
              background:'rgba(255,95,126,.10)', color:'var(--ruby)',
              border:'1px solid rgba(255,95,126,.25)', fontSize:'13px', fontWeight:600,
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode==='register' && (
              <Field label="Your Name" icon={User}>
                <input className="input" type="text" placeholder="e.g. Supriya" value={teacherName} onChange={e=>setTeacherName(e.target.value)} required />
              </Field>
            )}

            <Field label="Email" icon={Mail}>
              <input className="input" type="email" placeholder={mode==='admin' ? 'admin@ts2.edu' : 'teacher@college.edu'}
                value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
            </Field>

            <Field label="Password" icon={Lock}>
              <div style={{ position:'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={pass} onChange={e=>setPass(e.target.value)} required
                  style={{ paddingLeft:'2.25rem', paddingRight:'2.5rem' }} />
                <Lock size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--p)', pointerEvents:'none' }} />
                <button type="button" onClick={()=>setShowPass(v=>!v)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--ink3)' }}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </Field>

            {mode==='register' && <>
              <Field label="Department" icon={Building2}>
                <input className="input" type="text" placeholder="e.g. Mathematics, CSE" value={department} onChange={e=>setDepartment(e.target.value)} required />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Field label="Subject" icon={BookOpen}>
                  <input className="input" type="text" placeholder="e.g. Maths" value={subjectName} onChange={e=>setSubjectName(e.target.value)} required />
                </Field>
                <Field label="Code" icon={Hash}>
                  <input className="input" type="text" placeholder="e.g. 23IST420" value={subjectCode} onChange={e=>setSubjectCode(e.target.value)} required />
                </Field>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--ink3)', marginBottom:6 }}>Semester</label>
                <select className="input" value={semester} onChange={e=>setSemester(e.target.value)} style={{ appearance:'none' }}>
                  {SEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>}

            <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading}
              style={{ marginTop:4, minHeight:48, borderRadius:14, fontSize:'14px', fontWeight:700 }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
                  {mode==='register' ? 'Creating…' : 'Signing in…'}
                </span>
              ) : mode==='admin' ? '🔐 Admin Sign In' : mode==='register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {mode !== 'admin' && (
            <p style={{ textAlign:'center', fontSize:'12px', color:'var(--ink3)', marginTop:16 }}>
              {mode==='register' ? 'Already have an account? ' : "Don't have an account? "}
              <button type="button" onClick={()=>{ setMode(mode==='register' ? 'login' : 'register'); setError(''); }}
                style={{ color:'var(--p2)', background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:'12px' }}>
                {mode==='register' ? 'Sign In' : 'Register'}
              </button>
            </p>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'var(--ink4)', marginTop:20 }}>© 2025 TS:2 · Powered by Firebase</p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
