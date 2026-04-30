import React, { useState, useEffect } from 'react';
import { MapPin, Signal, ShieldCheck, BellRing } from 'lucide-react';
import { useStudents } from '../hooks/useFirestore';

export default function GeofencePage() {
  const { students } = useStudents();
  const [arrivedStudents, setArrivedStudents] = useState([]);
  const [radarSweep, setRadarSweep] = useState(0);

  // Simulate students arriving over time
  useEffect(() => {
    if (!students || students.length === 0) return;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < Math.min(students.length, 5)) {
        setArrivedStudents(prev => {
          if (!prev.find(s => s.id === students[currentIndex].id)) {
            return [...prev, students[currentIndex]];
          }
          return prev;
        });
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 4000); // A student "arrives" every 4 seconds for the demo

    return () => clearInterval(interval);
  }, [students]);

  // Radar animation
  useEffect(() => {
    const radar = setInterval(() => {
      setRadarSweep(prev => (prev + 5) % 360);
    }, 50);
    return () => clearInterval(radar);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#f1f5f9' }}>
            <MapPin size={28} color="#a5b4fc" /> Safe-Arrival Geofence
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            Live tracking of student devices entering the school premises.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <Signal size={16} color="#34d399" className="animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: '#34d399' }}>Live Monitoring Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar UI */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          
          {/* Radar Background */}
          <div className="relative w-[300px] h-[300px] rounded-full border-2 border-indigo-500/30 flex items-center justify-center">
            <div className="absolute w-[200px] h-[200px] rounded-full border border-indigo-500/20"></div>
            <div className="absolute w-[100px] h-[100px] rounded-full border border-indigo-500/10 bg-indigo-500/5"></div>
            
            {/* School Icon at center */}
            <div className="absolute z-10 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <ShieldCheck size={16} color="white" />
            </div>

            {/* Sweeper */}
            <div 
              className="absolute top-1/2 left-1/2 w-[150px] h-[150px] origin-top-left"
              style={{ 
                background: 'conic-gradient(from 180deg at 0 0, rgba(99,102,241,0.4) 0deg, transparent 60deg)',
                transform: `rotate(${radarSweep}deg)`,
              }}
            ></div>

            {/* Dots for students */}
            {arrivedStudents.map((student, i) => {
               // Fixed positions for the demo
               const positions = [
                 { top: '30%', left: '40%' },
                 { top: '60%', left: '70%' },
                 { top: '20%', left: '60%' },
                 { top: '70%', left: '30%' },
                 { top: '40%', left: '80%' },
               ];
               const pos = positions[i % positions.length];
               
               return (
                 <div 
                   key={student.id} 
                   className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-bounce"
                   style={pos}
                   title={student.name}
                 >
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-0.5 rounded text-slate-200 whitespace-nowrap">
                     {student.name.split(' ')[0]}
                   </div>
                 </div>
               )
            })}
          </div>
        </div>

        {/* Live Arrival Log */}
        <div className="glass-card p-6 flex flex-col h-[400px]">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: '#e2e8f0' }}>
            <BellRing size={18} color="#fcd34d" /> Live Arrival Log
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {arrivedStudents.length === 0 ? (
              <p className="text-sm text-center mt-10" style={{ color: '#64748b' }}>Waiting for student devices to enter the zone...</p>
            ) : (
              [...arrivedStudents].reverse().map(student => (
                <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl animate-fade-in" style={{ background: 'rgba(15,23,42,0.6)', borderLeft: '3px solid #34d399' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{student.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Entered safe zone • SMS sent to parent</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
