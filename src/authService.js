// src/authService.js
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// ฟังก์ชันสมัครสมาชิก
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'USER', user.uid), {
      email: user.email,
      createdAt: new Date(),
    });
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// ฟังก์ชันเข้าสู่ระบบ
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
