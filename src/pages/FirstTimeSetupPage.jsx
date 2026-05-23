import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, User, Building2, BookOpen, Hash } from 'lucide-react';

const SEMS=['1st Sem','2nd Sem','3rd Sem','4th Sem','5th Sem','6th Sem','7th Sem','8th Sem'];

export default function FirstTimeSetupPage() {
  const { completeFirstTimeSetup, loading, userProfile, updateUserPassword, updateUserEmail } = useAuth();
  
  const isDemoAccount = userProfile?.isDemoAccount === true;

  const [teacherName, setTeacherName] = useState(userProfile?.teacherName || '');
  const [dept, setDept] = useState(userProfile?.department || '');
  const [subName, setSubName] = useState(userProfile?.subjectName || '');
  const [subCode, setSubCode] = useState(userProfile?.subjectCode || '');
  const [semester, setSemester] = useState(userProfile?.semester || '4th Sem');
  const [className, setClassName] = useState(userProfile?.className || '');
  const [section, setSection] = useState(userProfile?.section || '');
  
  // Security fields
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!teacherName || !dept || !subName || !subCode || !className || !section) {
      setError('All fields are required.');
      return;
    }
    if (isDemoAccount && (!newEmail || !newPassword)) {
      setError('You must set a new email and password to secure your account.');
      return;
    }
    setSaving(true);
    setError('');
    
    try {
      if (isDemoAccount) {
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        await updateUserEmail(newEmail);
        await updateUserPassword(newPassword);
      }

      await completeFirstTimeSetup({
        teacherName,
        department: dept,
        subjectName: subName,
        subjectCode: subCode,
        semester,
        className,
        section,
        email: isDemoAccount ? newEmail : userProfile.email,
        isDemoAccount: false
      });
    } catch(err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div style={{ minHeight:'100vh',display:'flex',background:'var(--bg)', alignItems:'center', justifyContent:'center', padding:'2rem 1.5rem' }}>
      <div style={{ width:'100%',maxWidth:420 }} className="anim-scale">
        <div style={{ textAlign:'center',marginBottom:'2rem' }}>
          <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#7EAD7C,#6DBDAC)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:12,boxShadow:'0 6px 20px rgba(126,173,124,.35)' }}>
            <GraduationCap size={24} color="#fff"/>
          </div>
          <h1 style={{ fontSize:'1.6rem',fontWeight:900,letterSpacing:'-.04em',color:'var(--nav-t1)' }}>Complete Profile</h1>
          <p style={{ fontSize:'12px',color:'var(--nav-t2)',marginTop:4,fontWeight:500 }}>Please set up your teaching profile before continuing.</p>
        </div>

        <div className="card" style={{ padding:'1.75rem' }}>
          {isDemoAccount && (
            <div style={{ padding:'12px',borderRadius:10,marginBottom:16,background:'var(--rose-l)',border:'1px solid var(--rose-b)',display:'flex',flexDirection:'column',gap:4 }}>
              <p style={{ fontSize:'13px',fontWeight:800,color:'var(--rose)' }}>Security Interceptor Triggered</p>
              <p style={{ fontSize:'12px',fontWeight:600,color:'var(--rose)' }}>You are using temporary demo credentials. You MUST set a secure email and password before accessing the dashboard.</p>
            </div>
          )}

          {error && (
            <div style={{ padding:'9px 13px',borderRadius:10,marginBottom:12,background:'var(--rose-l)',color:'var(--rose)',border:'1px solid var(--rose-b)',fontSize:'13px',fontWeight:600 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:12 }}>
            
            {isDemoAccount && (
              <>
                <div style={{ padding: '16px', background: 'var(--card3)', borderRadius: 10, border: '1px solid var(--c-edge)', marginBottom: 8 }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ct1)', marginBottom: 12 }}>1. Secure Your Account</h3>
                  
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>New Email Address</label>
                    <input className="input" type="email" placeholder="your.actual@email.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required={isDemoAccount} />
                  </div>
                  
                  <div>
                    <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>New Secure Password</label>
                    <input className="input" type="password" placeholder="At least 6 characters" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required={isDemoAccount} minLength={6} />
                  </div>
                </div>
                
                <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ct1)', marginTop: 8, marginLeft: 4 }}>2. Confirm Profile Details</h3>
              </>
            )}

            <div>
              <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Your Name</label>
              <div style={{ position:'relative' }}>
                <User size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                <input className="input" type="text" placeholder="e.g. Dr. Supriya" value={teacherName} onChange={e=>setTeacherName(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
              </div>
            </div>

            <div>
              <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Department</label>
              <div style={{ position:'relative' }}>
                <Building2 size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                <input className="input" type="text" placeholder="e.g. CSE" value={dept} onChange={e=>setDept(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
              </div>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
              <div>
                <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Class / Year</label>
                <div style={{ position:'relative' }}>
                  <input className="input" type="text" placeholder="e.g. B.Tech 2nd Yr" value={className} onChange={e=>setClassName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Section</label>
                <div style={{ position:'relative' }}>
                  <input className="input" type="text" placeholder="e.g. A" value={section} onChange={e=>setSection(e.target.value)} required />
                </div>
              </div>
            </div>

            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
              <div>
                <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Subject Name</label>
                <div style={{ position:'relative' }}>
                  <BookOpen size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                  <input className="input" type="text" placeholder="Maths" value={subName} onChange={e=>setSubName(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
                </div>
              </div>
              <div>
                <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Subject Code</label>
                <div style={{ position:'relative' }}>
                  <Hash size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
                  <input className="input" type="text" placeholder="23IST420" value={subCode} onChange={e=>setSubCode(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>Semester</label>
              <select className="input" value={semester} onChange={e=>setSemester(e.target.value)} style={{ appearance:'none' }}>
                {SEMS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop:4,minHeight:42,borderRadius:12,fontSize:'14px',fontWeight:800,width:'100%' }}>
              {saving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
