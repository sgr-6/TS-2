import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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

const TEACHERS = [
  // Combined Teachers
  {
    name: 'Prof. Chethan K B H',
    email: 'chethan@gmail.com',
    pass: 'chethan789',
    classes: [
      { semester: '4th Sem', section: 'A', subjectCode: '23IST402', subjectName: 'DAA' },
      { semester: '4th Sem', section: 'A', subjectCode: '23ISL405', subjectName: 'Daa Lab' }
    ]
  },
  {
    name: 'Prof. Prathima K M',
    email: 'prathima@gmail.com',
    pass: 'prathima789',
    classes: [
      { semester: '4th Sem', section: 'A', subjectCode: '23ISAE41', subjectName: 'Java Programming' },
      { semester: '4th Sem', section: 'A', subjectCode: '23PASN01', subjectName: 'PE' }
    ]
  },
  {
    name: 'Prof. Nandhini N',
    email: 'nandhini@gmail.com',
    pass: 'nandhini789',
    classes: [
      { semester: '4th Sem', section: 'B', subjectCode: '23IST402', subjectName: 'DAA' },
      { semester: '4th Sem', section: 'B', subjectCode: '23ISL405', subjectName: 'Daa Lab Using Java' }
    ]
  },
  {
    name: 'Prof. Shivani K',
    email: 'shivani@gmail.com',
    pass: 'shivani789',
    classes: [
      { semester: '4th Sem', section: 'C', subjectCode: '23IST402', subjectName: 'DAA' },
      { semester: '4th Sem', section: 'C', subjectCode: '23ISL405', subjectName: 'Daa Lab' }
    ]
  },
  {
    name: 'Prof. Kusuma C',
    email: 'kusuma@gmail.com',
    pass: 'kusuma789',
    classes: [
      { semester: '4th Sem', section: 'A', subjectCode: '23AEC45', subjectName: 'AEC' },
      { semester: '4th Sem', section: 'B', subjectCode: '23ISI403', subjectName: 'CN' }
    ]
  },
  {
    name: 'Prof. Madhusudhan B',
    email: 'madhusudhan@gmail.com',
    pass: 'madhusudhan789',
    classes: [
      { semester: '4th Sem', section: 'A', subjectCode: '23SFHH06', subjectName: 'BIO' },
      { semester: '4th Sem', section: 'B', subjectCode: '23SFHH06', subjectName: 'BIO' },
      { semester: '4th Sem', section: 'C', subjectCode: '23SFHH06', subjectName: 'BIO' }
    ]
  },
  {
    name: 'Dr. Siddanna S R',
    email: 'siddanna@gmail.com',
    pass: 'siddanna789',
    classes: [
      { semester: '4th Sem', section: 'A', subjectCode: '23ISI404', subjectName: 'OS' },
      { semester: '4th Sem', section: 'B', subjectCode: '23ISAE41', subjectName: 'Java Programming' }
    ]
  },
  // Single Class Teachers - Section A
  { name: 'Prof. Chaitra A C', email: 'chaitra@gmail.com', pass: 'chaitra789', classes: [{ semester: '4th Sem', section: 'A', subjectCode: '23IST401', subjectName: 'PD&SM' }] },
  { name: 'Dr. Ranjith J', email: 'ranjith@gmail.com', pass: 'ranjith789', classes: [{ semester: '4th Sem', section: 'A', subjectCode: '23ISI403', subjectName: 'CN' }] },
  { name: 'Prof. Veeresh K M', email: 'veeresh@gmail.com', pass: 'veeresh789', classes: [{ semester: '4th Sem', section: 'A', subjectCode: '23ISE421/422', subjectName: 'CSCL/BIA' }] },
  { name: 'Prof. Yamuna U', email: 'yamuna@gmail.com', pass: 'yamuna789', classes: [{ semester: '4th Sem', section: 'A', subjectCode: '23UHV402', subjectName: 'UHV' }] },
  { name: 'Prof. Abhinand B V', email: 'abhinand@gmail.com', pass: 'abhinand789', classes: [{ semester: '4th Sem', section: 'A', subjectCode: '23SCR44', subjectName: 'SCR' }] },
  { name: 'Prof. Kumar G M', email: 'kumar@gmail.com', pass: 'kumar789', classes: [{ semester: '4th Sem', section: 'A', subjectCode: '23KSS43/23KBK43', subjectName: 'KS/KB' }] },
  // Single Class Teachers - Section B
  { name: 'Prof. Pradeep D R', email: 'pradeep@gmail.com', pass: 'pradeep789', classes: [{ semester: '4th Sem', section: 'B', subjectCode: '23IST401', subjectName: 'PD & SM' }] },
  { name: 'Prof. Kiran K V', email: 'kiran@gmail.com', pass: 'kiran789', classes: [{ semester: '4th Sem', section: 'B', subjectCode: '23ISI404', subjectName: 'OS' }] },
  { name: 'Dr. Manu M N', email: 'manu@gmail.com', pass: 'manu789', classes: [{ semester: '4th Sem', section: 'B', subjectCode: '23ISE421/23ISE422', subjectName: 'CSCL/BIA' }] },
  // Single Class Teachers - Section C
  { name: 'Prof. Prarthana', email: 'prarthana@gmail.com', pass: 'prarthana789', classes: [{ semester: '4th Sem', section: 'C', subjectCode: '23IST401', subjectName: 'PD&SM' }] },
  { name: 'Prof. Appi Sagar', email: 'appisagar25@gmail.com', pass: 'appisagar25789', classes: [{ semester: '4th Sem', section: 'C', subjectCode: '23ISI403', subjectName: 'CN' }] },
  { name: 'Prof. Gopalakrishna M', email: 'gopalkrishna@gmail.com', pass: 'gopalkrishna789', classes: [{ semester: '4th Sem', section: 'C', subjectCode: '23ISI404', subjectName: 'OS' }] },
  { name: 'Prof. Sagar S', email: 'sagar@gmail.com', pass: 'sagar789', classes: [{ semester: '4th Sem', section: 'C', subjectCode: '23ISE421/422', subjectName: 'CSCL / BIA' }] },
  { name: 'Prof. Pushpalatha', email: 'pushpa@gmail.com', pass: 'pushpa789', classes: [{ semester: '4th Sem', section: 'C', subjectCode: '23ISAE41', subjectName: 'Java' }] },
];

async function runCombinedSeed() {
  console.log('Starting Combined Seeding Process...');
  try {
    let tCount = 0;
    for (const t of TEACHERS) {
      console.log(`Creating combined teacher: ${t.email}`);
      try {
        const cred = await createUserWithEmailAndPassword(auth, t.email, t.pass);
        await setDoc(doc(db, 'teachers', cred.user.uid), {
          email: t.email,
          role: 'teacher',
          teacherName: t.name,
          department: 'ISE Dept',
          classes: t.classes, // Array of classes
          firstTimeSetupComplete: false,
          isDemoAccount: true,
          createdAt: serverTimestamp()
        });
        console.log(`✅ Successfully created teacher ${t.name} with ${t.classes.length} classes.`);
        tCount++;
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          console.log(`⚠️ Teacher ${t.email} already exists.`);
        } else {
          console.log(`❌ Error creating ${t.email}: ${err.message}`);
        }
      }
    }
    
    console.log(`🎉 Combined Seeding Complete! Created ${tCount} master teacher accounts.`);
  } catch (err) {
    console.log(`❌ Fatal Error during seeding: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

runCombinedSeed();
