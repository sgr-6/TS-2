import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { userProfile, user, updateUserPassword, completeFirstTimeSetup, deleteAccount } = useAuth();
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text:'', type:'' });
  
  // Profile editing state
  const [profileData, setProfileData] = useState({
    teacherName: userProfile?.teacherName || '',
    department: userProfile?.department || '',
    className: userProfile?.className || '',
    section: userProfile?.section || '',
    subjectName: userProfile?.subjectName || '',
    subjectCode: userProfile?.subjectCode || '',
    semester: userProfile?.semester || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text:'', type:'' });

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text:'', type:'' });
    try {
      await completeFirstTimeSetup(profileData);
      setProfileMsg({ text:'Profile updated successfully!', type:'success' });
    } catch(err) {
      setProfileMsg({ text: err.message, type:'error' });
    } finally {
      setProfileLoading(false);
    }
  }

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

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState({ text:'', type:'' });

  async function handleDeleteAccount() {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone and will permanently erase your data.");
    if (!confirmed) return;
    
    setDeleteLoading(true);
    setDeleteMsg({ text:'', type:'' });
    try {
      await deleteAccount();
    } catch(err) {
      if(err.code === 'auth/requires-recent-login') {
        setDeleteMsg({ text:'Please log out and log back in before deleting your account.', type:'error' });
      } else {
        setDeleteMsg({ text: err.message, type:'error' });
      }
      setDeleteLoading(false);
    }
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Manage your account and preferences</p>
      </div>

      <div className="card" style={{ maxWidth: 400 }}>
        <h2 style={{ fontSize:'14px',fontWeight:800,color:'var(--ct1)',marginBottom:16 }}>Profile Information</h2>
        
        {profileMsg.text && (
          <div style={{ padding:'10px 14px',borderRadius:10,fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:8,marginBottom:16,
            background:profileMsg.type==='error'?'var(--rose-l)':'var(--sage-l)',
            color:profileMsg.type==='error'?'var(--rose)':'var(--sage)',
            border:`1px solid ${profileMsg.type==='error'?'var(--rose-b)':'var(--sage-b)'}`
          }}>
            {profileMsg.type==='error'?<XCircle size={14}/>:<CheckCircle size={14}/>}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display:'flex',flexDirection:'column',gap:12,marginBottom:32 }}>
          <div><p style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',marginBottom:4 }}>Email</p><p style={{ fontWeight:600,color:'var(--ct1)',fontSize:'14px' }}>{user?.email}</p></div>
          <div><p style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',marginBottom:4 }}>Role</p><p style={{ fontWeight:600,color:'var(--sage)',textTransform:'capitalize',fontSize:'14px' }}>{userProfile?.role || 'Admin'}</p></div>
          
          <div>
            <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Name</label>
            <input className="input" type="text" value={profileData.teacherName} onChange={e=>setProfileData(p=>({...p, teacherName: e.target.value}))} required />
          </div>
          <div>
            <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Department</label>
            <input className="input" type="text" value={profileData.department} onChange={e=>setProfileData(p=>({...p, department: e.target.value}))} required />
          </div>
          <div style={{ display:'flex',gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Class</label>
              <input className="input" type="text" value={profileData.className} onChange={e=>setProfileData(p=>({...p, className: e.target.value}))} placeholder="e.g. ISE" required />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Section</label>
              <input className="input" type="text" value={profileData.section} onChange={e=>setProfileData(p=>({...p, section: e.target.value}))} placeholder="e.g. A" required />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Semester</label>
              <input className="input" type="text" value={profileData.semester} onChange={e=>setProfileData(p=>({...p, semester: e.target.value}))} placeholder="e.g. 4" required />
            </div>
          </div>
          <div style={{ display:'flex',gap:12 }}>
            <div style={{ flex:2 }}>
              <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Subject Name</label>
              <input className="input" type="text" value={profileData.subjectName} onChange={e=>setProfileData(p=>({...p, subjectName: e.target.value}))} placeholder="e.g. Mathematics" required />
            </div>
            <div style={{ flex:1 }}>
              <label style={{ fontSize:'10px',color:'var(--ct3)',fontWeight:700,textTransform:'uppercase',display:'block',marginBottom:4 }}>Subject Code</label>
              <input className="input" type="text" value={profileData.subjectCode} onChange={e=>setProfileData(p=>({...p, subjectCode: e.target.value}))} placeholder="e.g. 23IST420" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ marginTop:8,borderRadius:10,height:38,fontWeight:700 }}>
            {profileLoading ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>

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

        <h2 style={{ fontSize:'14px',fontWeight:800,color:'var(--rose)',marginBottom:16,marginTop:32 }}>Danger Zone</h2>
        <div style={{ display:'flex',flexDirection:'column',gap:12,padding:'16px',border:'1px solid var(--rose-b)',borderRadius:12,background:'var(--rose-l)' }}>
          <p style={{ fontSize:'12px',color:'var(--rose)',fontWeight:600,display:'flex',gap:8,alignItems:'flex-start' }}>
            <AlertTriangle size={16} style={{ flexShrink:0 }}/>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {deleteMsg.text && (
            <div style={{ padding:'10px 14px',borderRadius:10,fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:8,
              background:'var(--rose-l)', color:'var(--rose)', border:'1px solid var(--rose-b)'
            }}>
              <XCircle size={14}/>
              {deleteMsg.text}
            </div>
          )}
          <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ 
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',borderRadius:10,height:38,fontWeight:700,
            background:'var(--rose)',color:'#fff',border:'none',cursor:deleteLoading?'not-allowed':'pointer',opacity:deleteLoading?0.7:1
          }}>
            <Trash2 size={15}/>
            {deleteLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
