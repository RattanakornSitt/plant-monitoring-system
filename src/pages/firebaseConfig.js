// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyByRSfKC2pRP5U5ulzswhGnTmk_19B5KTw",
  authDomain: "project-plant-monitoring-b580a.firebaseapp.com",
  projectId: "project-plant-monitoring-b580a",
  storageBucket: "project-plant-monitoring-b580a.firebasestorage.app",
  messagingSenderId: "512464485373",
  appId: "1:512464485373:web:dd3792ebaf8a25e08f7794",
  measurementId: "G-CDJBB3E3RK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });


// Export ตัวแปรที่จำเป็น
export { db, auth, googleProvider, onSnapshot, doc, setDoc };