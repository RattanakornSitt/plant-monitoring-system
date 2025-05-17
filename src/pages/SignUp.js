import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import "./css/SignUp.css";

function SignUp({ togglePopup, toggleToLogIn }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isHappyPopupVisible, setIsHappyPopupVisible] = useState(false);

  const checkIfUserExists = async () => {
    const usersRef = collection(db, "USER");
  
    // ตรวจสอบว่า email ซ้ำไหม
    const emailQuery = query(usersRef, where("email", "==", email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return true;
    }
  
    // ตรวจสอบว่า username ซ้ำไหม
    const usernameQuery = query(usersRef, where("username", "==", username));
    const usernameSnapshot = await getDocs(usernameQuery);
    if (!usernameSnapshot.empty) {
      return true;
    }
  
    return false;
  };
  

  const handleSignUp = async (e) => {
  e.preventDefault();
  setLoading(true);

  const userExists = await checkIfUserExists();
  if (userExists) {
    setErrorMessage("Username or email already in use. Please choose another.");
    setLoading(false);
    return;
  }

  try {
    // สร้างผู้ใช้ผ่านอีเมลและรหัสผ่าน
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // อัพเดท displayName (username) ให้กับผู้ใช้ใน Firebase Auth
    await updateProfile(user, { displayName: username });

    // บันทึกข้อมูลผู้ใช้ใน Firestore โดยใช้ uid เป็น document ID
    const userRef = doc(db, "USER", user.uid); // ใช้ uid เป็น document ID
    await setDoc(userRef, {
      username,
      email,
    });

    setLoading(false);
    setUsername("");
    setEmail("");
    setPassword("");

    // แสดง popup หลังจากสมัครสำเร็จ
    setIsHappyPopupVisible(true);

  } catch (error) {
    setErrorMessage(error.message);
    setLoading(false);
  }
};


  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "USER", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          username: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      }

      console.log("เข้าสู่ระบบผ่าน Google สำเร็จ");
      togglePopup();
      navigate("/pages/main");

    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google");
      console.error("Error during Google sign up:", error.message);
    }
  };

  const closeHappyPopup = () => {
    setIsHappyPopupVisible(false);
    togglePopup();
  };

  return (
    <div className="popup-overlay" onClick={isHappyPopupVisible ? closeHappyPopup : togglePopup}>
      {!isHappyPopupVisible && (
      <div className="popup-s-content" onClick={(e) => e.stopPropagation()}>
      <>
        <h2>Sign Up</h2>

        <button className="google-login-btn" onClick={handleGoogleSignUp}>
          <img src="/img/logo-google.png" alt="Google logo" className="google-logo" />
          Continue with Google
        </button>

        <form onSubmit={handleSignUp}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="popup-signup-btn" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="popup-links">
          <p>
            Already have an account? <a href="/pages/login" onClick={toggleToLogIn}>Login Now</a>
          </p>
        </div>
      </>
  </div>
      )}

  {isHappyPopupVisible && (
    <div className="happy-popup">
      <p className="happy-title">Sign up successful!<br />Please log in</p>
      <img src="/img/veggy.png" alt="Happy Icon" className="happy-icon" />
    </div>
  )}
</div>
  );
}

export default SignUp;
