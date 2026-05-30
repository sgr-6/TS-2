import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useStudents, useAllAttendance, useAttendanceForDate, useStudentDetailedAttendance } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Pencil, Trash2, X, Check, Search, Users, Flame, Sparkles, Activity, Calendar, ChevronRight } from 'lucide-react';

/* ════════════════════════════════════
   DYNAMIC GREETING
════════════════════════════════════ */
function getGreeting(name) {
  const h = new Date().getHours();
  if (h < 12) return { text:`Good Morning, ${name}! ☀️`, color:'#F59E0B' };
  if (h < 17) return { text:`Good Afternoon, ${name}! 🌤️`, color:'#06B6D4' };
  return { text:`Good Evening, ${name}! 🌆`, color:'#F97316' };
}

/* ════════════════════════════════════
   MODAL
════════════════════════════════════ */
function StudentModal({ student, onClose, onSave }) {
  const [name, setName] = useState(student?.name||'');
  const [rollNo, setRollNo] = useState(student?.rollNo||'');
  const [cls, setCls] = useState(student?.class||'');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()||!rollNo.trim()) { setError('All fields are required.'); return; }
    setSaving(true);
    try { await onSave({name:name.trim(),rollNo:rollNo.trim()}); onClose(); }
    catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-content anim-scale">
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <h2 style={{ fontSize:'1.1rem',fontWeight:800,color:'var(--ct1)' }}>
            {student?'Edit Student':'Add New Student'}
          </h2>
          <button onClick={onClose} style={{ width:36,height:36,borderRadius:10,border:'1px solid var(--c-edge)',background:'var(--card2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ct3)' }}>
            <X size={16}/>
          </button>
        </div>
        {error && <div style={{ padding:'9px 13px',borderRadius:10,marginBottom:12,background:'var(--rose-l)',color:'var(--rose)',border:'1px solid var(--rose-b)',fontSize:'13px',fontWeight:600 }}>⚠ {error}</div>}
        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {[['Full Name','student-name-input','text','e.g. Arjun Sharma',name,setName],
            ['Roll Number','student-rollno-input','text','e.g. 1JB24IS131',rollNo,setRollNo],
          ].map(([lbl,id,type,ph,val,setter])=>(
            <div key={id}>
              <label style={{ display:'block',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:6 }}>{lbl}</label>
              <input id={id} className="input" type={type} placeholder={ph} value={val} onChange={e=>setter(e.target.value)} required/>
            </div>
          ))}
          <div style={{ display:'flex',gap:10,marginTop:4 }}>
            <button id="save-student-btn" type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1,minHeight:42,borderRadius:12 }}>
              {saving?'Saving…':<><Check size={15}/> {student?'Save Changes':'Add Student'}</>}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ borderRadius:12 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentProfileModal({ student, onClose }) {
  const { records, loading } = useStudentDetailedAttendance(student.id);

  const subjectStats = useMemo(() => {
    if (!records) return [];
    const grouped = {};
    records.forEach(r => {
      const code = r.subjectCode || r.subject || 'Unknown';
      if (!grouped[code]) grouped[code] = { present: 0, total: 0, name: r.subject || 'Unknown' };
      grouped[code].total++;
      if (r.status === 'present') grouped[code].present++;
    });
    return Object.entries(grouped).map(([code, stats]) => ({
      code,
      name: stats.name,
      present: stats.present,
      total: stats.total,
      pct: Math.round((stats.present / stats.total) * 100)
    }));
  }, [records]);

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-content anim-scale" style={{ maxWidth: 500 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <h2 style={{ fontSize:'1.2rem',fontWeight:800,color:'var(--ct1)' }}>
            Student Profile
          </h2>
          <button onClick={onClose} style={{ width:36,height:36,borderRadius:10,border:'1px solid var(--c-edge)',background:'var(--card2)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ct3)' }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding:'16px', background:'var(--card2)', borderRadius:12, marginBottom:16, border:'1px solid var(--c-edge)' }}>
          <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--ct1)' }}>{student.name}</h3>
          <p style={{ fontSize:'13px', color:'var(--ct2)', fontWeight:600, marginTop:4 }}>{student.rollNo} • {student.department} • {student.semester} • Section {student.section}</p>
        </div>

        <h4 style={{ fontSize:'12px', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ct3)', marginBottom:12 }}>
          Subject-wise Attendance Breakdown
        </h4>

        {loading ? (
          <p style={{ fontSize:'13px', color:'var(--ct4)', textAlign:'center', padding:'2rem' }}>Loading subjects...</p>
        ) : subjectStats.length === 0 ? (
          <p style={{ fontSize:'13px', color:'var(--ct4)', textAlign:'center', padding:'2rem' }}>No attendance records found yet.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {subjectStats.map(stat => {
              const col = stat.pct >= 75 ? 'var(--sage)' : stat.pct >= 60 ? '#f59e0b' : 'var(--rose)';
              const bg = stat.pct >= 75 ? 'var(--sage-l)' : stat.pct >= 60 ? 'rgba(245,158,11,.15)' : 'var(--rose-l)';
              return (
                <div key={stat.code} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--card3)', borderRadius:10, border:'1px solid var(--c-edge)' }}>
                  <div>
                    <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ct1)' }}>{stat.code}</p>
                    <p style={{ fontSize:'11px', fontWeight:500, color:'var(--ct3)', marginTop:2 }}>{stat.present} / {stat.total} classes attended</p>
                  </div>
                  <div style={{ padding:'4px 12px', borderRadius:99, background:bg, color:col, border:`1px solid ${col}40`, fontSize:'13px', fontWeight:800 }}>
                    {stat.pct}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


/* ════════════════════════════════════
   MAIN PAGE
════════════════════════════════════ */
export default function StudentsPage() {
  const { user, userProfile } = useAuth();
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { records } = useAllAttendance();
  const today = new Date().toISOString().split('T')[0];
  const { records: todayRecs } = useAttendanceForDate(today);

  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const greeting = getGreeting(userProfile?.teacherName?.split(' ')[0] || 'Teacher');

  /* ── Streaks ── */
  const streaks = useMemo(()=>{
    const sr={};
    records.forEach(r=>{ if(!sr[r.studentId])sr[r.studentId]=[]; sr[r.studentId].push(r); });
    const result={};
    students.forEach(s=>{
      let k=0;
      if(sr[s.id]){ const sorted=sr[s.id].sort((a,b)=>new Date(b.date)-new Date(a.date)); for(const r of sorted){if(r.status==='present')k++;else break;} }
      result[s.id]=k;
    });
    return result;
  },[records,students]);

  /* ── Detect full class present ── */
  const allPresentToday = useMemo(()=>{
    if(!students.length||!todayRecs.length) return false;
    return students.every(s=>todayRecs.some(r=>r.studentId===s.id&&r.status==='present'));
  },[students,todayRecs]);

  const filtered = students.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase())||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd(){ setEditTarget(null); setShowModal(true); }
  function openEdit(s){ setEditTarget(s); setShowModal(true); }
  function openProfile(s){ setProfileTarget(s); setShowProfile(true); }
  async function handleDelete(id){
    if(!window.confirm('Delete this student? Their attendance records will remain.')) return;
    setDeletingId(id);
    try{ await deleteStudent(id); }finally{ setDeletingId(null); }
  }
  async function handleSave(data){ 
    const fullData = {
      ...data,
      department: userProfile.department,
      semester: userProfile.semester,
      section: userProfile.section
    };
    return editTarget ? updateStudent(editTarget.id, fullData) : addStudent(fullData); 
  }

  /* ── Recent activity list ── */
  const recentActivity = useMemo(()=>{
    const m={};
    students.forEach(s=>{m[s.id]=s.name;});
    return todayRecs.slice(0,3).map(r=>({
      name:m[r.studentId]||'Unknown',
      status:r.status,
    }));
  },[todayRecs,students]);

  return (
    <div style={{ display:'flex', gap:16, minHeight:'calc(100vh - 80px)' }}>

      {/* ── LEFT: main student panel ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>

        {/* Greeting */}
        <div className="card anim-up" style={{ padding:'14px 20px', background:`${greeting.color}10`, borderColor:`${greeting.color}25`, display:'flex', alignItems:'center', gap:12 }}>
          <Sparkles size={18} style={{ color:greeting.color, flexShrink:0 }}/>
          <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ct1)' }}>{greeting.text}</p>
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <div>
            <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
              Students
              <span style={{ fontSize:'13px', fontWeight:600, padding:'3px 10px', borderRadius:99, background:'var(--sky-l)', color:'var(--sky)', border:'1px solid var(--sky-b)' }}>
                {students.length} registered
              </span>
            </h1>
          </div>
          <button id="add-student-btn" onClick={openAdd}
            style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 18px',
            background:'var(--add-btn-bg)', color:'var(--add-btn-color)',
            border:'1px solid var(--add-btn-border)', borderRadius:12, fontWeight:800, fontSize:'13px',
            cursor:'pointer', boxShadow:'var(--add-btn-shadow)', fontFamily:'Plus Jakarta Sans,sans-serif',
            transition:'all .18s ease', minHeight:42,
          }}
          onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.filter='brightness(1.1)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.filter=''; }}
          >
            <UserPlus size={16}/> Add Student
          </button>
        </div>

        {/* Search */}
        <div style={{ position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--ct3)', pointerEvents:'none' }}/>
          <input id="student-search" className="input" placeholder="Search by name, roll number, or class…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{ paddingLeft:'2.3rem', paddingRight:'8rem' }}/>
          <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:'10px', fontWeight:700, color:'var(--ct4)', letterSpacing:'.05em', background:'var(--card2)', padding:'3px 8px', borderRadius:6, border:'1px solid var(--c-edge)' }}>
            ⌘ K
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center', fontSize:'14px', color:'var(--ct3)' }}>Loading students…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <Users size={36} style={{ color:'var(--ct4)', margin:'0 auto 12px' }}/>
            <p style={{ fontSize:'13px', color:'var(--ct3)', fontWeight:500 }}>
              {search?'No students match your search.':'No students yet. Add your first student!'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ overflow:'hidden', padding:0 }}>
            {/* Header row */}
            <div style={{ display:'grid', gridTemplateColumns:'44px 1fr 130px 80px 110px 90px', gap:0, padding:'10px 18px', borderBottom:'1px solid var(--c-edge)', background:'var(--card2)' }}>
              {['#','NAME','ROLL NO','CLASS','STREAK','ACTIONS'].map(h=>(
                <p key={h} style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ct3)' }}>{h}</p>
              ))}
            </div>

            {/* Student rows */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              {filtered.map((s,i)=>{
                const streak = streaks[s.id]||0;
                return (
                  <div key={s.id}
                    className={`stu-row${streak>10?' stu-row-elite':''}`}
                    style={{
                      display:'grid', gridTemplateColumns:'44px 1fr 130px 80px 110px 90px',
                      alignItems:'center', padding:'12px 18px',
                      borderBottom:i<filtered.length-1?'1px solid var(--c-edge)':'none',
                      cursor:'default',
                    }}
                    onMouseEnter={e=>{
                      e.currentTarget.style.background='var(--card2)';
                      e.currentTarget.style.transform='translateY(-2px)';
                      e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.08)';
                      e.currentTarget.style.borderRadius='16px';
                      e.currentTarget.style.zIndex='2';
                      e.currentTarget.style.position='relative';
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.background='';
                      e.currentTarget.style.transform='';
                      e.currentTarget.style.boxShadow='';
                      e.currentTarget.style.borderRadius='';
                      e.currentTarget.style.zIndex='';
                    }}
                  >
                    <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ct4)' }} onClick={()=>openProfile(s)}>{i+1}</span>
                    <span style={{ fontSize:'14px', fontWeight:700, color:'var(--ct1)', cursor:'pointer' }} onClick={()=>openProfile(s)}>{s.name}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color:'var(--ct2)', fontVariantNumeric:'tabular-nums' }} onClick={()=>openProfile(s)}>{s.rollNo}</span>
                    <span onClick={()=>openProfile(s)}>
                      <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:99, background:'rgba(6,182,212,.12)', color:'#06B6D4', border:'1px solid rgba(6,182,212,.25)', fontSize:'12px', fontWeight:700 }}>
                        {s.section}
                      </span>
                    </span>
                    <span onClick={()=>openProfile(s)}>
                      {streak>0 ? (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:99,
                          background:'var(--streak-bg)', color:'var(--streak-color)',
                          border:'1px solid var(--streak-border)', fontSize:'12px', fontWeight:700,
                          filter:'var(--streak-glow)',
                        }}>
                          <Flame size={12} style={{ color:'var(--streak-color)' }}/> {streak} Days
                          {streak>10 && <span style={{ fontSize:'9px', marginLeft:2 }}>★</span>}
                        </span>
                      ) : (
                        <span style={{ fontSize:'12px', color:'var(--ct4)', fontWeight:500 }}>— Days</span>
                      )}
                    </span>
                    <span style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openEdit(s)}
                        style={{ width:32,height:32,borderRadius:9,border:'1px solid var(--c-edge)',background:'var(--card3)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ct2)',transition:'all .15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--sage)';e.currentTarget.style.color='var(--sage)';}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--c-edge)';e.currentTarget.style.color='var(--ct2)';}}>
                        <Pencil size={13}/>
                      </button>
                      <button onClick={()=>handleDelete(s.id)} disabled={deletingId===s.id}
                        style={{ width:32,height:32,borderRadius:9,border:'1px solid var(--rose-b)',background:'var(--rose-l)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--rose)',transition:'all .15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.1)';}}
                        onMouseLeave={e=>{e.currentTarget.style.filter='';}}>
                        <Trash2 size={13}/>
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Side Panel ── */}
      <div style={{ width:260, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }} id="side-panel">

        {/* Recent Activity */}
        <div className="card anim-up d3" style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <p style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ct3)', display:'flex', alignItems:'center', gap:6 }}>
              <Activity size={13} style={{ color:'var(--coral)' }}/> Recent Activity
            </p>
            <ChevronRight size={13} style={{ color:'var(--ct4)' }}/>
          </div>
          {recentActivity.length===0 ? (
            <p style={{ fontSize:'11px', color:'var(--ct4)', fontWeight:500 }}>No attendance marked today yet.</p>
          ) : recentActivity.map((a,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:a.status==='present'?'var(--sage-l)':'var(--rose-l)',border:`1px solid ${a.status==='present'?'var(--sage-b)':'var(--rose-b)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:10,fontWeight:800,color:a.status==='present'?'var(--sage)':'var(--rose)' }}>
                {a.name[0]}
              </div>
              <div>
                <p style={{ fontSize:'12px', fontWeight:700, color:'var(--ct1)' }}>{a.name}</p>
                <p style={{ fontSize:'10px', color:'var(--ct3)', fontWeight:500 }}>
                  {a.status==='present'?'✓ Present today':'✗ Absent today'}
                </p>
              </div>
            </div>
          ))}
          {allPresentToday && (
            <div style={{ padding:'8px 10px', borderRadius:10, background:'var(--sage-l)', border:'1px solid var(--sage-b)', marginTop:6 }}>
              <p style={{ fontSize:'11px', fontWeight:700, color:'var(--sage)', textAlign:'center' }}>🎊 Everyone present today!</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card anim-up d4" style={{ padding:'16px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <p style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ct3)', display:'flex', alignItems:'center', gap:6 }}>
              <Calendar size={13} style={{ color:'var(--sky)' }}/> Upcoming Events
            </p>
            <ChevronRight size={13} style={{ color:'var(--ct4)' }}/>
          </div>
          {[
            { label:'Internal Assessment', date:'Next Week', color:'var(--mauve)' },
            { label:'Model Exams', date:'In 3 Weeks', color:'var(--coral)' },
          ].map((ev,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:8,height:8,borderRadius:'50%',background:ev.color,flexShrink:0 }}/>
              <div>
                <p style={{ fontSize:'12px', fontWeight:700, color:'var(--ct1)' }}>{ev.label}</p>
                <p style={{ fontSize:'10px', color:'var(--ct3)', fontWeight:500 }}>{ev.date}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {showModal && <StudentModal student={editTarget} onClose={()=>setShowModal(false)} onSave={handleSave}/>}
      {showProfile && <StudentProfileModal student={profileTarget} onClose={()=>setShowProfile(false)} />}

      <style>{`
        @media(max-width:900px){ #side-panel{display:none!important} }
      `}</style>
    </div>
  );
}
