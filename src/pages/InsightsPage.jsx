import React from 'react';
import { Brain, ShieldAlert, TrendingDown } from 'lucide-react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';

export default function InsightsPage() {
  const { students } = useStudents();
  const { records } = useAllAttendance();

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


  return (
    <div className="page-wrap anim-in">
      <div>
        <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Brain size={24} style={{ color:'var(--mauve)' }}/> Smart Insights
        </h1>
        <p className="page-sub">Predictive analytics for student attrition based on consecutive absences.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
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
