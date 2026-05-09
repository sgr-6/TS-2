import React, { useMemo } from 'react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';
import { Users, CalendarCheck, TrendingUp, AlertCircle, Flame } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATS = [
  { key:'students',  label:'Total Students',  icon:Users,        color:'#8B5CF6' },
  { key:'today',     label:'Today Present',    icon:CalendarCheck,color:'#10B981' },
  { key:'avg',       label:'Avg Attendance',   icon:TrendingUp,   color:'#3B82F6' },
  { key:'low',       label:'Below 75%',        icon:AlertCircle,  color:'#F43F5E' },
  { key:'streak',    label:'Top Streak',       icon:Flame,        color:'#F97316' },
];

const Tip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'var(--t1)',boxShadow:'0 8px 24px rgba(0,0,0,.3)' }}>
      <p style={{ fontWeight:700,marginBottom:3 }}>{label}</p>
      <p style={{ color:'#8B5CF6' }}>Attendance: <b>{payload[0]?.value?.toFixed(1)}%</b></p>
    </div>
  );
};

export default function DashboardPage() {
  const { students, loading:sL } = useStudents();
  const { records, loading:rL } = useAllAttendance();

  const chartData = useMemo(()=>{
    if (!records.length) return [];
    const d={};
    records.forEach(r=>{ if(!d[r.date]) d[r.date]={present:0,total:0}; d[r.date].total++; if(r.status==='present') d[r.date].present++; });
    return Object.entries(d).sort(([a],[b])=>a.localeCompare(b)).slice(-7)
      .map(([date,{present,total}])=>({ date:new Date(date).toLocaleDateString('en-IN',{month:'short',day:'numeric'}), pct:total>0?(present/total)*100:0 }));
  },[records]);

  const sstats = useMemo(()=>{
    const m={};
    students.forEach(s=>{m[s.id]={present:0,total:0,...s};});
    records.forEach(r=>{ if(m[r.studentId]){m[r.studentId].total++;if(r.status==='present')m[r.studentId].present++;} });
    return Object.values(m);
  },[students,records]);

  const avg = useMemo(()=>{ const v=sstats.filter(s=>s.total>0); return v.length?v.reduce((a,s)=>a+(s.present/s.total)*100,0)/v.length:0; },[sstats]);
  const low = sstats.filter(s=>s.total>0&&(s.present/s.total)*100<75).length;

  const maxStreak = useMemo(()=>{
    const sr={}; records.forEach(r=>{if(!sr[r.studentId])sr[r.studentId]=[];sr[r.studentId].push(r);});
    let best=0;
    students.forEach(s=>{ let k=0; if(sr[s.id]){const srt=sr[s.id].sort((a,b)=>new Date(b.date)-new Date(a.date));for(const r of srt){if(r.status==='present')k++;else break;}} if(k>best)best=k; });
    return best;
  },[records,students]);

  const today=new Date().toISOString().split('T')[0];
  const todayP=records.filter(r=>r.date===today&&r.status==='present').length;
  const loading=sL||rL;

  const vals = {
    students: loading?'—':students.length,
    today: loading?'—':`${todayP}/${students.length}`,
    avg: loading?'—':`${avg.toFixed(1)}%`,
    low: loading?'—':low,
    streak: loading?'—':`${maxStreak}d`,
  };

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="anim-up">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        {STATS.map((s,i)=>{
          const c=s.color;
          return (
            <div key={s.key} className={`card stat-card anim-up d${i+1}`}
              style={{ padding:'18px 16px', display:'flex', gap:13, alignItems:'flex-start', '--before-bg':c }}>
              <style>{`.stat-card:nth-child(${i+1})::before{background:${c}}`}</style>
              <div style={{ width:40,height:40,borderRadius:11,flexShrink:0,background:`${c}15`,border:`1px solid ${c}28`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <s.icon size={19} style={{ color:c }}/>
              </div>
              <div>
                <p style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--t3)',marginBottom:3 }}>{s.label}</p>
                <p style={{ fontSize:'1.45rem',fontWeight:900,color:c,letterSpacing:'-.03em',lineHeight:1 }}>{vals[s.key]}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card p-6 anim-up d3">
        <p style={{ fontSize:'12px',fontWeight:700,color:'var(--t2)',marginBottom:16,display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ width:8,height:8,borderRadius:'50%',background:'#8B5CF6',display:'inline-block',boxShadow:'0 0 6px #8B5CF6' }}/>
          Weekly Attendance Trend
        </p>
        {loading ? (
          <div style={{ height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--t3)',fontSize:13 }}>Loading…</div>
        ) : chartData.length===0 ? (
          <div style={{ height:200,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'var(--t3)' }}>No data yet — start marking attendance!</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{top:4,right:4,left:-24,bottom:0}}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={.35}/>
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="date" tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,100]} tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="pct" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#g1)" dot={{fill:'#8B5CF6',r:3,strokeWidth:0}} activeDot={{r:5,fill:'#A78BFA',strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alert */}
      {low>0 && (
        <div className="card anim-up d4" style={{ padding:'14px 18px',borderColor:'rgba(244,63,94,.25)',background:'rgba(244,63,94,.04)',display:'flex',alignItems:'center',gap:12 }}>
          <AlertCircle size={17} style={{color:'#F43F5E',flexShrink:0}}/>
          <div>
            <p style={{fontSize:'13px',fontWeight:700,color:'#F43F5E'}}>{low} student{low>1?'s':''} below 75%</p>
            <p style={{fontSize:'11px',color:'var(--t3)',marginTop:2}}>Review the Reports page for a detailed breakdown.</p>
          </div>
        </div>
      )}

      {/* Student table */}
      <div className="card anim-up d5">
        <div style={{ padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ width:8,height:8,borderRadius:'50%',background:'#3B82F6',display:'inline-block' }}/>
          <p style={{ fontSize:'12px',fontWeight:700,color:'var(--t2)' }}>Student Overview</p>
        </div>
        {loading ? (
          <p style={{ padding:'24px 18px',fontSize:13,color:'var(--t3)' }}>Loading…</p>
        ) : students.length===0 ? (
          <p style={{ padding:'32px 18px',textAlign:'center',fontSize:13,color:'var(--t3)' }}>No students yet. Go to Students → Add Student.</p>
        ) : (
          <div className="table-container" style={{ border:'none',borderRadius:'0 0 14px 14px' }}>
            <table>
              <thead><tr><th>Name</th><th>Roll No</th><th>Class</th><th>Attendance</th></tr></thead>
              <tbody>
                {sstats.slice(0,8).map((s,i)=>{
                  const pct=s.total>0?((s.present/s.total)*100).toFixed(1):null;
                  const col=!pct?'var(--t3)':parseFloat(pct)>=75?'var(--emerald)':'var(--rose)';
                  return (
                    <tr key={i}>
                      <td style={{color:'var(--t1)',fontWeight:600}}>{s.name}</td>
                      <td style={{color:'var(--t3)'}}>{s.rollNo}</td>
                      <td><span className="badge" style={{background:'rgba(99,102,241,.12)',color:'var(--indigo)'}}>{s.class}</span></td>
                      <td><span className="badge" style={{background:`${col}18`,color:col}}>{pct?`${pct}%`:'—'}</span></td>
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
