import React, { useMemo, useState } from 'react';
import { useAllTeachers, useAllStudents, useAdminAllAttendance } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, BookOpen, GraduationCap, BarChart3, TrendingUp,
  AlertCircle, Building2, Hash, ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <div className="card p-5 flex gap-4 items-start" style={{ animationDelay:`${delay}ms` }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background:`${color}15`, border:`1px solid ${color}28` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:'1.5rem',fontWeight:900,color:'var(--ct1)',letterSpacing:'-.03em',lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontSize:'11px',color:'var(--ct3)',marginTop:3,fontWeight:500 }}>{sub}</p>}
      </div>
    </div>
  );
}

function TeacherCard({ teacher, students, attendanceRecords }) {
  const [expanded, setExpanded] = useState(false);

  const teacherStudents = students.filter(s => s.userId === teacher.uid);
  const teacherAttendance = attendanceRecords.filter(r => r.userId === teacher.uid);
  const presentCount = teacherAttendance.filter(r => r.status === 'present').length;
  const avgPct = teacherAttendance.length > 0
    ? ((presentCount / teacherAttendance.length) * 100).toFixed(1)
    : '—';

  const pctColor = avgPct === '—' ? '#64748b' : parseFloat(avgPct) >= 75 ? '#10b981' : '#f87171';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(15,23,42,0.4)',
        border: '1px solid rgba(99,102,241,0.12)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div
        className="p-5 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
          style={{ background:'var(--sage-l)',border:'1px solid var(--sage-b)',color:'var(--sage)' }}>
          {(teacher.teacherName || teacher.email || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate" style={{ color:'var(--ct1)' }}>
            {teacher.teacherName || 'Unknown Teacher'}
          </p>
          <p className="text-xs truncate mt-0.5 flex items-center gap-1.5" style={{ color:'var(--ct3)' }}>
              <Building2 size={11} /> {teacher.department || '—'} &nbsp;·&nbsp;
              <BookOpen size={11} /> {teacher.subjectName || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p style={{ fontSize:'11px',fontWeight:600,color:'var(--ct3)' }}>Avg Attendance</p>
            <p style={{ fontSize:'1.1rem',fontWeight:900,color:pctColor }}>{avgPct}{avgPct!=='—'?'%':''}</p>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
            <span style={{ fontSize:'13px',fontWeight:800,color:'var(--sky)' }}>{teacherStudents.length}</span>
            <span style={{ fontSize:'9px',fontWeight:600,color:'var(--ct3)',textTransform:'uppercase',letterSpacing:'.06em' }}>Students</span>
          </div>
          {expanded?<ChevronUp size={15} style={{color:'var(--ct3)'}}/>:<ChevronDown size={15} style={{color:'var(--ct3)'}}/>}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--c-edge)' }}>
          {/* Subject info */}
          <div className="px-5 py-3 flex flex-wrap gap-4">
            {[
              { icon: Hash, label: 'Subject Code', val: teacher.subjectCode || '—' },
              { icon: BookOpen, label: 'Subject', val: teacher.subjectName || '—' },
              { icon: GraduationCap, label: 'Semester', val: teacher.semester || '—' },
              { icon: Building2, label: 'Department', val: teacher.department || '—' },
            ].map(({ icon: Ic, label, val }) => (
              <div key={label} style={{ display:'flex',alignItems:'center',gap:6 }}>
                <Ic size={13} style={{ color:'var(--sage)' }} />
                <span style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:600 }}>{label}:</span>
                <span style={{ fontSize:'11px',fontWeight:700,color:'var(--ct1)' }}>{val}</span>
              </div>
            ))}
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:600 }}>Email:</span>
              <span style={{ fontSize:'11px',fontWeight:700,color:'var(--sky)' }}>{teacher.email}</span>
            </div>
          </div>

          {/* Students list */}
          {teacherStudents.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--c-edge)' }}>
              <p className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--ct3)' }}>
                Students ({teacherStudents.length})
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'var(--card-bg)' }}>
                      {['Name', 'Roll No', 'Class', 'Attendance'].map(h => (
                        <th key={h} className="px-5 py-2 text-left font-semibold" style={{ color: 'var(--ct3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherStudents.map(s => {
                      const sAtt = teacherAttendance.filter(r => r.studentId === s.id);
                      const sPresent = sAtt.filter(r => r.status === 'present').length;
                      const sPct = sAtt.length > 0 ? ((sPresent / sAtt.length) * 100).toFixed(1) : null;
                      const col = !sPct ? 'var(--ct3)' : parseFloat(sPct) >= 75 ? 'var(--green)' : 'var(--red)';
                      return (
                  <tr style={{ borderTop: '1px solid var(--c-edge)' }}>
                    <td style={{ padding:'8px 16px',fontWeight:600,color:'var(--ct1)' }}>{s.name}</td>
                    <td style={{ padding:'8px 16px',color:'var(--ct3)' }}>{s.rollNo}</td>
                    <td style={{ padding:'8px 16px',color:'var(--ct3)' }}>{s.class}</td>
                      <td style={{ padding:'8px 16px' }}>
                        <span className="badge" style={{ background:`${col}15`, color:col }}>{sPct?`${sPct}%`:'No Data'}</span>
                      </td>
                    </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="px-5 py-3 text-xs" style={{ color: '#475569' }}>No students registered yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { teachers, loading: tLoading } = useAllTeachers();
  const { students, loading: sLoading } = useAllStudents();
  const { records, loading: rLoading } = useAdminAllAttendance();
  const [search, setSearch] = useState('');

  const loading = tLoading || sLoading || rLoading;

  const totalPresent = records.filter(r => r.status === 'present').length;
  const overallPct = records.length > 0 ? ((totalPresent / records.length) * 100).toFixed(1) : 0;
  const lowTeachers = teachers.filter(t => {
    const tAtt = records.filter(r => r.userId === t.uid);
    if (!tAtt.length) return false;
    const pres = tAtt.filter(r => r.status === 'present').length;
    return (pres / tAtt.length) * 100 < 75;
  });

  const filteredTeachers = teachers.filter(t =>
    !search ||
    (t.teacherName || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.subjectName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background:'var(--bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.25)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <ShieldCheck size={22} style={{ color: '#818cf8' }} />
          </div>
          <div>
          <h1 style={{ fontSize:'1.25rem',fontWeight:900,color:'var(--ct1)',marginBottom:2 }}>Admin Dashboard</h1>
          <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-secondary text-xs"
          style={{ borderRadius: '12px' }}
        >
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={GraduationCap} label="Teachers" value={loading ? '—' : teachers.length} sub="Registered" color="#6366f1" />
        <StatCard icon={Users} label="Total Students" value={loading ? '—' : students.length} sub="Across all classes" color="#10b981" delay={50} />
        <StatCard icon={TrendingUp} label="Overall Attendance" value={loading ? '—' : `${overallPct}%`} sub="All subjects" color="#f59e0b" delay={100} />
        <StatCard icon={AlertCircle} label="Below 75%" value={loading ? '—' : lowTeachers.length} sub="Need attention" color="#ef4444" delay={150} />
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by teacher, department or subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input flex-1"
          style={{ background: 'rgba(15,23,42,0.5)', borderColor: 'rgba(99,102,241,0.15)', borderRadius: '14px' }}
        />
        <span style={{ fontSize:'12px',fontWeight:700,padding:'6px 14px',borderRadius:10,background:'var(--sage-l)',color:'var(--sage)',border:'1px solid var(--sage-b)' }}>
          {filteredTeachers.length} Teachers
        </span>
      </div>

      {/* Teacher cards */}
      {loading ? (
        <div style={{ fontSize:'14px',textAlign:'center',padding:'4rem',color:'var(--ct3)' }}>Loading data…</div>
      ) : filteredTeachers.length === 0 ? (
        <div style={{ fontSize:'14px',textAlign:'center',padding:'4rem',color:'var(--ct3)' }}>No teachers found.</div>
      ) : (
        <div className="space-y-3">
          {filteredTeachers.map(t => (
            <TeacherCard key={t.id} teacher={t} students={students} attendanceRecords={records} />
          ))}
        </div>
      )}
    </div>
  );
}
