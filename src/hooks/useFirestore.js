import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/* ── Real-time students (filtered by current teacher) ── */
export function useStudents() {
  const { user, userProfile, activeClass } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const department = userProfile?.department;
    const semester = activeClass ? activeClass.semester : userProfile?.semester;
    const section = activeClass ? activeClass.section : userProfile?.section;

    if (!user || !department || !semester || !section) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'students'), 
      where('department', '==', department),
      where('semester', '==', semester),
      where('section', '==', section)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));
      setStudents(data);
      setLoading(false);
    });
    return unsub;
  }, [user, userProfile, activeClass]);

  const addStudent = (data) =>
    addDoc(collection(db, 'students'), { ...data, createdAt: serverTimestamp() });

  const updateStudent = (id, data) => updateDoc(doc(db, 'students', id), data);

  const deleteStudent = (id) => deleteDoc(doc(db, 'students', id));

  return { students, loading, addStudent, updateStudent, deleteStudent };
}

/* ── Detailed Attendance for a Single Student across all Subjects ── */
export function useStudentDetailedAttendance(studentId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, [studentId]);

  return { records, loading };
}

/* ── All students (admin only) ── */
export function useAllStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || ''));
      setStudents(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { students, loading };
}

/* ── All teachers (admin only) ── */
export function useAllTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'teachers'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeachers(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { teachers, loading };
}

/* ── Real-time attendance for a specific date (current teacher) ── */
export function useAttendanceForDate(date, classId) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date || !user) { setLoading(false); return; }
    
    let q = query(collection(db, 'attendance'), where('userId', '==', user.uid), where('date', '==', date));
    if (classId) {
      q = query(collection(db, 'attendance'), where('userId', '==', user.uid), where('date', '==', date), where('classId', '==', classId));
    }

    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [date, user, classId]);

  return { records, loading };
}

/* ── Save attendance (upsert by date+studentId+userId) ── */
export async function saveAttendance(date, studentId, status, userId, teacherName = 'Teacher', subject = 'Unknown Subject', classId = 'Unknown Class') {
  const q = query(
    collection(db, 'attendance'),
    where('userId', '==', userId),
    where('date', '==', date),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(collection(db, 'attendance'), { date, studentId, status, userId, subject, classId, updatedAt: serverTimestamp() });
    await addAuditLog(`Marked attendance as ${status.toUpperCase()} for student ${studentId}`, userId, teacherName);
  } else {
    const docData = snap.docs[0].data();
    if (docData.status !== status) {
      await updateDoc(doc(db, 'attendance', snap.docs[0].id), { status, subject, classId, updatedAt: serverTimestamp() });
      await addAuditLog(`Changed attendance from ${docData.status.toUpperCase()} to ${status.toUpperCase()} for student ${studentId}`, userId, teacherName);
    }
  }
}

export async function addAuditLog(action, userId, teacherName) {
  try {
    await addDoc(collection(db, 'audits'), { action, userId, teacherName, timestamp: serverTimestamp() });
  } catch (err) {
    console.error('Failed to add audit log:', err);
  }
}

export function useAuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'audits'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setLogs(data);
    });
    return unsub;
  }, [user]);
  
  return { logs };
}

export function useAllEvents() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'audits'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setEvents(data);
    });
    return unsub;
  }, []);
  
  return { events };
}

/* ── All attendance records for current teacher ── */
export function useAllAttendance(classId) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let q = query(collection(db, 'attendance'), where('userId', '==', user.uid));
    if (classId) {
      q = query(collection(db, 'attendance'), where('userId', '==', user.uid), where('classId', '==', classId));
    }

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, [user, classId]);

  return { records, loading };
}

/* ── All attendance records across all teachers (admin only) ── */
export function useAdminAllAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'attendance'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { records, loading };
}
