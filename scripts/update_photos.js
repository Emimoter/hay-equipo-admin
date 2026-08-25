const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyA6rBjlZ62CULHi8CqADZqE-VO8Nm5faJA',
  authDomain: 'pclink-f6e0d.firebaseapp.com',
  projectId: 'pclink-f6e0d',
  storageBucket: 'pclink-f6e0d.firebasestorage.app',
  messagingSenderId: '716411272758',
  appId: '1:716411272758:web:26e82f394e28e57e3de297',
  measurementId: 'G-0Y1T09135P'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const REAL_CLUB_PHOTOS = {
  'club-laverde-jara': [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-laverde-cordoba': [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-laverde-telefonos': [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-el-potrero': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-balon-5': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-cancha-luro-5102': [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-catonio-f7': [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-complejo-gaboto': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-complejo-san-paolo': [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-parada-5': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-estacion-futbol-luro': [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-estacion-futbol-berutti': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-el-campito': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-dreams-futbol-5': [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-7-anker': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-smith-colon': [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-green-park': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-la-techada': [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-indoor-7': [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-3er-tiempo': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-var-futbol-7': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-aztk-arena': [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-deportivo-colon': [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-complejo-trebi': [
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-america-f5': [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80'
  ],
  'club-area-7': [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80'
  ]
};

async function updatePhotos() {
  console.log('Fetching settings/hay_equipo_clubs from Firestore...');
  const snap = await getDoc(doc(db, 'settings', 'hay_equipo_clubs'));
  if (!snap.exists()) {
    console.log('Doc settings/hay_equipo_clubs does not exist');
    return;
  }
  const clubs = snap.data().clubs;
  console.log(`Updating photos for ${clubs.length} clubs...`);

  const updatedClubs = clubs.map(club => {
    if (REAL_CLUB_PHOTOS[club.id]) {
      return {
        ...club,
        images: REAL_CLUB_PHOTOS[club.id]
      };
    }
    return club;
  });

  await setDoc(doc(db, 'settings', 'hay_equipo_clubs'), {
    clubs: updatedClubs,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('✅ Photos updated successfully in Firestore settings/hay_equipo_clubs!');
}

updatePhotos().then(() => process.exit(0)).catch(err => {
  console.error('Error updating photos:', err);
  process.exit(1);
});
