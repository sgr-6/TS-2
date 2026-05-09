import React, { useMemo, useState } from 'react';
import { useAllTeachers, useAllStudents, useAdminAllAttendance } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, BookOpen, GraduationCap, BarChart3, TrendingUp,
  AlertCircle, Building2, Hash, ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <div
      className="rounded-2xl p-5 flex gap-4 items-start"
      style={{
        background: 'rgba(15,23,42,0.4)',
        border: '1px solid rgba(99,102,241,0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `rgba(${color === '#6366f1' ? '99,102,241' : color === '#10b981' ? '16,185,129' : color === '#f59e0b' ? '245,158,11' : color === '#8b5cf6' ? '139,92,246' : '239,68,68'},0.15)`,
          border: `1px solid rgba(${color === '#6366f1' ? '99,102,241' : color === '#10b981' ? '16,185,129' : color === '#f59e0b' ? '245,158,11' : color === '#8b5cf6' ? '139,92,246' : '239,68,68'},0.2)`,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>{label}</p>
        <p className="text-2xl font-black" style={{ color: '#f1f5f9' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5 font-medium" style={{ color: '#475569' }}>{sub}</p>}
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
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}
          >
            {(teacher.teacherName || teacher.email || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate" style={{ color: '#e2e8f0' }}>
              {teacher.teacherName || 'Unknown Teacher'}
            </p>
            <p className="text-xs truncate mt-0.5 flex items-center gap-1.5" style={{ color: '#64748b' }}>
              <Building2 size={11} /> {teacher.department || '—'} &nbsp;·&nbsp;
              <BookOpen size={11} /> {teacher.subjectName || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium" style={{ color: '#475569' }}>Avg Attendance</p>
            <p className="text-lg font-black" style={{ color: pctColor }}>
              {avgPct}{avgPct !== '—' ? '%' : ''}
            </p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-bold" style={{ color: '#6366f1' }}>{teacherStudents.length}</span>
            <span className="text-[10px]" style={{ color: '#475569' }}>Students</span>
          </div>
          {expanded ? <ChevronUp size={16} style={{ color: '#475569' }} /> : <ChevronDown size={16} style={{ color: '#475569' }} />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
          {/* Subject info */}
          <div className="px-5 py-3 flex flex-wrap gap-4">
            {[
              { icon: Hash, label: 'Subject Code', val: teacher.subjectCode || '—' },
              { icon: BookOpen, label: 'Subject', val: teacher.subjectName || '—' },
              { icon: GraduationCap, label: 'Semester', val: teacher.semester || '—' },
              { icon: Building2, label: 'Department', val: teacher.department || '—' },
            ].map(({ icon: Ic, label, val }) => (
              <div key={label} className="flex items-center gap-2">
                <Ic size={13} style={{ color: '#6366f1' }} />
                <span className="text-xs" style={{ color: '#475569' }}>{label}:</span>
                <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{val}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: '#475569' }}>Email:</span>
              <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>{teacher.email}</span>
            </div>
          </div>

          {/* Students list */}
          {teacherStudents.length > 0 ? (
            <div style={{ borderTop: '1px solid rgba(99,102,241,0.06)' }}>
              <p className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold" style={{ color: '#475569' }}>
                Students ({teacherStudents.length})
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(15,23,42,0.5)' }}>
                      {['Name', 'Roll No', 'Class', 'Attendance'].map(h => (
                        <th key={h} className="px-5 py-2 text-left font-semibold" style={{ color: '#475569' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherStudents.map(s => {
                      const sAtt = teacherAttendance.filter(r => r.studentId === s.id);
                      const sPresent = sAtt.filter(r => r.status === 'present').length;
                      const sPct = sAtt.length > 0 ? ((sPresent / sAtt.length) * 100).toFixed(1) : null;
                      const col = !sPct ? '#64748b' : parseFloat(sPct) >= 75 ? '#10b981' : '#f87171';
                      return (
                        <tr key={s.id} style={{ borderTop: '1px solid rgba(99,102,241,0.04)' }}>
                          <td className="px-5 py-2.5 font-medium" style={{ color: '#e2e8f0' }}>{s.name}</td>
                          <td className="px-5 py-2.5" style={{ color: '#64748b' }}>{s.rollNo}</td>
                          <td className="px-5 py-2.5" style={{ color: '#64748b' }}>{s.class}</td>
                          <td className="px-5 py-2.5">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: `${col}20`, color: col }}
                            >
                              {sPct ? `${sPct}%` : 'No Data'}
                            </span>
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
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'radial-gradient(ellipse at 70% 0%, rgba(99,102,241,0.1) 0%, transparent 50%), #020617' }}>
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
            <h1 className="text-xl font-black" style={{ color: '#f1f5f9' }}>Admin Dashboard</h1>
            <p className="text-xs" style={{ color: '#475569' }}>{user?.email}</p>
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
        <span className="text-xs font-semibold px-3 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}>
          {filteredTeachers.length} Teachers
        </span>
      </div>

      {/* Teacher cards */}
      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: '#475569' }}>Loading data…</div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: '#475569' }}>No teachers found.</div>
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
