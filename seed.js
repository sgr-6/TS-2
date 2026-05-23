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
  { name: 'Prof. Pushpa S', email: 'pushpa@gmail.com', pass: 'pushpa789', subCode: '23IST401', subName: 'PD & SM' },
  { name: 'Prof. Shivani N', email: 'shivani@gmail.com', pass: 'shivani789', subCode: '23IST402', subName: 'DAA' },
  { name: 'Prof. Nandana K G', email: 'nandana@gmail.com', pass: 'nandana789', subCode: '23ISI403', subName: 'CN' },
  { name: 'Prof. Harshitha M', email: 'harshitha@gmail.com', pass: 'harshitha789', subCode: '23ISI404', subName: 'OS' },
  { name: 'Prof. Shivani', email: 'shivanilab@gmail.com', pass: 'shivanilab789', subCode: '23ISL405', subName: 'DAA Lab Using Java' },
  { name: 'Prof. Prarthana J V', email: 'prarthana@gmail.com', pass: 'prarthana789', subCode: '23ISE421/23ISE422', subName: 'CSCL/BIA' },
  { name: 'Prof. BioTeacher', email: 'bioteacher@gmail.com', pass: 'bioteacher789', subCode: '23SFHH06', subName: 'BIO' },
  { name: 'Dr. Gopalkrishna M T', email: 'gopalkrishna@gmail.com', pass: 'gopalkrishna789', subCode: '23ISAE41', subName: 'Java Programming' },
];

const STUDENTS = [
  { name: 'Tendulkar G', usn: '1JB22IS168' },
  { name: 'Sonu S', usn: '1JB23IS156' },
  { name: 'Reshma', usn: '1JB24IS125' },
  { name: 'Ritu M', usn: '1JB24IS126' },
  { name: 'Rohan K', usn: '1JB24IS127' },
  { name: 'Roopa M G', usn: '1JB24IS128' },
  { name: 'S B Soham Swarna Naik', usn: '1JB24IS129' },
  { name: 'Sagar S', usn: '1JB24IS131' },
  { name: 'Sahana N', usn: '1JB24IS132' },
  { name: 'Samith', usn: '1JB24IS133' },
  { name: 'Sanchita Nagraj Muttur', usn: '1JB24IS134' },
  { name: 'Sandeep T', usn: '1JB24IS135' },
  { name: 'Sanjana M R', usn: '1JB24IS136' },
  { name: 'Sanjay L Naik', usn: '1JB24IS137' },
  { name: 'Sanvi Yogananda', usn: '1JB24IS138' },
  { name: 'Satvik U M', usn: '1JB24IS139' },
  { name: 'Shamanth Gowda R', usn: '1JB24IS140' },
  { name: 'Sharana Basava', usn: '1JB24IS141' },
  { name: 'Sharanya P Bharadwaj', usn: '1JB24IS142' },
  { name: 'Shashank', usn: '1JB24IS143' },
  { name: 'Shridhar', usn: '1JB24IS144' },
  { name: 'Shrinandhini A S', usn: '1JB24IS145' },
  { name: 'Siri D K', usn: '1JB24IS146' },
  { name: 'Sneha', usn: '1JB24IS147' },
  { name: 'Srajana', usn: '1JB24IS148' },
  { name: 'Sridevi R', usn: '1JB24IS149' },
  { name: 'Srujan N', usn: '1JB24IS151' },
  { name: 'Srujana T N', usn: '1JB24IS152' },
  { name: 'Sukanya Nagaraj Banasode', usn: '1JB24IS154' },
  { name: 'Sumedha Bhat', usn: '1JB24IS155' },
  { name: 'Supriya M', usn: '1JB24IS156' },
  { name: 'Sushanth N S', usn: '1JB24IS157' },
  { name: 'Sushma', usn: '1JB24IS158' },
  { name: 'Swathi N', usn: '1JB24IS159' },
  { name: 'Swati Shridhar Hegde', usn: '1JB24IS160' },
  { name: 'Tanush P', usn: '1JB24IS161' },
  { name: 'Thanmayi S R', usn: '1JB24IS163' },
  { name: 'Tharun R', usn: '1JB24IS164' },
  { name: 'Tharun Y K', usn: '1JB24IS165' },
  { name: 'Thejas S', usn: '1JB24IS166' },
  { name: 'Thousif B S', usn: '1JB24IS167' },
  { name: 'Ujwal Kiran Gowda', usn: '1JB24IS168' },
  { name: 'Ullas Gowda A', usn: '1JB24IS169' },
  { name: 'Varsha K P', usn: '1JB24IS170' },
  { name: 'Varshini', usn: '1JB24IS171' },
  { name: 'Varshini G', usn: '1JB24IS172' },
  { name: 'Vinyas D', usn: '1JB24IS175' },
  { name: 'Vishnu Priya V', usn: '1JB24IS176' },
  { name: 'Yashaswini K G', usn: '1JB24IS177' },
  { name: 'Yashavanth V K', usn: '1JB24IS178' },
  { name: 'R Shalini', usn: '1JB25IS412' },
  { name: 'Sahana Alakatti', usn: '1JB25IS414' },
  { name: 'Shiva Prasad V', usn: '1JB25IS415' },
  { name: 'Shreya S', usn: '1JB25IS416' },
  { name: 'Sinchana N', usn: '1JB25IS417' },
  { name: 'Sumit Mokhashi', usn: '1JB25IS418' },
  { name: 'Tejas P', usn: '1JB25IS419' },
  { name: 'Vinayaka Rajesh Guthi', usn: '1JB25IS420' },
  { name: 'Sumedh Walvekar', usn: '1JB25IS421' },
  { name: 'Yashas S', usn: '1JB25IS422' },
  { name: 'Yashwanth R', usn: '1JB25IS423' },
  { name: 'Yogesh S R', usn: '1JB25IS424' }
];

async function runSeed() {
  console.log('Starting Seeding Process for Section C...');
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
          section: 'C',
          subjectCode: t.subCode,
          subjectName: t.subName,
          firstTimeSetupComplete: false,
          isDemoAccount: true,
          createdAt: serverTimestamp()
        });
        console.log(`✅ Successfully created teacher ${t.name} and mapped to Section C.`);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          console.log(`⚠️ Teacher ${t.email} already exists.`);
        } else {
          console.log(`❌ Error creating ${t.email}: ${err.message}`);
        }
      }
    }

    // 2. Seed Students
    console.log(`Creating ${STUDENTS.length} students for ISE Dept - 4th Sem - Section C...`);
    let studentCount = 0;
    for (const s of STUDENTS) {
      await addDoc(collection(db, 'students'), {
        name: s.name,
        rollNo: s.usn,
        department: 'ISE Dept',
        semester: '4th Sem',
        section: 'C',
        createdAt: serverTimestamp()
      });
      studentCount++;
    }
    console.log(`✅ Successfully created ${studentCount} students.`);
    console.log('🎉 Seeding Complete! The Engineering College Matrix for Section C is ready.');

  } catch (err) {
    console.log(`❌ Fatal Error during seeding: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

runSeed();
