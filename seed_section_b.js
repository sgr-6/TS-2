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
  { name: 'Prof. Pradeep D R', email: 'pradeep@gmail.com', pass: 'pradeep789', subCode: '23IST401', subName: 'PD & SM' },
  { name: 'Prof. Nandhini N', email: 'nandhini@gmail.com', pass: 'nandhini789', subCode: '23IST402', subName: 'DAA' },
  { name: 'Prof. Kusuma C', email: 'kusuma_b@gmail.com', pass: 'kusumab789', subCode: '23ISI403', subName: 'CN' },
  { name: 'Prof. Kiran K V', email: 'kiran@gmail.com', pass: 'kiran789', subCode: '23ISI404', subName: 'OS' },
  { name: 'Prof. Nandhini Lab', email: 'nandhinilab@gmail.com', pass: 'nandhinilab789', subCode: '23ISL405', subName: 'Daa Lab Using Java' },
  { name: 'Dr. Manu M N', email: 'manu@gmail.com', pass: 'manu789', subCode: '23ISE421/23ISE422', subName: 'CSCL/BIA' },
  { name: 'Prof. Madhusudhan B', email: 'madhusudhan_b@gmail.com', pass: 'madhusudhanb789', subCode: '23SFHH06', subName: 'BIO' },
  { name: 'Dr. Siddanna S R B', email: 'siddanna_b@gmail.com', pass: 'siddannab789', subCode: '23ISAE41', subName: 'Java Programming' },
];

const STUDENTS = [
  { name: 'Harshith Babu B M', usn: '1JB24IS063' },
  { name: 'Hemalatha R', usn: '1JB24IS064' },
  { name: 'Hemanth U', usn: '1JB24IS065' },
  { name: 'Hemanthkumar K S', usn: '1JB24IS066' },
  { name: 'Hitesh J', usn: '1JB24IS067' },
  { name: 'Hithaishi C R', usn: '1JB24IS068' },
  { name: 'Hithesh Singh B', usn: '1JB24IS069' },
  { name: 'Honnagondanahalli Nagaraju Chethan', usn: '1JB24IS070' },
  { name: 'Jahnavi Reddy', usn: '1JB24IS071' },
  { name: 'Jahnvi R Kharvi', usn: '1JB24IS072' },
  { name: 'Jashwanth M', usn: '1JB24IS073' },
  { name: 'K Shanmukha', usn: '1JB24IS075' },
  { name: 'Karan V', usn: '1JB24IS076' },
  { name: 'Karthik Kumar A M', usn: '1JB24IS077' },
  { name: 'Kaustubh G', usn: '1JB24IS078' },
  { name: 'Kavana H J', usn: '1JB24IS079' },
  { name: 'Kavana V', usn: '1JB24IS080' },
  { name: 'Keerthi Tukaram', usn: '1JB24IS081' },
  { name: 'Keshav Savanth S', usn: '1JB24IS082' },
  { name: 'Kishan Jaya Krishna C V', usn: '1JB24IS083' },
  { name: 'Kruthi U', usn: '1JB24IS084' },
  { name: 'Kusuma C N', usn: '1JB24IS085' },
  { name: 'Lekhashree R', usn: '1JB24IS086' },
  { name: 'Likhita L', usn: '1JB24IS087' },
  { name: 'Likitha B S', usn: '1JB24IS088' },
  { name: 'Lisha R Shankar', usn: '1JB24IS089' },
  { name: 'M Nirmala', usn: '1JB24IS090' },
  { name: 'Mamatha M', usn: '1JB24IS091' },
  { name: 'Manoj S Patil', usn: '1JB24IS092' },
  { name: 'Mitra Harsha', usn: '1JB24IS093' },
  { name: 'Modakapriya S P', usn: '1JB24IS094' },
  { name: 'Mohammed Huzaif Ulla', usn: '1JB24IS095' },
  { name: 'Monika S', usn: '1JB24IS096' },
  { name: 'Monisha B', usn: '1JB24IS097' },
  { name: 'Monisha B R', usn: '1JB24IS098' },
  { name: 'N G Chethana', usn: '1JB24IS099' },
  { name: 'Nagaveni R', usn: '1JB24IS100' },
  { name: 'Nandini N B', usn: '1JB24IS101' },
  { name: 'Narasimha', usn: '1JB24IS102' },
  { name: 'Nethravathi', usn: '1JB24IS103' },
  { name: 'Nikhil K', usn: '1JB24IS104' },
  { name: 'Nirbhay Udaykumar Patil', usn: '1JB24IS105' },
  { name: 'Pavan C K', usn: '1JB24IS106' },
  { name: 'Pavan Gowda T J', usn: '1JB24IS107' },
  { name: 'Pavan Raj N', usn: '1JB24IS108' },
  { name: 'Pradyumna M', usn: '1JB24IS109' },
  { name: 'Pranav Singh', usn: '1JB24IS111' },
  { name: 'Praneel C Kulkarni', usn: '1JB24IS112' },
  { name: 'Praveen R', usn: '1JB24IS113' },
  { name: 'Praveena G R', usn: '1JB24IS114' },
  { name: 'Priya Padmakar Diwate', usn: '1JB24IS115' },
  { name: 'Purvika M', usn: '1JB24IS116' },
  { name: 'Pushpalatha N', usn: '1JB24IS117' },
  { name: 'Rachana R', usn: '1JB24IS118' },
  { name: 'Racheta V P', usn: '1JB24IS119' },
  { name: 'Raj Singh', usn: '1JB24IS120' },
  { name: 'Rajath L D', usn: '1JB24IS121' },
  { name: 'Rakesh K M', usn: '1JB24IS122' },
  { name: 'Ram Charan N', usn: '1JB24IS123' },
  { name: 'Rathan Aravind R K', usn: '1JB24IS124' },
  { name: 'Kavya B M', usn: '1JB25IS406' },
  { name: 'Mohammed Sahil', usn: '1JB25IS408' },
  { name: 'N R Pareekshith', usn: '1JB25IS409' },
  { name: 'Pavan P', usn: '1JB25IS410' },
  { name: 'Prajwal G', usn: '1JB25IS411' },
  { name: 'Rajesh K S', usn: '1JB25IS413' }
];

async function runSeed() {
  console.log('Starting Seeding Process for Section B...');
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
          section: 'B',
          subjectCode: t.subCode,
          subjectName: t.subName,
          firstTimeSetupComplete: false,
          isDemoAccount: true,
          createdAt: serverTimestamp()
        });
        console.log(`✅ Successfully created teacher ${t.name} and mapped to Section B.`);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          console.log(`⚠️ Teacher ${t.email} already exists.`);
        } else {
          console.log(`❌ Error creating ${t.email}: ${err.message}`);
        }
      }
    }

    // 2. Seed Students
    console.log(`Creating ${STUDENTS.length} students for ISE Dept - 4th Sem - Section B...`);
    let studentCount = 0;
    for (const s of STUDENTS) {
      await addDoc(collection(db, 'students'), {
        name: s.name,
        rollNo: s.usn,
        department: 'ISE Dept',
        semester: '4th Sem',
        section: 'B',
        createdAt: serverTimestamp()
      });
      studentCount++;
    }
    console.log(`✅ Successfully created ${studentCount} students.`);
    console.log('🎉 Seeding Complete! The Engineering College Matrix for Section B is ready.');

  } catch (err) {
    console.log(`❌ Fatal Error during seeding: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

runSeed();
