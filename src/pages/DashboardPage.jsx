import React, { useMemo } from 'react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';
import { Users, CalendarCheck, TrendingUp, AlertCircle, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/* ── Ring component like the 82% in the image ── */
function Ring({ pct=0, size=120, color='#7EAD7C', label, sub }) {
  const r = (size-16)/2;
  const circ = 2*Math.PI*r;
  const dash = circ*(pct/100);
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:10 }}>
      <div style={{ position:'relative',width:size,height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--card3)" strokeWidth={7}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}/>
        </svg>
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
          <p style={{ fontSize:'1.5rem',fontWeight:900,color:'var(--ct1)',letterSpacing:'-.04em',lineHeight:1 }}>{pct}%</p>
        </div>
      </div>
      {label && <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'13px',fontWeight:700,color:'var(--ct1)' }}>{label}</p>
        {sub && <p style={{ fontSize:'11px',fontWeight:500,color:'var(--ct3)',marginTop:2 }}>{sub}</p>}
      </div>}
    </div>
  );
}

/* ── Stat pill ── */
function Pill({ icon:Icon, label, value, color }) {
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:14,background:'var(--card2)',border:'1px solid var(--c-edge)' }}>
      <div style={{ width:36,height:36,borderRadius:10,background:`${color}18`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
        <Icon size={17} style={{ color }}/>
      </div>
      <div>
        <p style={{ fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'var(--ct3)',marginBottom:1 }}>{label}</p>
        <p style={{ fontSize:'1rem',fontWeight:800,color:'var(--ct1)',letterSpacing:'-.02em' }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Chart tooltip ── */
const Tip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:'var(--card)',border:'1px solid var(--c-edge)',borderRadius:10,padding:'8px 12px',fontSize:12,color:'var(--ct1)',boxShadow:'var(--c-shad)' }}>
      <p style={{ fontWeight:700,marginBottom:2 }}>{label}</p>
      <p style={{ color:'#7EAD7C',fontWeight:600 }}>{payload[0]?.value?.toFixed(1)}%</p>
    </div>
  );
};

export default function DashboardPage() {
  const { students, loading:sL } = useStudents();
  const { records, loading:rL } = useAllAttendance();

  const chartData = useMemo(()=>{
    const d={};
    records.forEach(r=>{ if(!d[r.date])d[r.date]={p:0,t:0}; d[r.date].t++; if(r.status==='present')d[r.date].p++; });
    return Object.entries(d).sort(([a],[b])=>a.localeCompare(b)).slice(-7).map(([date,{p,t}])=>({
      date:new Date(date).toLocaleDateString('en-IN',{month:'short',day:'numeric'}),
      pct:t>0?Math.round((p/t)*100):0,
    }));
  },[records]);

  const sstats = useMemo(()=>{
    const m={};
    students.forEach(s=>{m[s.id]={p:0,t:0,...s};});
    records.forEach(r=>{ if(m[r.studentId]){m[r.studentId].t++;if(r.status==='present')m[r.studentId].p++;} });
    return Object.values(m);
  },[students,records]);

  const avg = useMemo(()=>{ const v=sstats.filter(s=>s.t>0); return v.length?Math.round(v.reduce((a,s)=>a+(s.p/s.t)*100,0)/v.length):0; },[sstats]);
  const low = sstats.filter(s=>s.t>0&&(s.p/s.t)*100<75).length;
  const today=new Date().toISOString().split('T')[0];
  const todayP=records.filter(r=>r.date===today&&r.status==='present').length;
  const loading=sL||rL;

  const maxStreak=useMemo(()=>{
    const sr={}; records.forEach(r=>{if(!sr[r.studentId])sr[r.studentId]=[];sr[r.studentId].push(r);});
    let best=0;
    students.forEach(s=>{ let k=0; if(sr[s.id]){const x=sr[s.id].sort((a,b)=>new Date(b.date)-new Date(a.date));for(const r of x){if(r.status==='present')k++;else break;}} if(k>best)best=k; });
    return best;
  },[records,students]);

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="anim-up">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      {/* Bento Row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:14 }}>

        {/* Ring — Avg Attendance */}
        <div className="card anim-up d1" style={{ padding:'24px 20px',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Ring pct={loading?0:avg} color="#7EAD7C" label="Avg Attendance" sub={`${students.length} students`}/>
        </div>

        {/* Today card — sage green like the featured card */}
        <div className="card anim-up d2" style={{ padding:'22px 20px',background:'linear-gradient(145deg,#7EAD7C,#6DBDAC)',border:'none',display:'flex',flexDirection:'column',justifyContent:'space-between' }}>
          <div>
            <span style={{ display:'inline-block',padding:'3px 10px',borderRadius:99,background:'rgba(255,255,255,.2)',fontSize:'10px',fontWeight:700,color:'#fff',marginBottom:10 }}>
              Today
            </span>
            <p style={{ fontSize:'1.6rem',fontWeight:900,color:'#fff',letterSpacing:'-.03em',lineHeight:1.1 }}>
              {loading?'—':todayP}<span style={{ fontSize:'1rem',fontWeight:600,opacity:.7 }}>/{students.length}</span>
            </p>
            <p style={{ fontSize:'12px',color:'rgba(255,255,255,.75)',marginTop:6,fontWeight:500 }}>Students present today</p>
          </div>
          <div style={{ display:'flex',justifyContent:'flex-end' }}>
            <CalendarCheck size={32} color="rgba(255,255,255,.3)"/>
          </div>
        </div>

        {/* Chart */}
        <div className="card anim-up d3" style={{ padding:'20px 22px' }}>
          <div style={{ display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:16 }}>
            <p style={{ fontSize:'15px',fontWeight:700,color:'var(--ct1)' }}>Attendance Trend</p>
            <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>Last 7 sessions</p>
          </div>
          {loading||chartData.length===0 ? (
            <div style={{ height:130,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'var(--ct3)' }}>
              {loading?'Loading…':'No data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={chartData} margin={{top:0,right:0,left:-28,bottom:0}} barSize={18}>
                <XAxis dataKey="date" tick={{fill:'var(--ct3)',fontSize:10,fontWeight:500}} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{fill:'var(--ct3)',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<Tip/>} cursor={{fill:'var(--card2)',radius:8}}/>
                <Bar dataKey="pct" radius={[6,6,0,0]}>
                  {chartData.map((entry,i)=>(
                    <Cell key={i} fill={entry.pct>=75?'#7EAD7C':'#E88090'} fillOpacity={.85}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bento Row 2 — 4 stat pills */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12 }} className="anim-up d4">
        <Pill icon={Users}        label="Total Students"  value={loading?'—':students.length} color="#7BB5E8"/>
        <Pill icon={TrendingUp}   label="Class Average"   value={loading?'—':`${avg}%`}       color="#7EAD7C"/>
        <Pill icon={AlertCircle}  label="Below 75%"       value={loading?'—':low}              color="#E88090"/>
        <Pill icon={Flame}        label="Top Streak"      value={loading?'—':`${maxStreak} days`} color="#E8BC60"/>
      </div>

      {/* Student Overview */}
      <div className="card anim-up d5">
        <div style={{ padding:'16px 20px',borderBottom:'1px solid var(--c-edge)',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:'14px',fontWeight:700,color:'var(--ct1)' }}>Students</p>
            <p style={{ fontSize:'11px',color:'var(--ct3)',fontWeight:500 }}>{students.length} registered</p>
          </div>
        </div>

        {loading ? (
          <p style={{ padding:'24px',fontSize:13,color:'var(--ct3)' }}>Loading…</p>
        ) : students.length===0 ? (
          <p style={{ padding:'32px',textAlign:'center',fontSize:13,color:'var(--ct3)' }}>No students yet. Go to Students → Add Student.</p>
        ) : (
          <div style={{ padding:'14px 20px',display:'flex',flexDirection:'column',gap:12 }}>
            {sstats.slice(0,6).map((s,i)=>{
              const pct=s.t>0?Math.round((s.p/s.t)*100):null;
              const color=!pct?'#C0B8A8':pct>=75?'#7EAD7C':'#E88090';
              return (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:32,height:32,borderRadius:99,background:`${color}18`,border:`1px solid ${color}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color,flexShrink:0 }}>
                    {s.name[0]}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
                      <p style={{ fontSize:'13px',fontWeight:600,color:'var(--ct1)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{s.name}</p>
                      <span style={{ fontSize:'11px',fontWeight:700,color,flexShrink:0,marginLeft:8 }}>{pct!==null?`${pct}%`:'—'}</span>
                    </div>
                    <div className="pbar-track">
                      <div className="pbar-fill" style={{ width:`${pct||0}%`,background:color }}/>
                    </div>
                  </div>
                  <span style={{ fontSize:'10px',fontWeight:600,color:'var(--ct3)',flexShrink:0,minWidth:40,textAlign:'right' }}>{s.class}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low attendance alert */}
      {!loading && low>0 && (
        <div className="anim-up d6" style={{ padding:'14px 18px',borderRadius:16,background:'var(--rose-l)',border:'1px solid var(--rose-b)',display:'flex',alignItems:'center',gap:12 }}>
          <AlertCircle size={17} style={{ color:'var(--rose)',flexShrink:0 }}/>
          <p style={{ fontSize:'13px',fontWeight:700,color:'var(--rose)' }}>
            {low} student{low>1?'s':''} below 75% — check the Reports page
          </p>
        </div>
      )}
    </div>
  );
}
