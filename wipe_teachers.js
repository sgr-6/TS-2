import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function wipeTeachers() {
  console.log('Fetching all teachers from Firestore...');
  const snap = await getDocs(collection(db, 'teachers'));
  const teachers = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Found ${teachers.length} teachers. Beginning wipe...`);
  let count = 0;

  for (const t of teachers) {
    if (t.role === 'hod' || t.email.includes('hodise')) {
      console.log(`Skipping HOD: ${t.email}`);
      continue;
    }
    
    console.log(`Processing: ${t.email}`);
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'teachers', t.id));
      console.log(`  - Deleted from Firestore`);

      // 2. Try to login and delete from Auth
      // The passwords for these dummy accounts were created as <name>789 or <emailPrefix>789.
      // We know all the dummy passwords are just the email prefix + 789.
      const prefix = t.email.split('@')[0];
      const pwd = prefix + '789';
      
      try {
        const cred = await signInWithEmailAndPassword(auth, t.email, pwd);
        await deleteUser(cred.user);
        console.log(`  - Deleted from Auth`);
      } catch (authErr) {
        console.log(`  - Failed to delete from Auth (might have changed password): ${authErr.message}`);
      }
      
      count++;
    } catch (err) {
      console.error(`  - Error wiping ${t.email}: ${err.message}`);
    }
  }

  console.log(`✅ Wiped ${count} teachers successfully.`);
  process.exit(0);
}

wipeTeachers();
