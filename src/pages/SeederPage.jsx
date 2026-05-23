import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';

// Secondary Auth instance to avoid logging out the current user
const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
const secondaryAuth = getAuth(secondaryApp);

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

export default function SeederPage() {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  const addLog = (msg) => setLog((prev) => [...prev, msg]);

  const runSeed = async () => {
    setRunning(true);
    setLog([]);
    addLog('Starting Seeding Process for Section C...');

    try {
      // 1. Seed Teachers
      for (const t of TEACHERS) {
        addLog(`Creating teacher: ${t.email}`);
        try {
          const cred = await createUserWithEmailAndPassword(secondaryAuth, t.email, t.pass);
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
          addLog(`✅ Successfully created teacher ${t.name} and mapped to Section C.`);
        } catch (err) {
          if (err.code === 'auth/email-already-in-use') {
            addLog(`⚠️ Teacher ${t.email} already exists.`);
          } else {
            addLog(`❌ Error creating ${t.email}: ${err.message}`);
          }
        }
      }

      // 2. Seed Students
      addLog(`Creating ${STUDENTS.length} students for ISE Dept - 4th Sem - Section C...`);
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
      addLog(`✅ Successfully created ${studentCount} students.`);

      addLog('🎉 Seeding Complete! The Engineering College Matrix for Section C is ready.');

    } catch (err) {
      addLog(`❌ Fatal Error during seeding: ${err.message}`);
    } finally {
      setRunning(false);
      secondaryAuth.signOut();
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Section C Data Seeder</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--ct2)' }}>
        This script will generate 8 teacher accounts based on the provided timetable, link them to the ISE Dept, 4th Semester, Section C, and seed all 62 students centrally into the database without duplication.
      </p>
      
      <button 
        onClick={runSeed} 
        disabled={running}
        style={{ 
          background: 'var(--primary)', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: 8, 
          fontWeight: 800,
          border: 'none',
          cursor: running ? 'not-allowed' : 'pointer'
        }}>
        {running ? 'Seeding in progress...' : 'Execute Seed Script'}
      </button>

      <div style={{ marginTop: '2rem', background: '#1e293b', color: '#38bdf8', padding: '1rem', borderRadius: 8, height: 400, overflowY: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
        {log.map((l, i) => (
          <div key={i} style={{ marginBottom: 4 }}>{l}</div>
        ))}
        {log.length === 0 && <div style={{ color: '#64748b' }}>Waiting for execution...</div>}
      </div>
    </div>
  );
}
