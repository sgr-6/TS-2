import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

// Hardcoded admin email
const ADMIN_EMAIL = 'admin@gmail.com';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeClassIndex, setActiveClassIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref = doc(db, 'teachers', firebaseUser.uid);
        const snap = await getDoc(ref);
        
        let profile = null;
        if (snap.exists()) {
          profile = snap.data();
          const isMasterAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          const isHODMaster = firebaseUser.email?.toLowerCase() === 'hodise@gmail.com';
          
          if (isMasterAdmin && profile.role !== 'admin') {
            profile.role = 'admin';
            profile.firstTimeSetupComplete = true;
            await updateDoc(ref, { role: 'admin', firstTimeSetupComplete: true });
          } else if (isHODMaster && profile.role !== 'hod') {
            profile.role = 'hod';
            profile.department = 'ISE Dept';
            profile.firstTimeSetupComplete = true;
            await updateDoc(ref, { role: 'hod', department: 'ISE Dept', firstTimeSetupComplete: true });
          }
        } else {
          // Auto-seed if it's the master admin or a provisioned user logging in for the first time
          const isMasterAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          const isHODMaster = firebaseUser.email?.toLowerCase() === 'hodise@gmail.com';
          
          profile = {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            role: isMasterAdmin ? 'admin' : (isHODMaster ? 'hod' : 'teacher'),
            department: isHODMaster ? 'ISE Dept' : (isMasterAdmin ? 'Admin' : ''),
            firstTimeSetupComplete: isMasterAdmin || isHODMaster,
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, profile);
        }
        setUserProfile(profile);
        setActiveClassIndex(0);
      } else {
        setUserProfile(null);
        setActiveClassIndex(0);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const activeClass = userProfile?.classes ? userProfile.classes[activeClassIndex] : null;

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const updateUserPassword = (newPassword) => {
    if (user) return updatePassword(user, newPassword);
    return Promise.reject(new Error("No user logged in"));
  };

  const updateUserEmail = (newEmail) => {
    if (user) return updateEmail(user, newEmail);
    return Promise.reject(new Error("No user logged in"));
  };

  const completeFirstTimeSetup = async (data) => {
    if (!user) return;
    const ref = doc(db, 'teachers', user.uid);
    const updates = { ...data, firstTimeSetupComplete: true };
    await updateDoc(ref, updates);
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'teachers', user.uid));
      await deleteUser(user);
    } catch (err) {
      throw err;
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isHOD = userProfile?.role === 'hod';

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      activeClass,
      activeClassIndex,
      setActiveClassIndex,
      loading,
      login,
      logout,
      resetPassword,
      updateUserPassword,
      updateUserEmail,
      completeFirstTimeSetup,
      deleteAccount,
      isAdmin,
      isHOD,
      ADMIN_EMAIL
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
