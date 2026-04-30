import React, { useMemo } from 'react';
import { useStudents } from '../hooks/useFirestore';
import { useAllAttendance } from '../hooks/useFirestore';
import { Users, CalendarCheck, TrendingUp, AlertCircle, Flame } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div
      className="glass-card stat-card p-5 flex gap-4 items-start"
      style={{ animationDelay: '0.05s' }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}20` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: '#64748b' }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-3 py-2 rounded-xl text-sm" style={{ color: '#e2e8f0' }}>
        <p className="font-medium mb-1">{label}</p>
        <p style={{ color: '#a5b4fc' }}>
          Attendance: <strong>{payload[0]?.value?.toFixed(1)}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { students, loading: studentsLoading } = useStudents();
  const { records, loading: recordsLoading } = useAllAttendance();

  // Compute weekly chart data (last 7 distinct dates with data)
  const chartData = useMemo(() => {
    if (!records.length || !students.length) return [];
    const byDate = {};
    records.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === 'present') byDate[r.date].present++;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, { present, total }]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        attendance: total > 0 ? (present / total) * 100 : 0,
      }));
  }, [records, students]);

  // Compute per-student stats
  const studentStats = useMemo(() => {
    const map = {};
    students.forEach((s) => { map[s.id] = { present: 0, total: 0, name: s.name, rollNo: s.rollNo, class: s.class }; });
    records.forEach((r) => {
      if (map[r.studentId]) {
        map[r.studentId].total++;
        if (r.status === 'present') map[r.studentId].present++;
      }
    });
    return Object.values(map);
  }, [students, records]);

  const avgAttendance = useMemo(() => {
    const valid = studentStats.filter((s) => s.total > 0);
    if (!valid.length) return 0;
    return valid.reduce((acc, s) => acc + (s.present / s.total) * 100, 0) / valid.length;
  }, [studentStats]);

  const lowAttendanceCount = studentStats.filter(
    (s) => s.total > 0 && (s.present / s.total) * 100 < 75
  ).length;

  const maxStreak = useMemo(() => {
    if (!records.length || !students.length) return 0;
    
    // Group records by student
    const studentRecords = {};
    records.forEach(r => {
      if (!studentRecords[r.studentId]) studentRecords[r.studentId] = [];
      studentRecords[r.studentId].push(r);
    });

    let highest = 0;
    students.forEach(s => {
      let streak = 0;
      if (studentRecords[s.id]) {
        const sorted = studentRecords[s.id].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (let r of sorted) {
          if (r.status === 'present') streak++;
          else break;
        }
      }
      if (streak > highest) highest = streak;
    });
    return highest;
  }, [records, students]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter((r) => r.date === todayStr);
  const todayPresent = todayRecords.filter((r) => r.status === 'present').length;

  const loading = studentsLoading || recordsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Students" value={loading ? '—' : students.length} sub="Registered" color="#6366f1" />
        <StatCard icon={CalendarCheck} label="Today Present" value={loading ? '—' : `${todayPresent}/${students.length}`} sub="Marked today" color="#10b981" />
        <StatCard icon={TrendingUp} label="Avg Attendance" value={loading ? '—' : `${avgAttendance.toFixed(1)}%`} sub="All-time" color="#f59e0b" />
        <StatCard icon={AlertCircle} label="Below 75%" value={loading ? '—' : lowAttendanceCount} sub="Need attention" color="#ef4444" />
        <StatCard icon={Flame} label="Top Streak" value={loading ? '—' : `${maxStreak} Days`} sub="Best punctuality" color="#f97316" />
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: '#e2e8f0' }}>
          Weekly Attendance Trend
        </h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center" style={{ color: '#475569' }}>Loading chart...</div>
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#475569' }}>
            No attendance data yet. Start marking attendance to see trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Low Attendance Alert */}
      {lowAttendanceCount > 0 && (
        <div
          className="glass-card p-4 flex items-start gap-3"
          style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}
        >
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#f87171' }}>
              {lowAttendanceCount} student{lowAttendanceCount > 1 ? 's' : ''} below 75% attendance
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              Review the Reports page for detailed percentages.
            </p>
          </div>
        </div>
      )}

      {/* Recent Students */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: '#e2e8f0' }}>Student Overview</h2>
        {loading ? (
          <div className="text-sm" style={{ color: '#475569' }}>Loading...</div>
        ) : students.length === 0 ? (
          <p className="text-sm" style={{ color: '#475569' }}>No students yet. Go to Students → Add Student.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.slice(0, 8).map((s, i) => {
                  const pct = s.total > 0 ? ((s.present / s.total) * 100).toFixed(1) : '—';
                  const color = s.total === 0 ? '#64748b' : parseFloat(pct) >= 75 ? '#34d399' : '#f87171';
                  return (
                    <tr key={i}>
                      <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: '#94a3b8' }}>{s.rollNo}</td>
                      <td style={{ color: '#94a3b8' }}>{s.class}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: `${color}20`,
                            color,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {pct}{pct !== '—' ? '%' : ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
