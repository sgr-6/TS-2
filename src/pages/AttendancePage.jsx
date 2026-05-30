import React, { useState, useMemo } from 'react';
import { useStudents, useAttendanceForDate, saveAttendance } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { CalendarDays, Save, CheckCircle2, XCircle, Mic, MicOff } from 'lucide-react';

export default function AttendancePage() {
  const { user, userProfile, activeClass } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { students, loading: sL } = useStudents();
  // Fetch attendance records for this specific class
  const classId = activeClass ? `${activeClass.semester} - Section ${activeClass.section}` : (userProfile?.className || 'Unknown Class');
  const { records, loading: rL } = useAttendanceForDate(date, classId);
  const [overrides, setOverrides] = useState({});
  const [listening, setListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) { alert('Voice recognition requires Chrome.'); return; }
    if (listening) { setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
    rec.onstart = () => { setListening(true); setVoiceFeedback('Listening… Say "Mark [Name] present"'); };
    rec.onresult = (e) => {
      const t = e.results[e.results.length-1][0].transcript.toLowerCase();
      let matched = false;
      students.forEach(s => {
        const n = s.name.toLowerCase();
        if (t.includes(n) || t.includes(n.split(' ')[0])) {
          if (t.includes('present')) { setOverrides(p=>({...p,[s.id]:'present'})); setVoiceFeedback(`Marked ${s.name} present`); matched=true; }
          else if (t.includes('absent')) { setOverrides(p=>({...p,[s.id]:'absent'})); setVoiceFeedback(`Marked ${s.name} absent`); matched=true; }
        }
      });
      if (!matched) setVoiceFeedback("Didn't catch the name. Say again.");
      setSaved(false);
    };
    rec.onerror = () => { setListening(false); setVoiceFeedback('Error.'); };
    rec.onend   = () => { setListening(false); setTimeout(()=>setVoiceFeedback(''),3000); };
    rec.start();
  };

  const statusMap = useMemo(() => {
    const m = {};
    records.forEach(r => { m[r.studentId] = r.status; });
    Object.entries(overrides).forEach(([id,s]) => { m[id] = s; });
    return m;
  }, [records, overrides]);

  const isWeekend = useMemo(() => { const d=new Date(date+'T00:00:00'); return d.getDay()===0||d.getDay()===6; }, [date]);

  function setStudentStatus(id, newStatus) {
    setOverrides(p=>({...p,[id]:newStatus}));
    setSaved(false);
  }

  function markAll(status) {
    const o={};
    students.forEach(s=>{
      o[s.id]=status;
    });
    setOverrides(o); setSaved(false);
  }

  // ... (leaving other code alone, just targeting handleSave)
  async function handleSave() {
    if(!user) return; setSaving(true);
    const subName = activeClass ? activeClass.subjectName : (userProfile?.subjectName || 'Unknown Subject');
    const cId = activeClass ? `${activeClass.semester} - Section ${activeClass.section}` : (userProfile?.className || 'Unknown Class');

    try {
      await Promise.all(students.map(s=>saveAttendance(
        date, s.id, statusMap[s.id]||'absent', user.uid, userProfile?.teacherName || 'Teacher', subName, cId
      )));
      setOverrides({}); setSaved(true); setTimeout(()=>setSaved(false),3000);
    } finally { setSaving(false); }
  }

  const presentCount = students.filter(s=>(statusMap[s.id]||'absent')==='present').length;
  const loading = sL||rL;

  return (
    <div className="page-wrap anim-in">
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div>
          <h1 className="page-title">Mark Attendance</h1>
          <p className="page-sub">{presentCount}/{students.length} present today</p>
        </div>
        <button id="save-attendance-btn" className="btn btn-primary" onClick={handleSave}
          disabled={saving||students.length===0||isWeekend} style={{ minHeight:42, borderRadius:12 }}>
          {saving ? (
            <><span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .6s linear infinite' }}/> Saving…</>
          ) : saved ? (
            <><CheckCircle2 size={16}/> Saved!</>
          ) : (
            <><Save size={16}/> Save Attendance</>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding:'14px 18px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200 }}>
          <CalendarDays size={16} style={{ color:'var(--sage)', flexShrink:0 }}/>
          <input id="attendance-date-picker" type="date" className="input" value={date} max={today}
            onChange={e=>{ setDate(e.target.value); setOverrides({}); setSaved(false); }}
            style={{ maxWidth:180 }}/>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={toggleVoice} title="Voice Commands"
            style={{ fontSize:'12px', minHeight:38, background:listening?'var(--rose-l)':undefined, color:listening?'var(--rose)':undefined, borderColor:listening?'var(--rose-b)':undefined }}>
            {listening?<Mic size={14} style={{ animation:'pulse 1s infinite' }}/>:<MicOff size={14}/>}
            <span style={{ marginLeft:4 }}>{listening?'Listening…':'Voice'}</span>
          </button>
          <button id="mark-all-present-btn" className="btn btn-success" onClick={()=>markAll('present')}
            disabled={students.length===0||isWeekend} style={{ fontSize:'12px', minHeight:38 }}>
            <CheckCircle2 size={14}/> All Present
          </button>
          <button id="mark-all-absent-btn" className="btn btn-danger" onClick={()=>markAll('absent')}
            disabled={students.length===0||isWeekend} style={{ fontSize:'12px', minHeight:38 }}>
            <XCircle size={14}/> All Absent
          </button>
        </div>
      </div>

      {voiceFeedback && (
        <div style={{ textAlign:'center', padding:'8px 20px', borderRadius:99, background:'var(--mauve-l)', border:'1px solid var(--mauve-b)', fontSize:'12px', fontWeight:600, color:'var(--mauve)', width:'fit-content', margin:'0 auto' }}>
          {voiceFeedback}
        </div>
      )}

      {/* Progress */}
      {students.length > 0 && (
        <div className="card" style={{ padding:'14px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', fontWeight:600, color:'var(--ct3)', marginBottom:8 }}>
            <span>Attendance Progress</span>
            <span style={{ color:'var(--ct1)', fontWeight:700 }}>{students.length>0?((presentCount/students.length)*100).toFixed(0):0}%</span>
          </div>
          <div className="pbar-track">
            <div className="pbar-fill" style={{ width:`${students.length>0?(presentCount/students.length)*100:0}%`, background:'var(--sage)' }}/>
          </div>
        </div>
      )}

      {/* List */}
      {isWeekend ? (
        <div className="card" style={{ padding:'3rem', textAlign:'center', fontSize:'14px', color:'var(--ct3)', fontWeight:500 }}>
          🎉 No attendance on weekends — college is closed Saturday & Sunday.
        </div>
      ) : loading ? (
        <div className="card" style={{ padding:'3rem', textAlign:'center', fontSize:'14px', color:'var(--ct3)' }}>Loading…</div>
      ) : students.length === 0 ? (
        <div className="card" style={{ padding:'3rem', textAlign:'center', fontSize:'14px', color:'var(--ct3)', fontWeight:500 }}>
          No students yet. Go to Students → Add Student.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {students.map((s, i) => {
            const currentStatus = statusMap[s.id]||'absent';
            const statusColorMap = {
              'present': 'var(--sage)',
              'absent': 'var(--rose)',
            };
            const col = statusColorMap[currentStatus];
            
            return (
              <div key={s.id} className="card"
                style={{
                  padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                  borderColor: currentStatus !== 'absent' ? `${col}44` : 'var(--c-edge)',
                  background: currentStatus !== 'absent' ? `${col}11` : 'var(--card)',
                  animationDelay:`${i*0.02}s`,
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38,height:38,borderRadius:10,flexShrink:0, background:currentStatus!=='absent'?`${col}22`:'var(--card2)', border:`1px solid ${currentStatus!=='absent'?`${col}44`:'var(--c-edge)'}`, display:'flex',alignItems:'center',justifyContent:'center', fontSize:'13px',fontWeight:800,color:col }}>
                    {s.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:'14px', fontWeight:700, color:'var(--ct1)' }}>{s.name}</p>
                    <p style={{ fontSize:'11px', color:'var(--ct3)', fontWeight:500 }}>{s.rollNo} · {s.class}</p>
                  </div>
                </div>
                
                <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0, background:'var(--card2)', padding:4, borderRadius:12, border:'1px solid var(--c-edge)' }}>
                  {[
                    {k:'present', l:'Present', c:'var(--sage)', bg:'var(--sage-l)'},
                    {k:'absent', l:'Absent', c:'var(--rose)', bg:'var(--rose-l)'},
                  ].map(btn => (
                    <button key={btn.k} onClick={(e)=>{e.stopPropagation();setStudentStatus(s.id,btn.k);}}
                      style={{
                        padding:'6px 12px', fontSize:'11px', fontWeight:700, borderRadius:8, border:'none', cursor:'pointer', transition:'all 0.2s',
                        background: currentStatus===btn.k ? btn.bg : 'transparent',
                        color: currentStatus===btn.k ? btn.c : 'var(--ct3)'
                      }}>
                      {btn.l}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {saved && (
        <div style={{ position:'fixed',bottom:'1.5rem',left:'50%',transform:'translateX(-50%)', padding:'12px 24px',borderRadius:16,background:'var(--sage)',color:'#fff',fontWeight:700,fontSize:'13px', display:'flex',alignItems:'center',gap:8,boxShadow:'0 4px 20px var(--sage-b)',zIndex:40 }}>
          <CheckCircle2 size={16}/> Attendance saved!
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
