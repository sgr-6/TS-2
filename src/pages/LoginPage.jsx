import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, BookOpen, Hash, Building2, ShieldCheck } from 'lucide-react';

const SEMS = ['1st Sem','2nd Sem','3rd Sem','4th Sem','5th Sem','6th Sem','7th Sem','8th Sem'];

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
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'register') {
        if (!teacherName||!dept||!subName||!subCode) { setError('All fields are required.'); return; }
        await register(email, pass, { teacherName, department:dept, subjectName:subName, subjectCode:subCode, semester });
      } else {
        await login(email, pass);
      }
    } catch(err) {
      setError(
        err.code==='auth/invalid-credential' ? 'Invalid email or password.' :
        err.code==='auth/email-already-in-use' ? 'This email is already registered.' :
        err.code==='auth/weak-password' ? 'Password must be at least 6 characters.' :
        err.message
      );
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex',
      background:'var(--bg)',
      position:'relative', overflow:'hidden',
    }}>
      {/* Left panel — big visual */}
      <div style={{
        display:'none', flex:'0 0 48%', position:'relative', overflow:'hidden',
        background:'linear-gradient(145deg,#0D0B2A 0%,#1A0A3E 40%,#0A1A40 100%)',
      }} id="left-panel">
        {/* Colorful blobs */}
        {[
          {top:'5%',left:'10%',size:280,color:'rgba(139,92,246,.22)'},
          {top:'55%',left:'55%',size:220,color:'rgba(59,130,246,.18)'},
          {top:'30%',left:'30%',size:160,color:'rgba(6,182,212,.14)'},
          {top:'75%',left:'5%', size:180,color:'rgba(16,185,129,.14)'},
          {top:'10%',left:'60%',size:130,color:'rgba(236,72,153,.12)'},
        ].map((b,i)=>(
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            top:b.top, left:b.left,
            width:b.size, height:b.size,
            background:`radial-gradient(circle,${b.color},transparent)`,
            filter:'blur(40px)', pointerEvents:'none',
          }}/>
        ))}

        <div style={{ position:'relative', zIndex:1, padding:'3rem', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#8B5CF6,#3B82F6)',display:'flex',alignItems:'center',justifyContent:'center', boxShadow:'0 4px 14px rgba(139,92,246,.5)' }}>
              <GraduationCap size={20} color="#fff"/>
            </div>
            <span style={{ fontWeight:900, fontSize:'16px', color:'#fff', letterSpacing:'-.02em' }}>TS:2</span>
          </div>

          <div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6, padding:'6px 14px',
              borderRadius:99, marginBottom:'1.5rem',
              background:'rgba(139,92,246,.15)', border:'1px solid rgba(139,92,246,.3)',
            }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#8B5CF6' }}/>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#A78BFA', letterSpacing:'.06em', textTransform:'uppercase' }}>Smart Attendance Platform</span>
            </div>
            <h1 style={{ fontSize:'2.8rem', fontWeight:900, color:'#fff', lineHeight:1.1, letterSpacing:'-.04em', marginBottom:'1rem' }}>
              Track every<br/>
              <span className="g-text">presence</span><br/>
              effortlessly.
            </h1>
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,.5)', lineHeight:1.65, maxWidth:380 }}>
              Real-time attendance tracking, smart insights, QR check-ins and powerful reports — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {[
              ['#8B5CF6','QR Check-in'],['#10B981','Smart Insights'],
              ['#3B82F6','Geo Fencing'],['#F59E0B','Streak Tracking'],
              ['#EC4899','PDF Reports'],
            ].map(([c,l])=>(
              <span key={l} style={{
                padding:'5px 12px', borderRadius:99, fontSize:'11px', fontWeight:700,
                background:`${c}15`, border:`1px solid ${c}30`, color:c,
              }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        padding:'2rem 1.5rem', overflowY:'auto',
      }}>
        <div style={{ width:'100%', maxWidth:400 }} className="anim-scale">

          {/* Mobile brand */}
          <div id="mob-brand" style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ width:56,height:56,borderRadius:14,background:'linear-gradient(135deg,#8B5CF6,#3B82F6)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12,boxShadow:'0 6px 20px rgba(139,92,246,.4)' }}>
              <GraduationCap size={26} color="#fff"/>
            </div>
            <h1 className="g-text" style={{ fontSize:'1.8rem', fontWeight:900, letterSpacing:'-.04em' }}>TS:2</h1>
            <p style={{ fontSize:'13px', color:'var(--t3)', marginTop:4, fontWeight:500 }}>Smart Presence Simplified</p>
          </div>

          <h2 style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--t1)', letterSpacing:'-.02em', marginBottom:4 }}>
            {mode==='admin'?'Admin Portal':mode==='register'?'Create Account':'Welcome back'}
          </h2>
          <p style={{ fontSize:'13px', color:'var(--t3)', marginBottom:'1.5rem' }}>
            {mode==='admin'?'Principals & HODs access':mode==='register'?'Register your subject & profile':'Sign in to your dashboard'}
          </p>

          {/* Tabs */}
          <div style={{
            display:'flex', padding:3, borderRadius:11, marginBottom:'1.25rem',
            background:'var(--surface)', border:'1px solid var(--border)',
          }}>
            {[['login','Login'],['register','Register'],['admin','🔐 Admin']].map(([k,l])=>(
              <button key={k} type="button" onClick={()=>{setMode(k);setError('');}}
                style={{
                  flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer',
                  fontSize:'12px', fontWeight:700, transition:'all .18s',
                  background:mode===k?'linear-gradient(135deg,#8B5CF6,#6366F1)':'transparent',
                  color:mode===k?'#fff':'var(--t3)',
                  boxShadow:mode===k?'0 2px 10px rgba(139,92,246,.35)':'none',
                }}>{l}
              </button>
            ))}
          </div>

          {mode==='admin' && (
            <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:10,marginBottom:16,background:'rgba(139,92,246,.08)',border:'1px solid rgba(139,92,246,.2)' }}>
              <ShieldCheck size={14} style={{color:'#8B5CF6',flexShrink:0}}/>
              <span style={{fontSize:'12px',color:'#A78BFA',fontWeight:600}}>Admin credentials required</span>
            </div>
          )}

          {error && (
            <div style={{ padding:'10px 14px',borderRadius:10,marginBottom:14,background:'rgba(244,63,94,.08)',color:'#F43F5E',border:'1px solid rgba(244,63,94,.2)',fontSize:'13px',fontWeight:600 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
            {mode==='register' && <FormField label="Your Name" icon={User}><input className="input" type="text" placeholder="e.g. Supriya" value={teacherName} onChange={e=>setTeacherName(e.target.value)} required/></FormField>}

            <FormField label="Email" icon={Mail}>
              <input className="input" type="email" placeholder={mode==='admin'?'admin@ts2.edu':'teacher@college.edu'} value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
            </FormField>

            <div>
              <label style={{display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--t3)',marginBottom:6}}>Password</label>
              <div style={{position:'relative'}}>
                <Lock size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--t4)',pointerEvents:'none'}}/>
                <input className="input" type={showPass?'text':'password'} placeholder="••••••••"
                  value={pass} onChange={e=>setPass(e.target.value)} required
                  style={{paddingLeft:'2.1rem',paddingRight:'2.5rem'}} autoComplete={mode==='register'?'new-password':'current-password'}/>
                <button type="button" onClick={()=>setShowPass(v=>!v)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex'}}>
                  {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
            </div>

            {mode==='register' && <>
              <FormField label="Department" icon={Building2}><input className="input" type="text" placeholder="e.g. Mathematics, CSE" value={dept} onChange={e=>setDept(e.target.value)} required/></FormField>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <FormField label="Subject" icon={BookOpen}><input className="input" type="text" placeholder="e.g. Maths" value={subName} onChange={e=>setSubName(e.target.value)} required/></FormField>
                <FormField label="Code" icon={Hash}><input className="input" type="text" placeholder="e.g. 23IST420" value={subCode} onChange={e=>setSubCode(e.target.value)} required/></FormField>
              </div>
              <div>
                <label style={{display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--t3)',marginBottom:6}}>Semester</label>
                <select className="input" value={semester} onChange={e=>setSemester(e.target.value)} style={{appearance:'none'}}>
                  {SEMS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </>}

            <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading}
              style={{marginTop:6,minHeight:44,borderRadius:11,fontSize:'14px',fontWeight:700}}>
              {loading?(
                <span style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:15,height:15,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
                  {mode==='register'?'Creating account…':'Signing in…'}
                </span>
              ):mode==='admin'?'🔐 Admin Sign In':mode==='register'?'Create Account →':'Sign In →'}
            </button>
          </form>

          {mode!=='admin' && (
            <p style={{textAlign:'center',fontSize:'12px',color:'var(--t3)',marginTop:16}}>
              {mode==='register'?'Already have an account? ':'No account yet? '}
              <button type="button" onClick={()=>{setMode(mode==='register'?'login':'register');setError('');}}
                style={{color:'var(--primary)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:'12px'}}>
                {mode==='register'?'Sign In':'Register free'}
              </button>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:900px){
          #left-panel{display:flex!important}
          #mob-brand{display:none!important}
        }
      `}</style>
    </div>
  );
}

function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label style={{display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--t3)',marginBottom:6}}>{label}</label>
      <div style={{position:'relative'}}>
        {Icon && <Icon size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--t4)',pointerEvents:'none'}}/>}
        {React.cloneElement(children,{style:{...(children.props.style||{}),paddingLeft:Icon?'2.1rem':'1rem'}})}
      </div>
    </div>
  );
}
