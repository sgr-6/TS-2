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
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/* ── Real-time students ── */
export function useStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'students'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort client-side to avoid Firestore index requirements
      data.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const addStudent = (data) =>
    addDoc(collection(db, 'students'), { ...data, userId: user.uid, createdAt: serverTimestamp() });

  const updateStudent = (id, data) => updateDoc(doc(db, 'students', id), data);

  const deleteStudent = (id) => deleteDoc(doc(db, 'students', id));

  return { students, loading, addStudent, updateStudent, deleteStudent };
}

/* ── Real-time attendance for a specific date ── */
export function useAttendanceForDate(date) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date || !user) { setLoading(false); return; }
    const q = query(collection(db, 'attendance'), where('userId', '==', user.uid), where('date', '==', date));
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [date, user]);

  return { records, loading };
}

/* ── Save attendance (upsert by date+studentId+userId) ── */
export async function saveAttendance(date, studentId, status, userId) {
  const q = query(
    collection(db, 'attendance'),
    where('userId', '==', userId),
    where('date', '==', date),
    where('studentId', '==', studentId)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    await addDoc(collection(db, 'attendance'), { date, studentId, status, userId, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(doc(db, 'attendance', snap.docs[0].id), { status, updatedAt: serverTimestamp() });
  }
}

/* ── All attendance records (for reports) ── */
export function useAllAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'attendance'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort desc client-side to avoid index requirements
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { records, loading };
}
