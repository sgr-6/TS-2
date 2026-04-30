import React, { useState, useMemo } from 'react';
import { useStudents, useAttendanceForDate, saveAttendance } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';
import { CalendarDays, Save, CheckCircle2, XCircle, Mic, MicOff } from 'lucide-react';

export default function AttendancePage() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { students, loading: studentsLoading } = useStudents();
  const { records, loading: recLoading } = useAttendanceForDate(date);

  // Local override state: { [studentId]: 'present' | 'absent' }
  const [overrides, setOverrides] = useState({});
  const [listening, setListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  // Voice Command Logic
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser. Please use Chrome.');
      return;
    }
    
    if (listening) {
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
      setVoiceFeedback('Listening... Say "Mark [Name] present"');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      let matched = false;
      students.forEach(student => {
        const name = student.name.toLowerCase();
        // check if name is in transcript
        if (transcript.includes(name) || transcript.includes(name.split(' ')[0])) {
          if (transcript.includes('present')) {
            setOverrides(prev => ({ ...prev, [student.id]: 'present' }));
            setVoiceFeedback(`Marked ${student.name} present`);
            matched = true;
          } else if (transcript.includes('absent')) {
            setOverrides(prev => ({ ...prev, [student.id]: 'absent' }));
            setVoiceFeedback(`Marked ${student.name} absent`);
            matched = true;
          }
        }
      });

      if (!matched && (transcript.includes('present') || transcript.includes('absent'))) {
        setVoiceFeedback(`Didn't catch the name. Say again.`);
      }
      setSaved(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setVoiceFeedback('Voice recognition error.');
    };

    recognition.onend = () => {
      setListening(false);
      setTimeout(() => setVoiceFeedback(''), 3000);
    };

    recognition.start();
  };

  // Merge Firestore records with local overrides
  const statusMap = useMemo(() => {
    const map = {};
    records.forEach((r) => { map[r.studentId] = r.status; });
    Object.entries(overrides).forEach(([id, status]) => { map[id] = status; });
    return map;
  }, [records, overrides]);

  const isWeekend = useMemo(() => {
    const d = new Date(date + 'T00:00:00');
    const day = d.getDay();
    return day === 0 || day === 6;
  }, [date]);

  function toggleStudent(id) {
    if (records.some(r => r.studentId === id && r.status === 'absent')) return;
    setOverrides((prev) => ({
      ...prev,
      [id]: (statusMap[id] || 'absent') === 'present' ? 'absent' : 'present',
    }));
    setSaved(false);
  }

  function markAll(status) {
    const newOverrides = {};
    students.forEach((s) => { 
      const isSavedAbsent = records.some(r => r.studentId === s.id && r.status === 'absent');
      if (status === 'present' && isSavedAbsent) {
        // cannot override to present
      } else {
        newOverrides[s.id] = status; 
      }
    });
    setOverrides(newOverrides);
    setSaved(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await Promise.all(
        students.map((s) =>
          saveAttendance(date, s.id, statusMap[s.id] || 'absent', user.uid)
        )
      );
      setOverrides({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const presentCount = students.filter((s) => (statusMap[s.id] || 'absent') === 'present').length;
  const loading = studentsLoading || recLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Mark Attendance</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            {presentCount}/{students.length} present
          </p>
        </div>
        <button
          id="save-attendance-btn"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || students.length === 0 || isWeekend}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                style={{ animation: 'spin 0.6s linear infinite' }} />
              Saving…
            </>
          ) : saved ? (
            <><CheckCircle2 size={18} /> Saved!</>
          ) : (
            <><Save size={18} /> Save Attendance</>
          )}
        </button>
      </div>

      {/* Date Picker & Quick Actions */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <CalendarDays size={18} style={{ color: '#6366f1', flexShrink: 0 }} />
          <input
            id="attendance-date-picker"
            type="date"
            className="input"
            value={date}
            max={today}
            onChange={(e) => { setDate(e.target.value); setOverrides({}); setSaved(false); }}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-secondary flex items-center justify-center"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', minHeight: '44px', background: listening ? 'rgba(239,68,68,0.2)' : undefined, color: listening ? '#f87171' : undefined }}
            onClick={toggleVoice}
            title="Voice Commands"
          >
            {listening ? <Mic size={15} className="animate-pulse" /> : <MicOff size={15} />}
            <span className="hidden sm:inline ml-1">{listening ? 'Listening...' : 'Voice'}</span>
          </button>
          <button
            id="mark-all-present-btn"
            className="btn btn-success"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', minHeight: '44px' }}
            onClick={() => markAll('present')}
            disabled={students.length === 0 || isWeekend}
          >
            <CheckCircle2 size={15} /> All Present
          </button>
          <button
            id="mark-all-absent-btn"
            className="btn btn-danger"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', minHeight: '44px' }}
            onClick={() => markAll('absent')}
            disabled={students.length === 0 || isWeekend}
          >
            <XCircle size={15} /> All Absent
          </button>
        </div>
      </div>
      
      {voiceFeedback && (
        <div className="text-sm font-medium text-center py-2 px-4 rounded-full mx-auto w-fit transition-all" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
          {voiceFeedback}
        </div>
      )}

      {/* Attendance Progress Bar */}
      {students.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex justify-between text-xs mb-2" style={{ color: '#64748b' }}>
            <span>Attendance Progress</span>
            <span>{((presentCount / students.length) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(presentCount / students.length) * 100}%`,
                background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
              }}
            />
          </div>
        </div>
      )}

      {/* Student Toggle List */}
      {isWeekend ? (
        <div className="glass-card p-12 text-center text-sm" style={{ color: '#475569' }}>
          No attendance can be marked on Saturday and Sunday. College works from Monday to Friday.
        </div>
      ) : loading ? (
        <div className="glass-card p-8 text-center text-sm" style={{ color: '#475569' }}>Loading…</div>
      ) : students.length === 0 ? (
        <div className="glass-card p-12 text-center text-sm" style={{ color: '#475569' }}>
          No students found. Add students first.
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s, idx) => {
            const isPresent = (statusMap[s.id] || 'absent') === 'present';
            const isSavedAbsent = records.some(r => r.studentId === s.id && r.status === 'absent');

            return (
              <div
                key={s.id}
                className={`glass-card p-4 flex items-center justify-between gap-4 transition-all duration-200 ${!isSavedAbsent ? 'cursor-pointer' : ''}`}
                style={{
                  animationDelay: `${idx * 0.03}s`,
                  borderColor: isPresent ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.08)',
                  background: isPresent ? 'rgba(16,185,129,0.05)' : 'rgba(30,41,59,0.5)',
                  opacity: isSavedAbsent ? 0.8 : 1,
                }}
                onClick={() => { if (!isSavedAbsent) toggleStudent(s.id); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: isPresent
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(99,102,241,0.1)',
                      color: isPresent ? '#34d399' : '#818cf8',
                    }}
                  >
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#e2e8f0' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      {s.rollNo} · {s.class}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="badge hidden sm:inline-flex"
                    style={{
                      background: isPresent ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                      color: isPresent ? '#34d399' : '#f87171',
                    }}
                  >
                    {isPresent ? 'Present' : 'Absent'}
                  </span>
                  
                  {isSavedAbsent ? (
                    <div className="text-xs font-semibold px-2 py-1 rounded" style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)' }}>
                      Saved Absent
                    </div>
                  ) : (
                    <button
                      className={`toggle ${isPresent ? 'active' : ''}`}
                      role="switch"
                      aria-checked={isPresent}
                      aria-label={`Toggle attendance for ${s.name}`}
                      onClick={(e) => { e.stopPropagation(); toggleStudent(s.id); }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {saved && (
        <div
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 animate-scale-in"
          style={{ background: 'rgba(16,185,129,0.9)', color: 'white', backdropFilter: 'blur(8px)', zIndex: 40, boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
        >
          <CheckCircle2 size={18} /> Attendance saved successfully!
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
