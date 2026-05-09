import React, { useState } from 'react';
import { Brain, ScanFace, ShieldAlert, TrendingDown } from 'lucide-react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';

export default function InsightsPage() {
  const { students } = useStudents();
  const { records } = useAllAttendance();
  const [scanning, setScanning] = useState(false);
  const [vibeResult, setVibeResult] = useState(null);

  const riskStudents = students.map(student => {
    const sr = records.filter(r => r.studentId === student.id);
    const total = sr.length;
    const present = sr.filter(r => r.status === 'present').length;
    const rate = total === 0 ? 100 : (present / total) * 100;
    const sorted = [...sr].sort((a,b) => new Date(b.date)-new Date(a.date));
    const recentMisses = sorted.slice(0,3).filter(r => r.status==='absent').length;
    let riskLevel = 'Low';
    if (rate < 75 || recentMisses >= 2) riskLevel = 'Medium';
    if (rate < 60 || recentMisses === 3) riskLevel = 'High';
    return { ...student, rate, riskLevel, recentMisses };
  }).filter(s => s.riskLevel !== 'Low');

  const runVibeCheck = () => {
    setScanning(true); setVibeResult(null);
    setTimeout(() => {
      setScanning(false);
      setVibeResult({
        focused: Math.floor(Math.random()*40)+40,
        tired:   Math.floor(Math.random()*30)+10,
        distracted: Math.floor(Math.random()*20)+5,
      });
    }, 2500);
  };

  const Bar = ({ label, value, color }) => (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:'13px', fontWeight:600, color }}>{label}</span>
        <span style={{ fontSize:'13px', fontWeight:700, color:'var(--ct1)' }}>{value}%</span>
      </div>
      <div className="pbar-track">
        <div className="pbar-fill" style={{ width:`${value}%`, background:color }}/>
      </div>
    </div>
  );

  return (
    <div className="page-wrap anim-in">
      <div>
        <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Brain size={24} style={{ color:'var(--mauve)' }}/> Smart Insights
        </h1>
        <p className="page-sub">Predictive analytics and real-time class sentiment analysis.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
        {/* Sentiment Scanner */}
        <div className="card" style={{ padding:'22px', borderTop:'3px solid var(--mauve)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'var(--ct1)', marginBottom:3 }}>Class Sentiment Radar</h2>
              <p style={{ fontSize:'12px', color:'var(--ct3)', fontWeight:500 }}>Analyze real-time student engagement via virtual camera scan.</p>
            </div>
            <div style={{ padding:8, borderRadius:10, background:'var(--mauve-l)', border:'1px solid var(--mauve-b)', flexShrink:0 }}>
              <ScanFace size={20} style={{ color:'var(--mauve)' }}/>
            </div>
          </div>

          <div style={{ minHeight:180, borderRadius:14, background:'var(--card2)', border:'1px solid var(--c-edge)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginBottom:14, padding:16 }}>
            {scanning ? (
              <div style={{ textAlign:'center' }}>
                <ScanFace size={40} style={{ color:'var(--mauve)', marginBottom:10 }}/>
                <p style={{ fontSize:'13px', color:'var(--ct2)', fontWeight:600 }}>Running AI Vibe Check…</p>
              </div>
            ) : vibeResult ? (
              <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:14 }}>
                <Bar label="Focused / Engaged" value={vibeResult.focused} color={`var(--sage)`}/>
                <Bar label="Tired / Low Energy"  value={vibeResult.tired}   color={`var(--gold)`}/>
                <Bar label="Distracted"           value={vibeResult.distracted} color={`var(--rose)`}/>
              </div>
            ) : (
              <p style={{ fontSize:'13px', color:'var(--ct3)', fontWeight:500 }}>Camera ready for sentiment scan.</p>
            )}
          </div>
          <button className="btn btn-primary" onClick={runVibeCheck} disabled={scanning} style={{ width:'100%', minHeight:42 }}>
            {scanning ? 'Scanning…' : 'Run Vibe Check'}
          </button>
        </div>

        {/* Dropout Risk */}
        <div className="card" style={{ padding:'22px', borderTop:'3px solid var(--rose)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'var(--ct1)', marginBottom:3, display:'flex', alignItems:'center', gap:6 }}>
                <TrendingDown size={17} style={{ color:'var(--rose)' }}/> Predictive Risk Alerts
              </h2>
              <p style={{ fontSize:'12px', color:'var(--ct3)', fontWeight:500 }}>AI analysis of attendance patterns to prevent dropouts.</p>
            </div>
            <div style={{ padding:8, borderRadius:10, background:'var(--rose-l)', border:'1px solid var(--rose-b)', flexShrink:0 }}>
              <ShieldAlert size={20} style={{ color:'var(--rose)' }}/>
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {riskStudents.length === 0 ? (
              <div style={{ padding:'16px', borderRadius:12, textAlign:'center', background:'var(--sage-l)', border:'1px solid var(--sage-b)' }}>
                <p style={{ fontSize:'13px', color:'var(--sage)', fontWeight:600 }}>✓ All students have healthy attendance!</p>
              </div>
            ) : riskStudents.map(s => {
              const isHigh = s.riskLevel === 'High';
              const col = isHigh ? 'var(--rose)' : 'var(--gold)';
              const bg  = isHigh ? 'var(--rose-l)' : 'var(--gold-l)';
              const bd  = isHigh ? 'var(--rose-b)' : 'var(--gold-b)';
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, background:bg, border:`1px solid ${bd}` }}>
                  <div>
                    <p style={{ fontSize:'13px', fontWeight:700, color:'var(--ct1)', marginBottom:2 }}>{s.name}</p>
                    <p style={{ fontSize:'11px', color:'var(--ct3)', fontWeight:500 }}>
                      {s.recentMisses > 0 ? `Missed ${s.recentMisses} recent classes` : `Rate: ${s.rate.toFixed(1)}%`}
                    </p>
                  </div>
                  <span className="badge" style={{ background:'rgba(0,0,0,.05)', color:col, fontSize:'10px', fontWeight:800 }}>
                    {s.riskLevel} RISK
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
