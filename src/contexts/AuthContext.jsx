import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

// Hardcoded admin email — change this to your desired admin account
const ADMIN_EMAIL = 'admin@ts2.edu';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch teacher profile from Firestore
        const ref = doc(db, 'teachers', firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserProfile(snap.data());
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, profileData) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Save teacher profile to Firestore
    await setDoc(doc(db, 'teachers', cred.user.uid), {
      ...profileData,
      email,
      uid: cred.user.uid,
      role: 'teacher',
      createdAt: serverTimestamp(),
    });
    setUserProfile({ ...profileData, email, role: 'teacher' });
    return cred;
  };

  const logout = () => signOut(auth);

  const isAdmin = user?.email === ADMIN_EMAIL || userProfile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout, isAdmin, ADMIN_EMAIL }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
