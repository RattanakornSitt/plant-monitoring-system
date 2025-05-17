import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useUser } from "./UserContext";
import "./css/Dashboard.css";

function Main() {
  const navigate = useNavigate();
  const { user, setUser } = useUser(); 
  const [isLoading, setIsLoading] = useState(true); // เพิ่มสถานะโหลด

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (storedUser) {
            setUser(storedUser);
          } else {
            navigate("/"); 
            return;
          }
        } else {
          const userRef = doc(getFirestore(), "USER", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User Data from Firestore:", userData); // Debugging log
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            console.error("No user data found in Firestore");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false); // โหลดเสร็จ
      }
    };
    fetchUserData();
  }, [navigate, setUser]);

  /*const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/"); 
        console.log("Logged out successfully");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };*/

  if (isLoading) return <p>Loading...</p>; // แสดง loading state

  if (!user) {
    return (
      <div>
        <p>User data not found. Redirecting...</p>
      </div>
    );
  }

  const serviceBoxes = [
    {
      key: "services",
      image: "/img/service-3.png",
      title: "Our Services",
      description: "Click here to explore our services",
      path: "/pages/Services",
    },
    {
      key: "about",
      image: "/img/aboutus.png",
      title: "About Us",
      description: "Learn more about us and our mission",
      path: "/pages/AboutUs",
    },
    {
      key: "support",
      image: "/img/faq.png",
      title: "Support",
      description: "Get help and support from our team",
      path: "/pages/Support",
    },
  ];

  // ถ้าเป็น admin, เพิ่มกล่องพิเศษ
  if (user.username === "Admin") {
    serviceBoxes.push({
      key: "admin",
      image: "/img/admin-dash.png", // เตรียมรูป admin ด้วยนะคะ หรือเปลี่ยนเป็นรูปอื่นได้
      title: "Administrator",
      description: "Manage users, manage system problems, and more",
      path: "/pages/AdminDashboard", // อย่าลืมสร้างเส้นทางนี้ใน router ของคุณ
    });
  }

  return (

    <div className="dashboard-container">
      <h1>Welcome, {user.username}</h1>

      <div className="services-container">
        {serviceBoxes.map((box) => (
          <div
            key={box.key}
            className={`${box.key}-box service-box`}
            onClick={() => navigate(box.path)}
          >
            <img src={box.image} alt={box.title} />
            <h2>{box.title}</h2>
            <p>{box.description}</p>
          </div>
        ))}
      </div>
    </div>

  );
}

export default Main;
