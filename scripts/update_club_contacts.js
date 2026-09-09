const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAkcxejcGGvvhgFBXP970GcG4EwKnPn82A",
  authDomain: "hay-equipo-6c320.firebaseapp.com",
  projectId: "hay-equipo-6c320",
  storageBucket: "hay-equipo-6c320.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLUB_CONTACTS = {
  'club-laverde-jara': {
    phone: '(0223) 476-3811',
    whatsapp: '5492235340140'
  },
  'club-laverde-cordoba': {
    phone: '(0223) 494-0904',
    whatsapp: '5492235674602'
  },
  'club-laverde-telefonos': {
    phone: '(0223) 470-2577',
    whatsapp: '5492235742296'
  },
  'club-el-potrero': {
    phone: '(0223) 496-0303',
    whatsapp: '5492234554400'
  },
  'club-balon-5': {
    phone: '(0223) 493-0137',
    whatsapp: '5492234930137'
  },
  'club-cancha-luro-5102': {
    phone: '(0223) 473-9964',
    whatsapp: '5492234739964'
  },
  'club-catonio-f7': {
    phone: '(0223) 489-7974',
    whatsapp: '5492234897974'
  },
  'club-complejo-gaboto': {
    phone: '(0223) 489-3643',
    whatsapp: '5492233125002'
  },
  'club-complejo-san-paolo': {
    phone: '(0223) 481-6265',
    whatsapp: '5492234816265'
  },
  'club-parada-5': {
    phone: '(0223) 479-2524',
    whatsapp: '5492234792524'
  },
  'club-estacion-futbol-luro': {
    phone: '(0223) 472-7545',
    whatsapp: '5492234727545'
  },
  'club-estacion-futbol-berutti': {
    phone: '(0223) 472-7545',
    whatsapp: '5492234727545'
  },
  'club-el-campito': {
    phone: '(0223) 482-7007',
    whatsapp: '5492235290169'
  },
  'club-dreams-futbol-5': {
    phone: '(0223) 562-5542',
    whatsapp: '5492235625542'
  },
  'club-7-anker': {
    phone: '(0223) 518-6613',
    whatsapp: '5492235186613'
  },
  'club-smith-colon': {
    phone: '(0223) 591-1934',
    whatsapp: '5492235911934'
  },
  'club-green-park': {
    phone: '(0223) 563-8051',
    whatsapp: '5492235638051'
  },
  'club-la-techada': {
    phone: '(0223) 465-0500',
    whatsapp: '5492234650500'
  },
  'club-indoor-7': {
    phone: '(0223) 529-1347',
    whatsapp: '5492235372189'
  },
  'club-3er-tiempo': {
    phone: '(0223) 478-2200',
    whatsapp: '5492236063607'
  },
  'club-var-futbol-7': {
    phone: '(0223) 480-2117',
    whatsapp: '5492234802117'
  },
  'club-aztk-arena': {
    phone: '(0223) 501-1010',
    whatsapp: '5492235011010'
  },
  'club-deportivo-colon': {
    phone: '(0223) 455-6383',
    whatsapp: '5492234556383'
  },
  'club-complejo-trebi': {
    phone: '(0223) 576-8588',
    whatsapp: '5492235768588'
  },
  'club-america-f5': {
    phone: '(0223) 564-7015',
    whatsapp: '5492235647015'
  },
  'club-area-7': {
    phone: '(0223) 471-6000',
    whatsapp: '5492234716000'
  }
};

async function updateContacts() {
  console.log('Fetching clubs from Firestore...');
  const docRef = doc(db, 'settings', 'hay_equipo_clubs');
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    console.error('Document settings/hay_equipo_clubs not found!');
    process.exit(1);
  }

  const data = snap.data();
  const clubs = data.clubs || [];
  let updatedCount = 0;

  const updatedClubs = clubs.map(club => {
    const contact = CLUB_CONTACTS[club.id];
    if (contact) {
      updatedCount++;
      return {
        ...club,
        phone: contact.phone,
        whatsapp: contact.whatsapp,
        whatsappPhone: contact.whatsapp
      };
    }
    return club;
  });

  await setDoc(docRef, {
    ...data,
    clubs: updatedClubs,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log(`Successfully updated contact info for ${updatedCount} clubs in Firestore!`);
  
  console.log('\n--- VERIFICATION SAMPLE ---');
  updatedClubs.slice(0, 8).forEach(c => {
    console.log(`[${c.name}] Phone: ${c.phone} | WhatsApp: ${c.whatsappPhone}`);
  });

  process.exit(0);
}

updateContacts().catch(err => {
  console.error('Error updating contacts:', err);
  process.exit(1);
});
