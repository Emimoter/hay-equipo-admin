const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function list() {
  const snap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  const clubs = snap.data().clubs || [];
  clubs.forEach((c, idx) => {
    console.log(`${idx + 1}. [${c.id}] "${c.name}"`);
    console.log(`   Address: ${c.address}`);
    console.log(`   Phone: ${c.phone} | WA: ${c.whatsappPhone || c.whatsapp}`);
  });
  process.exit(0);
}

list();
