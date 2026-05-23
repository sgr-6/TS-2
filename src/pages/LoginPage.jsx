import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode==='forgot') {
        await resetPassword(email);
        alert('Password reset email sent! Check your inbox.');
        setMode('login');
      } else { 
        await login(email,pass); 
      }
    } catch(err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        const e = email.toLowerCase().trim();
        if ((e === 'admin@gmail.com' && pass === 'admin789') || (e === 'hodise@gmail.com' && pass === 'hodise789')) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, e, pass);
            await setDoc(doc(db, 'teachers', cred.user.uid), {
              email: e,
              uid: cred.user.uid,
              role: e === 'admin@gmail.com' ? 'admin' : 'hod',
              department: e === 'hodise@gmail.com' ? 'ISE Dept' : 'Admin',
              firstTimeSetupComplete: true,
              createdAt: serverTimestamp(),
            });
            return; // Successful auto-registration and login
          } catch(regErr) {
            setError(regErr.message);
            return;
          }
        }
      }
      setError(
        err.code==='auth/invalid-credential'?'Invalid email or password.':
        err.code==='auth/user-not-found'?'No account found with this email.':
        err.message);
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
            <span style={{ fontWeight:900,fontSize:'16px',color:'var(--nav-t1)',letterSpacing:'-.02em' }}>SJBIT</span>
          </div>
          {/* Hero text */}
          <div>
            <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:99,background:'rgba(126,173,124,.12)',border:'1px solid rgba(126,173,124,.25)',marginBottom:'1.2rem' }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:'#7EAD7C' }}/>
              <span style={{ fontSize:'10px',fontWeight:700,color:'#7EAD7C',letterSpacing:'.08em',textTransform:'uppercase' }}>Enterprise Attendance System</span>
            </div>
            <h1 style={{ fontSize:'2.5rem',fontWeight:900,color:'var(--nav-t1)',lineHeight:1.1,letterSpacing:'-.04em',marginBottom:'1rem' }}>
              Secure,<br/>Streamlined,<br/><span style={{ color:'#7EAD7C' }}>Scalable.</span>
            </h1>
            <p style={{ fontSize:'14px',color:'var(--nav-t2)',lineHeight:1.65,maxWidth:340 }}>
              Authorized access only. Real-time attendance, predictive analytics, and department management for SJBIT.
            </p>
          </div>
          {/* Feature tags */}
          <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
            {[['#7EAD7C','Attendance tracking'],['#7BB5E8','Smart Insights'],['#E8BC60','Streaks'],['#E88090','PDF Reports']].map(([c,l])=>(
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
            <h1 style={{ fontSize:'1.6rem',fontWeight:900,letterSpacing:'-.04em',color:'var(--nav-t1)' }}>SJBIT</h1>
            <p style={{ fontSize:'12px',color:'var(--nav-t2)',marginTop:4,fontWeight:500 }}>Enterprise Attendance System</p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding:'1.75rem' }}>
            <h2 style={{ fontSize:'1.2rem',fontWeight:800,color:'var(--ct1)',letterSpacing:'-.02em',marginBottom:4 }}>
              {mode==='forgot'?'Reset Password':'Sign In'}
            </h2>
            <p style={{ fontSize:'12px',color:'var(--ct3)',marginBottom:'1.2rem',fontWeight:500 }}>
              {mode==='forgot'?'Enter your email to receive a reset link':'Authorized personnel only'}
            </p>

            {error && (
              <div style={{ padding:'9px 13px',borderRadius:10,marginBottom:12,background:'var(--rose-l)',color:'var(--rose)',border:'1px solid var(--rose-b)',fontSize:'13px',fontWeight:600 }}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
              <Field label="Email">
                <div style={{ position:'relative' }}>
                  <Mail size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                  <input className="input" type="email" placeholder={'teacher@sjbit.edu'} value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" style={{ paddingLeft:'2rem' }}/>
                </div>
              </Field>

              {mode !== 'forgot' && (
                <Field label={
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span>Password</span>
                    <button type="button" onClick={()=>{setMode('forgot');setError('');}} style={{ color:'var(--sky)',background:'none',border:'none',cursor:'pointer',fontSize:'10px',fontWeight:700,textTransform:'none' }}>Forgot?</button>
                  </div>
                }>
                  <div style={{ position:'relative' }}>
                    <Lock size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                    <input className="input" type={showPass?'text':'password'} placeholder="••••••••"
                      value={pass} onChange={e=>setPass(e.target.value)} required
                      style={{ paddingLeft:'2rem',paddingRight:'2.4rem' }}
                      autoComplete={'current-password'}/>
                    <button type="button" onClick={()=>setShowPass(v=>!v)}
                      style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--ct3)',display:'flex' }}>
                      {showPass?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                </Field>
              )}

              <button id="login-submit-btn" type="submit" className="btn btn-primary" disabled={loading}
                style={{ marginTop:4,minHeight:42,borderRadius:12,fontSize:'14px',fontWeight:800,width:'100%' }}>
                {loading?(
                  <span style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .6s linear infinite' }}/>
                    {mode==='forgot'?'Sending email…':'Signing in…'}
                  </span>
                ):mode==='forgot'?'Send Reset Link':'Sign In →'}
              </button>
            </form>

            {/* Remembered password */}
            {mode==='forgot' && (
              <p style={{ textAlign:'center',fontSize:'12px',color:'var(--ct3)',marginTop:14,fontWeight:500 }}>
                Remembered your password? <button type="button" onClick={()=>{setMode('login');setError('');}} style={{ color:'var(--sage)',background:'none',border:'none',cursor:'pointer',fontWeight:700,fontSize:'12px',fontFamily:'Plus Jakarta Sans,sans-serif' }}>Sign In</button>
              </p>
            )}

          </div>

          <p style={{ textAlign:'center',fontSize:'11px',color:'var(--nav-t3)',marginTop:18,fontWeight:500 }}>© 2025 SJBIT Enterprise · Powered by Firebase</p>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:900px){#left-panel{display:block!important}#mob-brand{display:none!important}}
      `}</style>
    </div>
  );
}
