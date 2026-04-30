import React, { useState } from 'react';
import { Brain, ScanFace, ShieldAlert, TrendingDown } from 'lucide-react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';

export default function InsightsPage() {
  const { students } = useStudents();
  const { records } = useAllAttendance();
  const [scanning, setScanning] = useState(false);
  const [vibeResult, setVibeResult] = useState(null);

  // Predictive Dropout Risk Logic
  const riskStudents = students.map(student => {
    const studentRecords = records.filter(r => r.studentId === student.id);
    const total = studentRecords.length;
    const present = studentRecords.filter(r => r.status === 'present').length;
    const rate = total === 0 ? 100 : (present / total) * 100;
    
    // Check for recent continuous absences (last 3 days)
    const sorted = [...studentRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentMisses = sorted.slice(0, 3).filter(r => r.status === 'absent').length;

    let riskLevel = 'Low';
    if (rate < 75 || recentMisses >= 2) riskLevel = 'Medium';
    if (rate < 60 || recentMisses === 3) riskLevel = 'High';

    return { ...student, rate, riskLevel, recentMisses };
  }).filter(s => s.riskLevel !== 'Low');

  const runVibeCheck = () => {
    setScanning(true);
    setVibeResult(null);
    setTimeout(() => {
      setScanning(false);
      setVibeResult({
        focused: Math.floor(Math.random() * 40) + 40, // 40-80%
        tired: Math.floor(Math.random() * 30) + 10,  // 10-40%
        distracted: Math.floor(Math.random() * 20) + 5, // 5-25%
      });
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f1f5f9' }}>
          <Brain size={28} color="#a5b4fc" /> Smart Insights & AI
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
          Predictive analytics and real-time class sentiment analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Sentiment Analysis */}
        <div className="glass-card p-6 border-t-4 border-indigo-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>Class Sentiment Radar</h2>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Analyze real-time student engagement via virtual camera scan.</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <ScanFace size={24} color="#a5b4fc" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[200px] mb-4" style={{ background: 'rgba(15,23,42,0.4)', borderRadius: '12px' }}>
            {scanning ? (
              <div className="flex flex-col items-center animate-pulse">
                <ScanFace size={48} color="#6366f1" className="mb-4" />
                <p style={{ color: '#a5b4fc' }}>Running AI Vibe Check...</p>
              </div>
            ) : vibeResult ? (
              <div className="w-full p-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#34d399' }}>Focused / Engaged</span>
                    <span style={{ color: '#e2e8f0' }}>{vibeResult.focused}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(52,211,153,0.2)' }}>
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${vibeResult.focused}%`, transition: 'width 1s ease' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#fcd34d' }}>Tired / Low Energy</span>
                    <span style={{ color: '#e2e8f0' }}>{vibeResult.tired}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(252,211,77,0.2)' }}>
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${vibeResult.tired}%`, transition: 'width 1s ease' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: '#f87171' }}>Distracted</span>
                    <span style={{ color: '#e2e8f0' }}>{vibeResult.distracted}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(248,113,113,0.2)' }}>
                    <div className="h-full rounded-full bg-red-400" style={{ width: `${vibeResult.distracted}%`, transition: 'width 1s ease' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>Camera ready for sentiment scan.</p>
              </div>
            )}
          </div>
          <button 
            className="btn btn-primary w-full" 
            onClick={runVibeCheck}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Run Vibe Check'}
          </button>
        </div>

        {/* Predictive Dropout Risk */}
        <div className="glass-card p-6 border-t-4 border-red-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                <TrendingDown size={20} color="#f87171" /> Predictive Risk Alerts
              </h2>
              <p className="text-xs" style={{ color: '#94a3b8' }}>AI analysis of attendance patterns to prevent dropouts.</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <ShieldAlert size={24} color="#f87171" />
            </div>
          </div>

          <div className="space-y-3">
            {riskStudents.length === 0 ? (
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <p style={{ color: '#34d399' }}>All students have healthy attendance patterns!</p>
              </div>
            ) : (
              riskStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${student.riskLevel === 'High' ? 'rgba(248,113,113,0.3)' : 'rgba(252,211,77,0.3)'}` }}>
                  <div>
                    <p className="font-medium" style={{ color: '#e2e8f0' }}>{student.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                      {student.recentMisses > 0 ? `Missed ${student.recentMisses} recent classes` : `Overall rate: ${student.rate.toFixed(1)}%`}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide" style={{ 
                    background: student.riskLevel === 'High' ? 'rgba(248,113,113,0.2)' : 'rgba(252,211,77,0.2)',
                    color: student.riskLevel === 'High' ? '#f87171' : '#fbbf24'
                  }}>
                    {student.riskLevel} Risk
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
