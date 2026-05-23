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
  { name: 'Prof. Chaitra A C', email: 'chaitra@gmail.com', pass: 'chaitra789', subCode: '23IST401', subName: 'PD & SM' },
  { name: 'Prof. Chethan K B H', email: 'chethan@gmail.com', pass: 'chethan789', subCode: '23IST402', subName: 'DAA' },
  { name: 'Dr. Ranjith J', email: 'ranjith@gmail.com', pass: 'ranjith789', subCode: '23ISI403', subName: 'CN' },
  { name: 'Dr. Siddanna S R', email: 'siddanna@gmail.com', pass: 'siddanna789', subCode: '23ISI404', subName: 'OS' },
  { name: 'Prof. Chethan Lab', email: 'chethanlab@gmail.com', pass: 'chethanlab789', subCode: '23ISL405', subName: 'Daa Lab' },
  { name: 'Prof. Veeresh K M', email: 'veeresh@gmail.com', pass: 'veeresh789', subCode: '23ISE421', subName: 'CSCL' },
  { name: 'Prof. Madhusudhan', email: 'madhusudhan@gmail.com', pass: 'madhusudhan789', subCode: '23SFHH06', subName: 'BIO' },
  { name: 'Prof. Prathima K M', email: 'prathima@gmail.com', pass: 'prathima789', subCode: '23ISAE41', subName: 'Java' },
  { name: 'Prof. Prathima PE', email: 'prathimape@gmail.com', pass: 'prathimape789', subCode: '23PASN01', subName: 'PE' },
  { name: 'Prof. Yamuna U', email: 'yamuna@gmail.com', pass: 'yamuna789', subCode: '23YOGN02', subName: 'Yoga' },
  { name: 'Prof. Abhinand B V', email: 'abhinand@gmail.com', pass: 'abhinand789', subCode: '23NSSN03', subName: 'NSS' },
  { name: 'Prof. Kumar G M', email: 'kumar@gmail.com', pass: 'kumar789', subCode: '23NCCN04', subName: 'NCC' },
  { name: 'Prof. Kusuma C', email: 'kusuma@gmail.com', pass: 'kusuma789', subCode: '23IKSN05', subName: 'IKS' },
];

const STUDENTS = [
  { name: 'Nidhi S Kumar', usn: '1JB23IS102' },
  { name: 'Abhijith D', usn: '1JB24IS002' },
  { name: 'Adarsh Khangaonkar', usn: '1JB24IS003' },
  { name: 'Adithi N', usn: '1JB24IS004' },
  { name: 'Aditi Amol Naik', usn: '1JB24IS005' },
  { name: 'Aditya Patil', usn: '1JB24IS006' },
  { name: 'Aishwarya B S', usn: '1JB24IS007' },
  { name: 'Akash J Shetty', usn: '1JB24IS008' },
  { name: 'Akash Naik', usn: '1JB24IS009' },
  { name: 'Amrutha M M', usn: '1JB24IS011' },
  { name: 'Ananya Patil', usn: '1JB24IS012' },
  { name: 'Anirudh C J', usn: '1JB24IS013' },
  { name: 'Anjan J', usn: '1JB24IS014' },
  { name: 'Ankitha Poojari', usn: '1JB24IS015' },
  { name: 'Ashika', usn: '1JB24IS016' },
  { name: 'Asmit Singh', usn: '1JB24IS017' },
  { name: 'Avtar Kumar', usn: '1JB24IS018' },
  { name: 'B V Sushank', usn: '1JB24IS019' },
  { name: 'Bhadresh Aradhya S G', usn: '1JB24IS020' },
  { name: 'Bhavana Goel', usn: '1JB24IS021' },
  { name: 'Bhoomika H V', usn: '1JB24IS023' },
  { name: 'Brunda H M', usn: '1JB24IS024' },
  { name: 'C D Hamsashree', usn: '1JB24IS025' },
  { name: 'C K Renu Sharvari', usn: '1JB24IS026' },
  { name: 'Challa Nandhini', usn: '1JB24IS027' },
  { name: 'Chandan K', usn: '1JB24IS028' },
  { name: 'Chandana G N', usn: '1JB24IS029' },
  { name: 'Chandana M', usn: '1JB24IS030' },
  { name: 'Chaya R', usn: '1JB24IS031' },
  { name: 'Chinmayi L D', usn: '1JB24IS032' },
  { name: 'Chirag Arvind', usn: '1JB24IS033' },
  { name: 'Chirag Suchethan S', usn: '1JB24IS034' },
  { name: 'Chiranth B S', usn: '1JB24IS036' },
  { name: 'Chiranth L G', usn: '1JB24IS037' },
  { name: 'D Rajendra', usn: '1JB24IS039' },
  { name: 'Darshan K', usn: '1JB24IS040' },
  { name: 'Deeksha Patil Kulkarni', usn: '1JB24IS041' },
  { name: 'Deeksha J', usn: '1JB24IS042' },
  { name: 'Deekshitha J A', usn: '1JB24IS043' },
  { name: 'Dhanush Murthy N', usn: '1JB24IS045' },
  { name: 'Dharmendar B', usn: '1JB24IS046' },
  { name: 'Dhruva K', usn: '1JB24IS047' },
  { name: 'Dimpana P', usn: '1JB24IS048' },
  { name: 'Divya K', usn: '1JB24IS049' },
  { name: 'Divya V Hosapattan', usn: '1JB24IS050' },
  { name: 'Drushya Gowda K M', usn: '1JB24IS051' },
  { name: 'DurgaShree D', usn: '1JB24IS052' },
  { name: 'Eshwari Tirupati Hubballi', usn: '1JB24IS053' },
  { name: 'Ganesh J', usn: '1JB24IS054' },
  { name: 'Gowtham C', usn: '1JB24IS056' },
  { name: 'H N Srinivas Gowda', usn: '1JB24IS057' },
  { name: 'H Samarth', usn: '1JB24IS058' },
  { name: 'Harsha M', usn: '1JB24IS059' },
  { name: 'Harshavardhan Reddy K', usn: '1JB24IS060' },
  { name: 'Harshini V Kumar', usn: '1JB24IS061' },
  { name: 'Harshit Rai', usn: '1JB24IS062' },
  { name: 'Bindu', usn: '1JB25IS402' },
  { name: 'Chethan R H', usn: '1JB25IS403' },
  { name: 'Chinmayee S', usn: '1JB25IS404' }
];

async function runSeed() {
  console.log('Starting Seeding Process for Section A...');
  try {
    // 1. Seed Teachers
    for (const t of TEACHERS) {
      console.log(`Creating teacher: ${t.email}`);
      try {
        const cred = await createUserWithEmailAndPassword(auth, t.email, t.pass);
        await setDoc(doc(db, 'teachers', cred.user.uid), {
          email: t.email,
          role: 'teacher',
          teacherName: t.name,
          department: 'ISE Dept',
          semester: '4th Sem',
          section: 'A',
          subjectCode: t.subCode,
          subjectName: t.subName,
          firstTimeSetupComplete: false,
          isDemoAccount: true,
          createdAt: serverTimestamp()
        });
        console.log(`✅ Successfully created teacher ${t.name} and mapped to Section A.`);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          console.log(`⚠️ Teacher ${t.email} already exists.`);
        } else {
          console.log(`❌ Error creating ${t.email}: ${err.message}`);
        }
      }
    }

    // 2. Seed Students
    console.log(`Creating ${STUDENTS.length} students for ISE Dept - 4th Sem - Section A...`);
    let studentCount = 0;
    for (const s of STUDENTS) {
      await addDoc(collection(db, 'students'), {
        name: s.name,
        rollNo: s.usn,
        department: 'ISE Dept',
        semester: '4th Sem',
        section: 'A',
        createdAt: serverTimestamp()
      });
      studentCount++;
    }
    console.log(`✅ Successfully created ${studentCount} students.`);
    console.log('🎉 Seeding Complete! The Engineering College Matrix for Section A is ready.');

  } catch (err) {
    console.log(`❌ Fatal Error during seeding: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

runSeed();
