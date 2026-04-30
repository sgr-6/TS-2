import React, { useState } from 'react';
import { useStudents, useAllAttendance } from '../hooks/useFirestore';
import { UserPlus, Pencil, Trash2, X, Check, Search, Users, Flame } from 'lucide-react';

function StudentModal({ student, onClose, onSave }) {
  const [name, setName] = useState(student?.name || '');
  const [rollNo, setRollNo] = useState(student?.rollNo || '');
  const [cls, setCls] = useState(student?.class || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim() || !cls.trim()) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), rollNo: rollNo.trim(), class: cls.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl"
            style={{ color: '#64748b', background: 'rgba(99,102,241,0.08)', border: 'none', cursor: 'pointer', minHeight: '44px', minWidth: '44px' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            className="mb-4 px-3 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Full Name</label>
            <input
              id="student-name-input"
              className="input"
              placeholder="e.g. Arjun Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Roll Number</label>
            <input
              id="student-rollno-input"
              className="input"
              placeholder="e.g. 2024001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Class / Section</label>
            <input
              id="student-class-input"
              className="input"
              placeholder="e.g. 10-A"
              value={cls}
              onChange={(e) => setCls(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              id="save-student-btn"
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving}
            >
              {saving ? 'Saving...' : <><Check size={16} /> {student ? 'Save Changes' : 'Add Student'}</>}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { records } = useAllAttendance();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Compute streaks
  const studentStreaks = React.useMemo(() => {
    const streaks = {};
    if (!records || !students) return streaks;
    
    // Group records by student
    const studentRecords = {};
    records.forEach(r => {
      if (!studentRecords[r.studentId]) studentRecords[r.studentId] = [];
      studentRecords[r.studentId].push(r);
    });

    students.forEach(s => {
      let streak = 0;
      if (studentRecords[s.id]) {
        // Sort descending by date
        const sorted = studentRecords[s.id].sort((a, b) => new Date(b.date) - new Date(a.date));
        for (let r of sorted) {
          if (r.status === 'present') streak++;
          else break; // Streak broken
        }
      }
      streaks[s.id] = streak;
    });
    return streaks;
  }, [records, students]);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.class?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setEditTarget(null); setShowModal(true); }
  function openEdit(s) { setEditTarget(s); setShowModal(true); }

  async function handleDelete(id) {
    if (!window.confirm('Delete this student? Their attendance records will remain.')) return;
    setDeletingId(id);
    try { await deleteStudent(id); } finally { setDeletingId(null); }
  }

  async function handleSave(data) {
    if (editTarget) return updateStudent(editTarget.id, data);
    return addStudent(data);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Students</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={openAdd}>
          <UserPlus size={18} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
        <input
          id="student-search"
          className="input pl-10"
          placeholder="Search by name, roll number, or class…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass-card p-8 text-center text-sm" style={{ color: '#475569' }}>Loading students…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users size={40} className="mx-auto mb-3" style={{ color: '#334155' }} />
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>
            {search ? 'No students match your search.' : 'No students yet. Add your first student!'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Streak</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: '#475569' }}>{i + 1}</td>
                  <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ color: '#94a3b8' }}>{s.rollNo}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
                      {s.class}
                    </span>
                  </td>
                  <td>
                    {studentStreaks[s.id] > 0 ? (
                      <span className="badge flex items-center gap-1" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', width: 'fit-content' }}>
                        <Flame size={14} /> {studentStreaks[s.id]}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: '#64748b' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.375rem 0.75rem', minHeight: '36px', fontSize: '0.75rem' }}
                        onClick={() => openEdit(s)}
                        aria-label="Edit student"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.375rem 0.75rem', minHeight: '36px', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        aria-label="Delete student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <StudentModal
          student={editTarget}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
