import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useStudents, useAllAttendance, useAttendanceForDate } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Pencil, Trash2, X, Check, Search, Users, Flame, Sparkles, Activity, Calendar, ChevronRight } from 'lucide-react';

/* ════════════════════════════════════
   CONFETTI
════════════════════════════════════ */
function launchConfetti() {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:9999,pointerEvents:'none' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const COLORS = ['#7EAD7C','#06B6D4','#F59E0B','#EC4899','#8B5CF6','#E88090','#FFD700','#00FFD1'];
  const particles = Array.from({length:200},()=>({
    x:Math.random()*canvas.width, y:Math.random()*-canvas.height,
    w:Math.random()*14+6, h:Math.random()*7+4,
    color:COLORS[Math.floor(Math.random()*COLORS.length)],
    speed:Math.random()*4+2, angle:0, spin:(Math.random()-.5)*.18,
    drift:(Math.random()-.5)*2,
  }));
  let frame=0, maxF=320;
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.y+=p.speed; p.angle+=p.spin; p.x+=p.drift;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle);
      ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,1-frame/maxF);
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    });
    if(++frame<maxF) requestAnimationFrame(animate); else canvas.remove();
  }
  animate();
}

/* ════════════════════════════════════
   DYNAMIC GREETING
════════════════════════════════════ */
function getGreeting(name) {
  const h = new Date().getHours();
  if (h < 5)  return { text:`Late night dev session? Team TS:2 is active! 🌙`, color:'#8B5CF6' };
  if (h < 12) return { text:`Good Morning, ${name}! ☀️`, color:'#F59E0B' };
  if (h < 17) return { text:`Good Afternoon, ${name}! 🌤️`, color:'#06B6D4' };
  if (h < 21) return { text:`Good Evening, ${name}! 🌆`, color:'#F97316' };
  return { text:`Late night dev session? Team TS:2 is active! 🌙`, color:'#8B5CF6' };
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
    if (!name.trim()||!rollNo.trim()||!cls.trim()) { setError('All fields are required.'); return; }
    setSaving(true);
    try { await onSave({name:name.trim(),rollNo:rollNo.trim(),class:cls.trim()}); onClose(); }
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
            ['Class / Section','student-class-input','text','e.g. 4C',cls,setCls],
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

/* ════════════════════════════════════
   DESK SVG ILLUSTRATION
════════════════════════════════════ */
const DeskSVG = ({allPresent}) => (
  <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:90,height:68 }}>
    <rect x="10" y="45" width="100" height="10" rx="5" fill={allPresent?'#7EAD7C':'#C8C0B0'} opacity=".9"/>
    <rect x="20" y="55" width="8" height="28" rx="4" fill={allPresent?'#5A9E58':'#A89880'}/>
    <rect x="92" y="55" width="8" height="28" rx="4" fill={allPresent?'#5A9E58':'#A89880'}/>
    {allPresent ? (
      <>
        <circle cx="60" cy="30" r="18" fill="#D1FAE5" stroke="#7EAD7C" strokeWidth="2"/>
        <path d="M51 30l6 6 12-12" stroke="#7EAD7C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="60" y="18" textAnchor="middle" fontSize="10" fill="#F59E0B">✨</text>
      </>
    ) : (
      <>
        <rect x="35" y="20" width="50" height="28" rx="6" fill="#E8E4DC" stroke="#C8C0B0" strokeWidth="1.5"/>
        <rect x="42" y="27" width="36" height="3" rx="1.5" fill="#C8C0B0"/>
        <rect x="42" y="33" width="24" height="3" rx="1.5" fill="#C8C0B0"/>
      </>
    )}
  </svg>
);

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
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [synergyCelebrated, setSynergyCelebrated] = useState(false);
  const [synergyToast, setSynergyToast] = useState(false);

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

  /* ── Detect full class present → confetti ── */
  const allPresentToday = useMemo(()=>{
    if(!students.length||!todayRecs.length) return false;
    return students.every(s=>todayRecs.some(r=>r.studentId===s.id&&r.status==='present'));
  },[students,todayRecs]);

  useEffect(()=>{
    if(allPresentToday&&!synergyCelebrated){
      setSynergyCelebrated(true);
      setSynergyToast(true);
      launchConfetti();
      setTimeout(()=>setSynergyToast(false),5000);
    }
    if(!allPresentToday) setSynergyCelebrated(false);
  },[allPresentToday]);

  const filtered = students.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase())||
    s.rollNo.toLowerCase().includes(search.toLowerCase())||
    (s.class||'').toLowerCase().includes(search.toLowerCase())
  );

  function openAdd(){ setEditTarget(null); setShowModal(true); }
  function openEdit(s){ setEditTarget(s); setShowModal(true); }
  async function handleDelete(id){
    if(!window.confirm('Delete this student? Their attendance records will remain.')) return;
    setDeletingId(id);
    try{ await deleteStudent(id); }finally{ setDeletingId(null); }
  }
  async function handleSave(data){ return editTarget?updateStudent(editTarget.id,data):addStudent(data); }

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
              background:'linear-gradient(135deg,#D1FAE5,#A7F3D0)', color:'#065F46',
              border:'1px solid #6EE7B7', borderRadius:12, fontWeight:800, fontSize:'13px',
              cursor:'pointer', boxShadow:'0 4px 14px rgba(16,185,129,.25)', fontFamily:'Plus Jakarta Sans,sans-serif',
              transition:'all .18s ease', minHeight:42,
            }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(16,185,129,.35)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 14px rgba(16,185,129,.25)'; }}
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
                    style={{
                      display:'grid', gridTemplateColumns:'44px 1fr 130px 80px 110px 90px',
                      alignItems:'center', padding:'12px 18px',
                      borderBottom:i<filtered.length-1?'1px solid var(--c-edge)':'none',
                      transition:'all .22s cubic-bezier(.22,1,.36,1)',
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
                    <span style={{ fontSize:'13px', fontWeight:600, color:'var(--ct4)' }}>{i+1}</span>
                    <span style={{ fontSize:'14px', fontWeight:700, color:'var(--ct1)' }}>{s.name}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color:'var(--ct2)', fontVariantNumeric:'tabular-nums' }}>{s.rollNo}</span>
                    <span>
                      <span style={{ display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:99, background:'rgba(6,182,212,.12)', color:'#06B6D4', border:'1px solid rgba(6,182,212,.25)', fontSize:'12px', fontWeight:700 }}>
                        {s.class}
                      </span>
                    </span>
                    <span>
                      {streak>0 ? (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:99, background:'#FEF3C7', color:'#D97706', border:'1px solid #FDE68A', fontSize:'12px', fontWeight:700 }}>
                          <Flame size={12} style={{ color:'#F59E0B' }}/> {streak} Days
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

      {/* ── RIGHT: Easter Egg Panel ── */}
      <div style={{ width:260, flexShrink:0, display:'flex', flexDirection:'column', gap:12 }} id="easter-panel">

        <div className="card anim-up d2" style={{ padding:'16px 18px', overflow:'hidden', position:'relative' }}>
          <p style={{ fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ct3)', marginBottom:12 }}>Interaction & Easter Eggs</p>
          <p style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ct4)', marginBottom:10 }}>Actions</p>

          {/* Desk illustration */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0 8px', borderRadius:14, background:'var(--card2)', border:'1px solid var(--c-edge)', marginBottom:12 }}>
            <DeskSVG allPresent={allPresentToday}/>
            <p style={{ fontSize:'11px', fontWeight:700, color: allPresentToday?'var(--sage)':'var(--ct3)', marginTop:6 }}>
              {allPresentToday ? "Everyone's here! 🎉" : "Empty Desk"}
            </p>
          </div>

          {/* Synergy button */}
          <button
            onClick={()=>{ if(allPresentToday){launchConfetti();setSynergyToast(true);setTimeout(()=>setSynergyToast(false),4000);} }}
            style={{
              width:'100%', padding:'10px', borderRadius:12, border:'none', fontFamily:'Plus Jakarta Sans,sans-serif',
              background: allPresentToday ? 'linear-gradient(135deg,#7EAD7C,#6DBDAC)' : 'var(--card2)',
              color: allPresentToday ? '#fff' : 'var(--ct3)',
              fontWeight:700, fontSize:'12px', cursor: allPresentToday ? 'pointer':'default',
              boxShadow: allPresentToday ? '0 4px 14px rgba(126,173,124,.35)':'none',
              transition:'all .2s', marginBottom:10,
            }}>
            {allPresentToday ? '🎊 Celebrate Synergy!' : 'Awaiting Full Class…'}
          </button>

          {synergyToast && (
            <div style={{ padding:'10px 12px', borderRadius:11, background:'linear-gradient(135deg,#D1FAE5,#A7F3D0)', border:'1px solid #6EE7B7', marginBottom:10 }}>
              <p style={{ fontSize:'11px', fontWeight:800, color:'#065F46', textAlign:'center', lineHeight:1.5 }}>
                🔥 Class Synergy 100%!<br/>The TS:2 Streak is Unstoppable.
              </p>
            </div>
          )}
        </div>

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

        {/* Secret hint */}
        <div style={{ padding:'10px 14px', borderRadius:12, background:'var(--card2)', border:'1px solid var(--c-edge)', textAlign:'center' }}>
          <p style={{ fontSize:'10px', color:'var(--ct4)', fontWeight:600 }}>💡 Try triple-clicking the TS:2 logo</p>
        </div>
      </div>

      {showModal && <StudentModal student={editTarget} onClose={()=>setShowModal(false)} onSave={handleSave}/>}

      <style>{`
        @media(max-width:900px){ #easter-panel{display:none!important} }
      `}</style>
    </div>
  );
}
