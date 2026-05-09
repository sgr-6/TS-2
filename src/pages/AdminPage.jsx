import React, { useState, useMemo } from 'react';
import { useAllTeachers, useAllStudents, useAdminAllAttendance } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';
import {
  Users, GraduationCap, BarChart3, TrendingUp, AlertCircle,
  Building2, BookOpen, Hash, ChevronDown, ChevronUp, Search,
  ShieldCheck, Activity, Calendar, CheckCircle, XCircle, Flame
} from 'lucide-react';

/* ── helpers ── */
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(1) : null;
const statusColor = v => !v ? '#64748b' : parseFloat(v) >= 75 ? '#10b981' : parseFloat(v) >= 50 ? '#f59e0b' : '#ef4444';

function Stat({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ padding:'18px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
      <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:`${color}15`,border:`1px solid ${color}28` }}>
        <Icon size={20} style={{ color }}/>
      </div>
      <div>
        <p style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:'1.5rem',fontWeight:900,color:'var(--ct1)',letterSpacing:'-.03em',lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:'11px',color:'var(--ct3)',marginTop:3,fontWeight:500 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ═══ OVERVIEW ═══ */
function Overview({ teachers, students, records, loading }) {
  const totalPresent = records.filter(r => r.status === 'present').length;
  const overallPct = pct(totalPresent, records.length);
  const lowAttTeachers = teachers.filter(t => {
    const tr = records.filter(r => r.userId === t.uid);
    if (!tr.length) return false;
    return (tr.filter(r=>r.status==='present').length / tr.length) * 100 < 75;
  });
  const activeDates = [...new Set(records.map(r=>r.date))].length;

  // Days active per teacher (class frequency)
  const teacherActivity = teachers.map(t => {
    const tr = records.filter(r => r.userId === t.uid);
    const dates = [...new Set(tr.map(r=>r.date))].length;
    const p = pct(tr.filter(r=>r.status==='present').length, tr.length);
    return { ...t, classDays: dates, avgPct: p };
  }).sort((a,b) => b.classDays - a.classDays);

  // At-risk students (< 75% across all classes)
  const studentPcts = students.map(s => {
    const sr = records.filter(r => r.studentId === s.id);
    const p = pct(sr.filter(r=>r.status==='present').length, sr.length);
    return { ...s, pct: p };
  }).filter(s => s.pct !== null && parseFloat(s.pct) < 75)
    .sort((a,b) => parseFloat(a.pct) - parseFloat(b.pct));

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <div>
        <h1 className="page-title">Admin Overview</h1>
        <p className="page-sub">Monitoring all teachers and students across TS:2</p>
      </div>

      {/* Stats grid */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12 }}>
        <Stat icon={GraduationCap} label="Teachers" value={loading?'—':teachers.length} sub="Registered" color="#6366f1"/>
        <Stat icon={Users} label="Students" value={loading?'—':students.length} sub="Across all classes" color="#10b981"/>
        <Stat icon={TrendingUp} label="Overall Attendance" value={loading?'—':`${overallPct||0}%`} sub="All subjects combined" color="#f59e0b"/>
        <Stat icon={Calendar} label="Class Days" value={loading?'—':activeDates} sub="Total sessions recorded" color="#7BB5E8"/>
        <Stat icon={AlertCircle} label="Below 75%" value={loading?'—':lowAttTeachers.length} sub="Teachers need attention" color="#ef4444"/>
        <Stat icon={AlertCircle} label="At-Risk Students" value={loading?'—':studentPcts.length} sub="Attendance below 75%" color="#f97316"/>
      </div>

      {/* Teacher activity — do teachers take class regularly? */}
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <div style={{ padding:'14px 18px',borderBottom:'1px solid var(--c-edge)',display:'flex',alignItems:'center',gap:8 }}>
          <Activity size={15} style={{ color:'#6366f1' }}/>
          <p style={{ fontWeight:800,fontSize:'13px',color:'var(--ct1)' }}>Teacher Class Frequency</p>
          <span style={{ marginLeft:'auto',fontSize:'10px',color:'var(--ct3)',fontWeight:600 }}>Do teachers take class regularly?</span>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 80px 90px 90px',padding:'8px 18px',background:'var(--card2)',borderBottom:'1px solid var(--c-edge)' }}>
          {['TEACHER','DAYS ACTIVE','AVG ATTENDANCE','STATUS'].map(h=>(
            <p key={h} style={{ fontSize:'10px',fontWeight:800,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)' }}>{h}</p>
          ))}
        </div>
        {loading ? <p style={{ padding:'2rem',textAlign:'center',color:'var(--ct3)',fontSize:'13px' }}>Loading…</p>
        : teacherActivity.length === 0 ? <p style={{ padding:'2rem',textAlign:'center',color:'var(--ct3)',fontSize:'13px' }}>No data yet.</p>
        : teacherActivity.map((t,i) => {
          const col = statusColor(t.avgPct);
          return (
            <div key={t.id} style={{ display:'grid',gridTemplateColumns:'1fr 80px 90px 90px',alignItems:'center',padding:'11px 18px',borderBottom:i<teacherActivity.length-1?'1px solid var(--c-edge)':'none' }}>
              <div>
                <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct1)' }}>{t.teacherName||'—'}</p>
                <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>{t.department} · {t.subjectName}</p>
              </div>
              <p style={{ fontWeight:800,fontSize:'14px',color:'var(--sky)' }}>{t.classDays} days</p>
              <p style={{ fontWeight:800,fontSize:'14px',color:col }}>{t.avgPct?`${t.avgPct}%`:'No data'}</p>
              <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:99,fontSize:'11px',fontWeight:700,background:`${col}15`,color:col,border:`1px solid ${col}28` }}>
                {t.avgPct ? (parseFloat(t.avgPct)>=75?<><CheckCircle size={10}/>Good</>:<><XCircle size={10}/>Low</>) : '—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* At-risk students */}
      {studentPcts.length > 0 && (
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ padding:'14px 18px',borderBottom:'1px solid var(--c-edge)',display:'flex',alignItems:'center',gap:8 }}>
            <AlertCircle size={15} style={{ color:'#ef4444' }}/>
            <p style={{ fontWeight:800,fontSize:'13px',color:'var(--ct1)' }}>At-Risk Students</p>
            <span style={{ marginLeft:'auto',fontSize:'10px',color:'var(--ct3)',fontWeight:600 }}>Attendance below 75%</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column' }}>
            {studentPcts.slice(0,10).map((s,i)=>{
              const col = statusColor(s.pct);
              return (
                <div key={s.id} style={{ display:'grid',gridTemplateColumns:'1fr 90px 90px',alignItems:'center',padding:'10px 18px',borderBottom:i<Math.min(studentPcts.length,10)-1?'1px solid var(--c-edge)':'none' }}>
                  <div>
                    <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct1)' }}>{s.name}</p>
                    <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>{s.rollNo} · {s.class}</p>
                  </div>
                  <span style={{ fontWeight:800,fontSize:'14px',color:col }}>{s.pct}%</span>
                  <span style={{ display:'inline-flex',padding:'3px 9px',borderRadius:99,fontSize:'11px',fontWeight:700,background:`${col}15`,color:col,border:`1px solid ${col}28`,width:'fit-content' }}>
                    <XCircle size={10} style={{ marginRight:4 }}/> At Risk
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ ALL TEACHERS ═══ */
function AllTeachers({ teachers, students, records, loading }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const filtered = teachers.filter(t =>
    !search || (t.teacherName||'').toLowerCase().includes(search.toLowerCase()) ||
    (t.department||'').toLowerCase().includes(search.toLowerCase()) ||
    (t.subjectName||'').toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
        <div><h1 className="page-title">All Teachers</h1><p className="page-sub">{teachers.length} registered teachers</p></div>
      </div>
      <div style={{ position:'relative' }}>
        <Search size={14} style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'var(--ct3)',pointerEvents:'none' }}/>
        <input className="input" placeholder="Search teacher, dept or subject…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.2rem' }}/>
      </div>
      {loading ? <p style={{ textAlign:'center',padding:'3rem',color:'var(--ct3)' }}>Loading…</p>
      : filtered.map(t => {
        const tr = records.filter(r=>r.userId===t.uid);
        const p = pct(tr.filter(r=>r.status==='present').length, tr.length);
        const col = statusColor(p);
        const dates = [...new Set(tr.map(r=>r.date))].length;
        const ts = students.filter(s=>s.userId===t.uid);
        const isOpen = expanded===t.id;
        return (
          <div key={t.id} className="card" style={{ padding:0,overflow:'hidden' }}>
            <div onClick={()=>setExpanded(isOpen?null:t.id)} style={{ padding:'14px 18px',display:'flex',alignItems:'center',gap:14,cursor:'pointer' }}>
              <div style={{ width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'16px',flexShrink:0,background:'var(--sage-l)',border:'1px solid var(--sage-b)',color:'var(--sage)' }}>
                {(t.teacherName||t.email||'?')[0].toUpperCase()}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontWeight:800,fontSize:'14px',color:'var(--ct1)' }}>{t.teacherName||'—'}</p>
                <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>{t.department} · {t.subjectName} · {t.semester}</p>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:14,flexShrink:0 }}>
                <div style={{ textAlign:'center' }}><p style={{ fontSize:'18px',fontWeight:900,color:'var(--sky)' }}>{ts.length}</p><p style={{ fontSize:'9px',color:'var(--ct4)',fontWeight:600,textTransform:'uppercase' }}>Students</p></div>
                <div style={{ textAlign:'center' }}><p style={{ fontSize:'18px',fontWeight:900,color:'#f59e0b' }}>{dates}</p><p style={{ fontSize:'9px',color:'var(--ct4)',fontWeight:600,textTransform:'uppercase' }}>Class Days</p></div>
                <div style={{ textAlign:'center' }}><p style={{ fontSize:'18px',fontWeight:900,color:col }}>{p?`${p}%`:'—'}</p><p style={{ fontSize:'9px',color:'var(--ct4)',fontWeight:600,textTransform:'uppercase' }}>Avg Att.</p></div>
                {isOpen?<ChevronUp size={14} style={{color:'var(--ct3)'}}/>:<ChevronDown size={14} style={{color:'var(--ct3)'}}/>}
              </div>
            </div>
            {isOpen && (
              <div style={{ borderTop:'1px solid var(--c-edge)',padding:'12px 18px',display:'flex',flexDirection:'column',gap:10 }}>
                <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                  {[['Email',t.email,'var(--sky)'],['Dept',t.department,'var(--ct1)'],['Subject Code',t.subjectCode,'var(--ct1)'],['Semester',t.semester,'var(--ct1)']].map(([l,v,c])=>(
                    <div key={l} style={{ padding:'6px 12px',borderRadius:10,background:'var(--card2)',border:'1px solid var(--c-edge)' }}>
                      <p style={{ fontSize:'9px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)' }}>{l}</p>
                      <p style={{ fontSize:'12px',fontWeight:700,color:c }}>{v||'—'}</p>
                    </div>
                  ))}
                </div>
                {ts.length > 0 && (
                  <div style={{ borderRadius:12,overflow:'hidden',border:'1px solid var(--c-edge)' }}>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 100px 60px 90px',padding:'8px 14px',background:'var(--card2)',borderBottom:'1px solid var(--c-edge)' }}>
                      {['Student','Roll No','Class','Attendance'].map(h=><p key={h} style={{ fontSize:'9px',fontWeight:800,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)' }}>{h}</p>)}
                    </div>
                    {ts.map((s,i)=>{
                      const sr = tr.filter(r=>r.studentId===s.id);
                      const sp = pct(sr.filter(r=>r.status==='present').length, sr.length);
                      const sc = statusColor(sp);
                      return (
                        <div key={s.id} style={{ display:'grid',gridTemplateColumns:'1fr 100px 60px 90px',alignItems:'center',padding:'9px 14px',borderBottom:i<ts.length-1?'1px solid var(--c-edge)':'none' }}>
                          <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct1)' }}>{s.name}</p>
                          <p style={{ fontSize:'12px',color:'var(--ct2)' }}>{s.rollNo}</p>
                          <p style={{ fontSize:'12px',color:'var(--ct2)' }}>{s.class}</p>
                          <span style={{ display:'inline-flex',padding:'3px 10px',borderRadius:99,fontSize:'11px',fontWeight:700,background:`${sc}15`,color:sc,border:`1px solid ${sc}28` }}>{sp?`${sp}%`:'No data'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ ALL STUDENTS ═══ */
function AllStudents({ students, records, teachers, loading }) {
  const [search, setSearch] = useState('');
  const teacherMap = Object.fromEntries(teachers.map(t=>[t.uid, t.teacherName||t.email]));
  const filtered = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  ).map(s => {
    const sr = records.filter(r=>r.studentId===s.id);
    const p = pct(sr.filter(r=>r.status==='present').length, sr.length);
    return { ...s, pct:p, totalDays:sr.length };
  }).sort((a,b)=>(a.pct&&b.pct)?parseFloat(a.pct)-parseFloat(b.pct):0);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
      <div><h1 className="page-title">All Students</h1><p className="page-sub">{students.length} students across all classes</p></div>
      <div style={{ position:'relative' }}>
        <Search size={14} style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'var(--ct3)',pointerEvents:'none' }}/>
        <input className="input" placeholder="Search by name or roll number…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.2rem' }}/>
      </div>
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <div style={{ display:'grid',gridTemplateColumns:'44px 1fr 120px 60px 90px 90px',padding:'10px 18px',background:'var(--card2)',borderBottom:'1px solid var(--c-edge)' }}>
          {['#','Name','Roll No','Class','Teacher','Attendance'].map(h=>(
            <p key={h} style={{ fontSize:'10px',fontWeight:800,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)' }}>{h}</p>
          ))}
        </div>
        {loading ? <p style={{ padding:'3rem',textAlign:'center',color:'var(--ct3)' }}>Loading…</p>
        : filtered.map((s,i)=>{
          const col = statusColor(s.pct);
          return (
            <div key={s.id} style={{ display:'grid',gridTemplateColumns:'44px 1fr 120px 60px 90px 90px',alignItems:'center',padding:'11px 18px',borderBottom:i<filtered.length-1?'1px solid var(--c-edge)':'none' }}>
              <span style={{ fontSize:'12px',fontWeight:600,color:'var(--ct4)' }}>{i+1}</span>
              <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct1)' }}>{s.name}</p>
              <p style={{ fontSize:'12px',color:'var(--ct2)',fontVariantNumeric:'tabular-nums' }}>{s.rollNo}</p>
              <span style={{ display:'inline-flex',padding:'3px 10px',borderRadius:99,fontSize:'11px',fontWeight:700,background:'rgba(6,182,212,.12)',color:'#06B6D4',border:'1px solid rgba(6,182,212,.25)' }}>{s.class}</span>
              <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>{teacherMap[s.userId]||'—'}</p>
              <span style={{ display:'inline-flex',padding:'3px 10px',borderRadius:99,fontSize:'11px',fontWeight:700,background:`${col}15`,color:col,border:`1px solid ${col}28` }}>{s.pct?`${s.pct}%`:'No data'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ SYSTEM REPORTS ═══ */
function SystemReports({ teachers, students, records, loading }) {
  const totalPresent = records.filter(r=>r.status==='present').length;
  const totalAbsent = records.filter(r=>r.status==='absent').length;
  const depts = [...new Set(teachers.map(t=>t.department).filter(Boolean))];
  const deptStats = depts.map(d=>{
    const dt = teachers.filter(t=>t.department===d);
    const dr = records.filter(r=>dt.some(t=>t.uid===r.userId));
    const p = pct(dr.filter(r=>r.status==='present').length, dr.length);
    return { dept:d, teachers:dt.length, students:students.filter(s=>dt.some(t=>t.uid===s.userId)).length, pct:p };
  });

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
      <div><h1 className="page-title">System Reports</h1><p className="page-sub">Institution-wide analytics</p></div>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12 }}>
        <Stat icon={CheckCircle} label="Total Present" value={loading?'—':totalPresent} sub="Records" color="#10b981"/>
        <Stat icon={XCircle} label="Total Absent" value={loading?'—':totalAbsent} sub="Records" color="#ef4444"/>
        <Stat icon={Calendar} label="Unique Class Days" value={loading?'—':[...new Set(records.map(r=>r.date))].length} sub="Across all subjects" color="#7BB5E8"/>
        <Stat icon={Activity} label="Total Records" value={loading?'—':records.length} sub="Attendance entries" color="#f59e0b"/>
      </div>

      {/* Department-wise breakdown */}
      <div className="card" style={{ padding:0,overflow:'hidden' }}>
        <div style={{ padding:'14px 18px',borderBottom:'1px solid var(--c-edge)',display:'flex',alignItems:'center',gap:8 }}>
          <Building2 size={15} style={{ color:'#f59e0b' }}/>
          <p style={{ fontWeight:800,fontSize:'13px',color:'var(--ct1)' }}>Department-wise Attendance</p>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 70px 80px 110px',padding:'8px 18px',background:'var(--card2)',borderBottom:'1px solid var(--c-edge)' }}>
          {['Department','Teachers','Students','Avg Attendance'].map(h=>(
            <p key={h} style={{ fontSize:'10px',fontWeight:800,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)' }}>{h}</p>
          ))}
        </div>
        {deptStats.length===0 ? <p style={{ padding:'2rem',textAlign:'center',color:'var(--ct3)',fontSize:'13px' }}>No department data yet.</p>
        : deptStats.map((d,i)=>{
          const col = statusColor(d.pct);
          return (
            <div key={d.dept} style={{ display:'grid',gridTemplateColumns:'1fr 70px 80px 110px',alignItems:'center',padding:'12px 18px',borderBottom:i<deptStats.length-1?'1px solid var(--c-edge)':'none' }}>
              <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct1)' }}>{d.dept}</p>
              <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct2)' }}>{d.teachers}</p>
              <p style={{ fontWeight:700,fontSize:'13px',color:'var(--ct2)' }}>{d.students}</p>
              <span style={{ display:'inline-flex',padding:'4px 12px',borderRadius:99,fontSize:'12px',fontWeight:700,background:`${col}15`,color:col,border:`1px solid ${col}28`,width:'fit-content' }}>{d.pct?`${d.pct}%`:'No data'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function AdminPage() {
  const [active, setActive] = useState('overview');
  const { teachers, loading: tL } = useAllTeachers();
  const { students, loading: sL } = useAllStudents();
  const { records, loading: rL } = useAdminAllAttendance();
  const loading = tL || sL || rL;

  const props = { teachers, students, records, loading };

  return (
    <AdminLayout active={active} onNav={setActive}>
      {active==='overview' && <Overview {...props}/>}
      {active==='teachers' && <AllTeachers {...props}/>}
      {active==='students' && <AllStudents {...props}/>}
      {active==='reports'  && <SystemReports {...props}/>}
    </AdminLayout>
  );
}
