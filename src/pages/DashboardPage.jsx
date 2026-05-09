import React, { useMemo } from 'react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';
import { Users, CalendarCheck, TrendingUp, AlertCircle, Flame } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  indigo:  '#7C6FFF',
  emerald: '#10D9A0',
  amber:   '#FFAD30',
  ruby:    '#FF5F7E',
  violet:  '#CF7BFF',
};

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <div className="glass-card stat-card p-5 animate-fade-up"
      style={{ animationDelay:`${delay}ms`, display:'flex', gap:14, alignItems:'flex-start' }}>
      <div style={{
        width:44, height:44, borderRadius:14, flexShrink:0,
        background:`${color}18`, border:`1px solid ${color}30`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ink3)', marginBottom:2 }}>{label}</p>
        <p style={{ fontSize:'1.55rem', fontWeight:900, color:'var(--ink1)', letterSpacing:'-.03em', lineHeight:1.1 }}>{value}</p>
        {sub && <p style={{ fontSize:'11px', color:'var(--ink4)', marginTop:2, fontWeight:500 }}>{sub}</p>}
      </div>
    </div>
  );
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--bg2)', border:'1px solid var(--edge)', borderRadius:12,
      padding:'10px 14px', fontSize:13, color:'var(--ink1)',
      boxShadow:'var(--shadow-md)',
    }}>
      <p style={{ fontWeight:700, marginBottom:4 }}>{label}</p>
      <p style={{ color:COLORS.indigo }}>Attendance: <strong>{payload[0]?.value?.toFixed(1)}%</strong></p>
    </div>
  );
};

export default function DashboardPage() {
  const { students, loading: sL } = useStudents();
  const { records, loading: rL } = useAllAttendance();

  const chartData = useMemo(() => {
    if (!records.length || !students.length) return [];
    const d = {};
    records.forEach(r => {
      if (!d[r.date]) d[r.date] = { present:0, total:0 };
      d[r.date].total++;
      if (r.status==='present') d[r.date].present++;
    });
    return Object.entries(d).sort(([a],[b])=>a.localeCompare(b)).slice(-7)
      .map(([date,{present,total}]) => ({
        date: new Date(date).toLocaleDateString('en-IN',{month:'short',day:'numeric'}),
        attendance: total>0 ? (present/total)*100 : 0,
      }));
  }, [records, students]);

  const studentStats = useMemo(() => {
    const m = {};
    students.forEach(s => { m[s.id]={present:0,total:0,name:s.name,rollNo:s.rollNo,class:s.class}; });
    records.forEach(r => {
      if (m[r.studentId]) { m[r.studentId].total++; if(r.status==='present') m[r.studentId].present++; }
    });
    return Object.values(m);
  }, [students, records]);

  const avg = useMemo(() => {
    const v = studentStats.filter(s=>s.total>0);
    return v.length ? v.reduce((a,s)=>a+(s.present/s.total)*100,0)/v.length : 0;
  }, [studentStats]);

  const low = studentStats.filter(s=>s.total>0&&(s.present/s.total)*100<75).length;

  const maxStreak = useMemo(() => {
    const sr = {};
    records.forEach(r=>{ if(!sr[r.studentId]) sr[r.studentId]=[]; sr[r.studentId].push(r); });
    let best=0;
    students.forEach(s=>{
      let streak=0;
      if(sr[s.id]){
        const sorted=sr[s.id].sort((a,b)=>new Date(b.date)-new Date(a.date));
        for(const r of sorted){ if(r.status==='present') streak++; else break; }
      }
      if(streak>best) best=streak;
    });
    return best;
  }, [records, students]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPresent = records.filter(r=>r.date===todayStr&&r.status==='present').length;
  const loading = sL||rL;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">
          {new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14 }}>
        <StatCard icon={Users}        label="Total Students"  value={loading?'—':students.length}           sub="Registered"      color={COLORS.indigo}  delay={0}   />
        <StatCard icon={CalendarCheck} label="Today Present"   value={loading?'—':`${todayPresent}/${students.length}`} sub="Marked today" color={COLORS.emerald} delay={60}  />
        <StatCard icon={TrendingUp}    label="Avg Attendance"  value={loading?'—':`${avg.toFixed(1)}%`}       sub="All-time"        color={COLORS.amber}   delay={120} />
        <StatCard icon={AlertCircle}   label="Below 75%"       value={loading?'—':low}                        sub="Need attention"  color={COLORS.ruby}    delay={180} />
        <StatCard icon={Flame}         label="Top Streak"      value={loading?'—':`${maxStreak}d`}            sub="Consecutive days"color={COLORS.violet}  delay={240} />
      </div>

      {/* Chart */}
      <div className="glass-card p-6 animate-fade-up" style={{ animationDelay:'300ms' }}>
        <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ink2)', marginBottom:16, letterSpacing:'.02em' }}>
          📈 Weekly Attendance Trend
        </p>
        {loading ? (
          <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink4)' }}>Loading…</div>
        ) : chartData.length===0 ? (
          <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--ink4)' }}>
            No data yet — start marking attendance!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{top:4,right:4,left:-24,bottom:0}}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C6FFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7C6FFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--edge)" />
              <XAxis dataKey="date" tick={{fill:'var(--ink3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:'var(--ink3)',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="attendance" stroke="#7C6FFF" strokeWidth={2.5}
                fill="url(#areaGrad)" dot={{fill:'#7C6FFF',r:4}} activeDot={{r:6,fill:'#CF7BFF'}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alert */}
      {low>0 && (
        <div className="glass-card p-4 animate-fade-up" style={{
          borderColor:'rgba(255,95,126,.25)', background:'rgba(255,95,126,.05)',
          display:'flex', alignItems:'flex-start', gap:12, animationDelay:'350ms'
        }}>
          <AlertCircle size={18} style={{color:'var(--ruby)',flexShrink:0,marginTop:1}}/>
          <div>
            <p style={{fontSize:'13px',fontWeight:700,color:'var(--ruby)'}}>
              {low} student{low>1?'s':''} below 75% attendance
            </p>
            <p style={{fontSize:'11px',color:'var(--ink3)',marginTop:3}}>Review the Reports page for detailed breakdown.</p>
          </div>
        </div>
      )}

      {/* Overview table */}
      <div className="glass-card animate-fade-up" style={{ animationDelay:'400ms' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--edge)' }}>
          <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ink2)' }}>👥 Student Overview</p>
        </div>
        {loading ? (
          <div style={{ padding:24, color:'var(--ink4)', fontSize:13 }}>Loading…</div>
        ) : students.length===0 ? (
          <div style={{ padding:32, textAlign:'center', fontSize:13, color:'var(--ink4)' }}>No students yet. Go to Students → Add Student.</div>
        ) : (
          <div className="table-container" style={{ border:'none', borderRadius:'0 0 18px 18px' }}>
            <table>
              <thead><tr><th>Name</th><th>Roll No</th><th>Class</th><th>Attendance</th></tr></thead>
              <tbody>
                {studentStats.slice(0,8).map((s,i)=>{
                  const pct = s.total>0 ? ((s.present/s.total)*100).toFixed(1) : null;
                  const col = !pct ? 'var(--ink4)' : parseFloat(pct)>=75 ? 'var(--emerald)' : 'var(--ruby)';
                  return (
                    <tr key={i}>
                      <td style={{ color:'var(--ink1)', fontWeight:600 }}>{s.name}</td>
                      <td style={{ color:'var(--ink3)' }}>{s.rollNo}</td>
                      <td style={{ color:'var(--ink3)' }}>{s.class}</td>
                      <td>
                        <span className="badge" style={{ background:`${col}18`, color:col, border:`1px solid ${col}28` }}>
                          {pct ? `${pct}%` : '—'}
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
