import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "./firebaseConfig"; // Firebase auth and Google provider
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import { db } from "./firebaseConfig";
import { collection, query, where, getDocs, setDoc, doc, getDoc, onSnapshot } from "firebase/firestore"; // Firestore functions
import "./css/LogIn.css";

function LogIn({ togglePopup, toggleToSignUp }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState(""); // For username or email
  const [password, setPassword] = useState("");
  const [resetPasswordMessage, setResetPasswordMessage] = useState("");  // สำหรับเก็บข้อความหลังจากรีเซ็ตรหัสผ่าน
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is admin
  const [rememberMe, setRememberMe] = useState(false); // State to track "Remember Me"
  const navigate = useNavigate();

   // เมื่อโหลดหน้าเว็บ ให้ตรวจสอบ localStorage ว่ามีข้อมูล Remember Me หรือไม่
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedPassword = localStorage.getItem("userPassword");
    const storedRememberMe = localStorage.getItem("rememberMe");

    if (storedEmail && storedPassword && storedRememberMe === "true") {
      setUsernameOrEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);  // If Remember Me is true, set the checkbox as checked
    }
  }, []);
  
  // Google login
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, "USER", user.uid);

      // If new user, save data to Firestore
      await setDoc(userRef, {
        username: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });

      console.log("User signed up with Google and data saved to Firestore");
      togglePopup(); // Close the popup after successful registration
      navigate("/pages/main"); // Navigate to the dashboard after successful login
    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error during Google sign up:", error.message);
    }
  };

  // Login function (checks for username or email)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      let userEmail = usernameOrEmail;
  
      // หากกรอกเป็น username จะทำการค้นหา email จาก Firestore
      if (!userEmail.includes("@")) {
        userEmail = await getEmailFromUsername(userEmail);
        if (!userEmail) {
          setErrorMessage("Username not found.");
          setLoading(false);  // หยุดการโหลด
          return;  // หากไม่พบ username ใน Firestore จะหยุดการทำงาน
        }
      }
  
      // ลงชื่อเข้าใช้ด้วย email และ password
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const user = userCredential.user;
      console.log("Logged in with email:", userEmail);
  
      // ตรวจสอบข้อมูลผู้ใช้ใน Firestore
      const userRef = doc(db, "USER", user.uid);
      const userDoc = await getDoc(userRef);
  
      console.log("User document from Firestore:", userDoc.data()); // ตรวจสอบข้อมูลจาก Firestore

      // หากไม่มีข้อมูลผู้ใช้ใน Firestore ให้แสดงข้อผิดพลาด
      if (!userDoc.exists()) {
        setErrorMessage("User not found in the database.");
        setLoading(false);  // หยุดการโหลด
        return;
      }
  
      const userData = userDoc.data();

      // ถ้าผู้ใช้ล็อกอินสำเร็จ
      if (userData && userData.username) {
        // หากเลือก Remember Me ให้เก็บข้อมูลใน localStorage
        if (rememberMe) {
          localStorage.setItem("userEmail", userEmail);
          localStorage.setItem("userPassword", password);
          localStorage.setItem("rememberMe", "true"); // Set Remember Me to true in localStorage
        } else {
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userPassword");
          localStorage.removeItem("rememberMe");
        }

        // ถ้าผู้ใช้เป็น Admin
        if (userData.username === "myself") {
          setIsAdmin(true);
        } else {
          togglePopup();
          navigate("/pages/main");
        }
      } else {
        setErrorMessage("Username not found in user data.");
      }

    } catch (error) {
      setErrorMessage(error.message);
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get email from username in Firestore
  const getEmailFromUsername = async (username) => {
    try {
      const q = query(collection(db, "USER"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        return userDoc.email; // Return email if username matches
      }
      return null; // If not found
    } catch (error) {
      console.error("Error fetching email from username:", error);
      return null;
    }
  };

   // ฟังก์ชันรีเซ็ตรหัสผ่าน
   const handleResetPassword = async (e) => {
    e.preventDefault();  // ป้องกันการรีเฟรชหน้าหลังจาก submit form
    try {
      // ตรวจสอบว่าผู้ใช้กรอก email หรือ username
      let userEmail = usernameOrEmail;
      if (!userEmail.includes("@")) {
        userEmail = await getEmailFromUsername(userEmail); // ค้นหา email จาก username
        if (!userEmail) {
          setErrorMessage("Username not found.");
          return;
        }
      }

      // ส่งอีเมลรีเซ็ตรหัสผ่าน
      await sendPasswordResetEmail(auth, userEmail);
      setResetPasswordMessage("Password reset email sent. Please check your inbox.");
      setErrorMessage("");  // เคลียร์ข้อความผิดพลาด
    } catch (error) {
      setResetPasswordMessage(""); // เคลียร์ข้อความสำเร็จ
      setErrorMessage("Error sending password reset email. Please try again.");
      console.error("Error sending password reset email:", error);
    }
  };

  return (
    <div className="popup-l-overlay" onClick={togglePopup}>
      <div className="popup-l-content" onClick={(e) => e.stopPropagation()}>
        <h2>Log In</h2>

        {/* Google login button */}
        <button className="google-login-btn" onClick={handleGoogleSignUp}>
          <img
            src="/img/logo-google.png"
            alt="Google logo"
            className="google-logo"
          />
          Continue with Google
        </button>

        {/* Username or email login form */}
        <form onSubmit={handleLogin}>
          <label htmlFor="usernameOrEmail">Username or Email</label>
          <input
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
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

          <div className="remember-me">
          <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="popup-login-btn">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
          {/* ลิงก์ Forgot password และ Sign-up */}
          <div className="popup-links">
          <a href="#" onClick={handleResetPassword}>Forgot your password?</a>
          <p>
          Don't have an account? <a href="#" onClick={toggleToSignUp}>Sign up</a>
        </p>
      </div>
      {/* แสดงข้อความ error หากเกิดข้อผิดพลาด */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
        {/* แสดงข้อความหลังจากรีเซ็ตรหัสผ่าน */}
        {resetPasswordMessage && <p className="success-message">{resetPasswordMessage}</p>}
      </div>
      </div>
  );
}

export default LogIn;