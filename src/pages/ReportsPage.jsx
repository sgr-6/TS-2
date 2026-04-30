import React, { useMemo, useState } from 'react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';
import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ── Helpers ── */
function getPercentage(present, total) {
  if (!total) return 0;
  return Math.round((present / total) * 100);
}

function downloadCSV(rows, filename) {
  const header = ['Name', 'Roll No', 'Class', 'Present', 'Absent', 'Total', 'Percentage'];
  const csv = [header, ...rows.map((r) => [r.name, r.rollNo, r.class, r.present, r.absent, r.total, `${r.pct}%`])]
    .map((row) => row.join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(rows, title) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text('TS:2 — ' + title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [['Name', 'Roll No', 'Class', 'Present', 'Absent', 'Total', '%']],
    body: rows.map((r) => [r.name, r.rollNo, r.class, r.present, r.absent, r.total, `${r.pct}%`]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  doc.save(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-3 py-2 rounded-xl text-sm" style={{ color: '#e2e8f0' }}>
        <p className="font-medium mb-1 truncate max-w-40">{label}</p>
        <p style={{ color: '#a5b4fc' }}>Attendance: <strong>{payload[0]?.value}%</strong></p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { students, loading: sLoading } = useStudents();
  const { records, loading: rLoading } = useAllAttendance();
  const [filterClass, setFilterClass] = useState('all');

  const loading = sLoading || rLoading;

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.class).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [students]);

  const reportRows = useMemo(() => {
    const byId = {};
    students.forEach((s) => {
      byId[s.id] = { ...s, present: 0, absent: 0, total: 0 };
    });
    records.forEach((r) => {
      if (byId[r.studentId]) {
        byId[r.studentId].total++;
        if (r.status === 'present') byId[r.studentId].present++;
        else byId[r.studentId].absent++;
      }
    });
    return Object.values(byId)
      .map((r) => ({ ...r, pct: getPercentage(r.present, r.total) }))
      .filter((r) => filterClass === 'all' || r.class === filterClass)
      .sort((a, b) => b.pct - a.pct);
  }, [students, records, filterClass]);

  // Weekly trend data
  const weeklyData = useMemo(() => {
    const byDate = {};
    records.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { present: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === 'present') byDate[r.date].present++;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, { present, total }]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        pct: total > 0 ? Math.round((present / total) * 100) : 0,
      }));
  }, [records]);

  // Pie data: overall present vs absent
  const totalPresent = reportRows.reduce((a, r) => a + r.present, 0);
  const totalAbsent = reportRows.reduce((a, r) => a + r.absent, 0);
  const pieData = [
    { name: 'Present', value: totalPresent, color: '#10b981' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
  ];

  const filename = `attendance_${filterClass}_${new Date().toISOString().split('T')[0]}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            Attendance analytics & export
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="download-csv-btn"
            className="btn btn-secondary"
            onClick={() => downloadCSV(reportRows, `${filename}.csv`)}
            disabled={reportRows.length === 0}
          >
            <FileText size={16} /> CSV
          </button>
          <button
            id="download-pdf-btn"
            className="btn btn-primary"
            onClick={() => downloadPDF(reportRows, filterClass === 'all' ? 'All Classes' : `Class ${filterClass}`)}
            disabled={reportRows.length === 0}
          >
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Filter & Summary Cards */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          id="class-filter"
          className="input"
          style={{ maxWidth: '180px' }}
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          {classes.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Classes' : `Class ${c}`}</option>
          ))}
        </select>
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Students', val: reportRows.length, color: '#6366f1' },
            { label: 'Avg %', val: reportRows.length ? `${Math.round(reportRows.reduce((a, r) => a + r.pct, 0) / reportRows.length)}%` : '—', color: '#f59e0b' },
            { label: 'Below 75%', val: reportRows.filter((r) => r.total > 0 && r.pct < 75).length, color: '#ef4444' },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-2 flex gap-2 items-center" style={{ borderRadius: 12 }}>
              <span style={{ color: s.color, fontWeight: 700, fontSize: '1rem' }}>{s.val}</span>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
            <BarChart3 size={16} style={{ color: '#6366f1' }} /> Daily Attendance (%)
          </h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#475569' }}>Loading…</div>
          ) : weeklyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#475569' }}>No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={entry.pct >= 75 ? '#6366f1' : '#ef4444'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} /> Overall Split
          </h2>
          {totalPresent + totalAbsent === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#475569' }}>No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} sessions`, n]} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Report Table */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
            Detailed Student Report
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: '#475569' }}>Loading…</div>
        ) : reportRows.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: '#475569' }}>No data available.</div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total</th>
                  <th>%</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((r) => {
                  const barColor = r.pct >= 75 ? '#10b981' : r.pct >= 50 ? '#f59e0b' : '#ef4444';
                  return (
                    <tr key={r.id}>
                      <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{r.name}</td>
                      <td style={{ color: '#94a3b8' }}>{r.rollNo}</td>
                      <td style={{ color: '#94a3b8' }}>{r.class}</td>
                      <td style={{ color: '#34d399' }}>{r.present}</td>
                      <td style={{ color: '#f87171' }}>{r.absent}</td>
                      <td style={{ color: '#94a3b8' }}>{r.total}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${r.pct}%`, background: barColor }}
                            />
                          </div>
                          <span style={{ color: barColor, fontWeight: 600, fontSize: '0.8rem' }}>
                            {r.pct}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: r.total === 0 ? 'rgba(100,116,139,0.1)' : r.pct >= 75
                              ? 'rgba(16,185,129,0.12)'
                              : 'rgba(239,68,68,0.1)',
                            color: r.total === 0 ? '#64748b' : r.pct >= 75 ? '#34d399' : '#f87171',
                          }}
                        >
                          {r.total === 0 ? 'No Data' : r.pct >= 75 ? 'Good' : 'Low'}
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
