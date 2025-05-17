import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // เพิ่ม useNavigate

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับการนำทาง

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userRef = doc(getFirestore(), "USER", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } else {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUser(storedUser);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogOut = () => {
    auth.signOut()
      .then(() => {
        localStorage.removeItem("user");
        setUser(null);  // Clear user data from context
        console.log("Logout successful!");  // แจ้งเตือนใน console
        navigate("/");  // กลับไปที่หน้า / หลังจากล็อกเอาท์
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, handleLogOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const  useUser = () => useContext(UserContext);
