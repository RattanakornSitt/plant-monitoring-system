import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useUser } from "./UserContext";
import "./css/Dashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);

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
            console.log("User Data from Firestore:", userData);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            console.error("No user data found in Firestore");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, setUser]);

  if (isLoading) return <p>Loading...</p>;

  if (!user) {
    return <div><p>User data not found. Redirecting...</p></div>;
  }

  const adminBoxes = [
    {
      key: "manage-user",
      image: "/img/m-user.png", // คุณสามารถเปลี่ยนเป็น path รูปที่ต้องการ
      title: "Manage User",
      description: "View and control user accounts",
      path: "/pages/ManageUser",
    },
    {
      key: "manage-problems",
      image: "/img/m-system.png",
      title: "Manage System Problems",
      description: "Monitor and resolve system issues",
      path: "/pages/ManageProblems",
    },
  ];

  return (
    <div className="dashboard-container">
      <button className="back-button" onClick={() => navigate('/pages/main')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1>Welcome Admin</h1>

      <div className="services-container">
        {adminBoxes.map((box) => (
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

export default AdminDashboard;
