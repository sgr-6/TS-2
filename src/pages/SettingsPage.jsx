import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, CheckCircle, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const { userProfile, user, updateUserPassword } = useAuth();
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text:'', type:'' });

  async function handlePass(e) {
    e.preventDefault();
    if(pass.length < 6) { setMsg({ text:'Password must be at least 6 characters.', type:'error' }); return; }
    setLoading(true); setMsg({ text:'', type:'' });
    try {
      await updateUserPassword(pass);
      setMsg({ text:'Password updated successfully!', type:'success' });
      setPass('');
    } catch(err) {
      if(err.code === 'auth/requires-recent-login') {
        setMsg({ text:'Please log out and log back in to change your password.', type:'error' });
      } else {
        setMsg({ text: err.message, type:'error' });
      }
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your account and preferences</p>
      </div>

      <div className="card" style={{ maxWidth: 400 }}>
        <h2 style={{ fontSize:'14px',fontWeight:800,color:'var(--ct1)',marginBottom:16 }}>Profile Information</h2>
        <div style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:24 }}>
          <div><p style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase' }}>Email</p><p style={{ fontWeight:600,color:'var(--ct1)' }}>{user?.email}</p></div>
          <div><p style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase' }}>Role</p><p style={{ fontWeight:600,color:'var(--sage)',textTransform:'capitalize' }}>{userProfile?.role || 'Admin'}</p></div>
          {userProfile?.teacherName && <div><p style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase' }}>Name</p><p style={{ fontWeight:600,color:'var(--ct1)' }}>{userProfile?.teacherName}</p></div>}
        </div>

        <h2 style={{ fontSize:'14px',fontWeight:800,color:'var(--ct1)',marginBottom:16 }}>Change Password</h2>
        <form onSubmit={handlePass} style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {msg.text && (
            <div style={{ padding:'10px 14px',borderRadius:10,fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:8,
              background:msg.type==='error'?'var(--rose-l)':'var(--sage-l)',
              color:msg.type==='error'?'var(--rose)':'var(--sage)',
              border:`1px solid ${msg.type==='error'?'var(--rose-b)':'var(--sage-b)'}`
            }}>
              {msg.type==='error'?<XCircle size={14}/>:<CheckCircle size={14}/>}
              {msg.text}
            </div>
          )}
          <div style={{ position:'relative' }}>
            <Lock size={13} style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--ct4)',pointerEvents:'none' }}/>
            <input className="input" type="password" placeholder="New Password (min 6 chars)" value={pass} onChange={e=>setPass(e.target.value)} required style={{ paddingLeft:'2rem' }}/>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%',borderRadius:10,height:38,fontWeight:700 }}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
