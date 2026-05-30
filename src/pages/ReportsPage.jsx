import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

function downloadCSV(rows, filename, subjectColumns = []) {
  const header = ['Name', 'Roll No', 'Class', ...subjectColumns, 'Present', 'Absent', 'Total', 'Overall %'];
  const csv = [header, ...rows.map((r) => [
      r.name, r.rollNo, r.class,
      ...subjectColumns.map(sub => r.subjPcts?.[sub] !== undefined ? `${r.subjPcts[sub]}%` : '—'),
      r.present, r.absent, r.total, `${r.pct}%`
    ])]
    .map((row) => row.join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(rows, title, subjectColumns = []) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text('SJBIT — ' + title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [['Name', 'Roll No', 'Class', ...subjectColumns, 'Total', 'Overall %']],
    body: rows.map((r) => [
      r.name, r.rollNo, r.class,
      ...subjectColumns.map(sub => r.subjPcts?.[sub] !== undefined ? `${r.subjPcts[sub]}%` : '—'),
      r.total, `${r.pct}%`
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  doc.save(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'var(--card)',border:'1px solid var(--c-edge)',borderRadius:10,padding:'8px 12px',fontSize:12,color:'var(--ct1)',boxShadow:'var(--c-shad)' }}>
        <p style={{ fontWeight:700,marginBottom:3 }}>{label}</p>
        <p style={{ color:'var(--sage)',fontWeight:600 }}>Attendance: <strong>{payload[0]?.value}%</strong></p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { userProfile, activeClass } = useAuth();
  const { students, loading: sLoading } = useStudents();
  
  const classId = activeClass ? `${activeClass.semester} - Section ${activeClass.section}` : (userProfile?.className || null);
  const { records, loading: rLoading } = useAllAttendance(classId);
  const [filterClass, setFilterClass] = useState('all');

  const loading = sLoading || rLoading;

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.class).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [students]);

  const reportRows = useMemo(() => {
    const byId = {};
    students.forEach((s) => {
      byId[s.id] = { ...s, present: 0, absent: 0, total: 0, subjects: {} };
    });
    records.forEach((r) => {
      if (byId[r.studentId]) {
        const sId = r.studentId;
        const subj = r.subject || 'Unknown Subject';
        byId[sId].total++;
        if (!byId[sId].subjects[subj]) byId[sId].subjects[subj] = { present: 0, absent: 0, total: 0 };
        byId[sId].subjects[subj].total++;

        if (r.status === 'present') { byId[sId].present++; byId[sId].subjects[subj].present++; }
        else { byId[sId].absent++; byId[sId].subjects[subj].absent++; }
      }
    });

    return Object.values(byId)
      .map((r) => {
        const subjPcts = {};
        Object.entries(r.subjects).forEach(([sub, counts]) => {
          subjPcts[sub] = getPercentage(counts.present, counts.total);
        });
        return { ...r, pct: getPercentage(r.present, r.total), subjPcts };
      })
      .filter((r) => filterClass === 'all' || r.class === filterClass)
      .sort((a, b) => b.pct - a.pct);
  }, [students, records, filterClass]);

  const subjectColumns = useMemo(() => {
    if (filterClass === 'all') return [];
    const subjects = new Set();
    records.forEach(r => {
      const student = students.find(s => s.id === r.studentId);
      if (student && student.class === filterClass) subjects.add(r.subject || 'Unknown Subject');
    });
    return Array.from(subjects).sort();
  }, [records, students, filterClass]);

  // Weekly trend data
  const weeklyData = useMemo(() => {
    const byDate = {};
    records.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { presentAndExcused: 0, total: 0 };
      byDate[r.date].total++;
      if (r.status === 'present') byDate[r.date].presentAndExcused++;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, { presentAndExcused, total }]) => ({
        date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        pct: total > 0 ? Math.round((presentAndExcused / total) * 100) : 0,
      }));
  }, [records]);

  // Pie data: overall breakdown
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ct1)' }}>Reports</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--ct3)' }}>
            Attendance analytics & export
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="download-csv-btn"
            className="btn btn-secondary"
            onClick={() => downloadCSV(reportRows, `${filename}.csv`, subjectColumns)}
            disabled={reportRows.length === 0}
          >
            <FileText size={16} /> CSV
          </button>
          <button
            id="download-pdf-btn"
            className="btn btn-primary"
            onClick={() => downloadPDF(reportRows, filterClass === 'all' ? 'All Classes' : `Class ${filterClass}`, subjectColumns)}
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
            { label: 'Students', val: reportRows.length, color: 'var(--sky)' },
            { label: 'Avg %', val: reportRows.length ? `${Math.round(reportRows.reduce((a, r) => a + r.pct, 0) / reportRows.length)}%` : '—', color: 'var(--gold)' },
            { label: 'Below 75%', val: reportRows.filter((r) => r.total > 0 && r.pct < 75).length, color: 'var(--rose)' },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-2 flex gap-2 items-center" style={{ borderRadius: 12 }}>
              <span style={{ color: s.color, fontWeight: 700, fontSize: '1rem' }}>{s.val}</span>
              <span style={{ color: 'var(--ct3)', fontSize: '0.75rem' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ct1)' }}>
            <BarChart3 size={16} style={{ color: 'var(--sage)' }} /> Daily Attendance (%)
          </h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--ct3)' }}>Loading…</div>
          ) : weeklyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--ct3)' }}>No data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-edge)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--ct3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--ct3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={entry.pct >= 75 ? '#7EAD7C' : '#E88090'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--ct1)' }}>
            <TrendingUp size={16} style={{ color: 'var(--sage)' }} /> Overall Split
          </h2>
          {totalPresent + totalAbsent === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--ct3)' }}>No data yet.</div>
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
                  formatter={(value) => <span style={{ color: 'var(--ct2)', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Report Table */}
      <div className="glass-card">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--c-edge)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--ct1)' }}>
            Detailed Student Report
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--ct3)' }}>Loading…</div>
        ) : reportRows.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--ct3)' }}>No data available.</div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  {subjectColumns.map(s => <th key={s}>{s}</th>)}
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
                      <td style={{ color: 'var(--ct1)', fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: 'var(--ct2)' }}>{r.rollNo}</td>
                      <td style={{ color: 'var(--ct2)' }}>{r.class}</td>
                      {subjectColumns.map(sub => (
                        <td key={sub} style={{ color: r.subjPcts?.[sub] >= 75 ? 'var(--sage)' : 'var(--rose)', fontWeight: 600 }}>
                          {r.subjPcts?.[sub] !== undefined ? `${r.subjPcts[sub]}%` : '—'}
                        </td>
                      ))}
                      <td style={{ color: 'var(--sage)', fontWeight: 600 }}>{r.present}</td>
                      <td style={{ color: 'var(--rose)', fontWeight: 600 }}>{r.absent}</td>
                      <td style={{ color: 'var(--ct3)' }}>{r.total}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card3)' }}>
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
