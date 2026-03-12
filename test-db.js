import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDB() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    console.log(`✅ Conexión exitosa. Usuarios registrados: ${usersSnap.size}`);
    
    // Log their emails to verify if creator profiles are saved
    usersSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.role}: ${data.email} | Wallet: ${data.walletAddress || 'N/A'}`);
    });

    const campaignsSnap = await getDocs(collection(db, "campaigns"));
    console.log(`\n✅ Conexión exitosa. Campañas registradas: ${campaignsSnap.size}`);
    campaignsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`- Campaña: ${data.name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error de conexión:", err.message);
    process.exit(1);
  }
}

testDB();
