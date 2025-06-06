import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../pages/firebaseConfig";
import { useUser } from "../pages/UserContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const [plantImages, setPlantImages] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const { user } = useUser();
  const latestNotificationId = useRef(null);
  const [userProducts, setUserProducts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // เพิ่มการนับแจ้งเตือนที่ยังไม่ได้อ่าน

  // Fetch data from Firestore
  useEffect(() => {
    if (!user || !user.username) return;

    const plantImagesRef = collection(db, "PLANT_IMAGES");
    const diseaseRef = collection(db, "DISEASE");
    const cameraRef = collection(db, "CAMERA");

    // ดึงข้อมูล products ของ user นั้นๆ
    const unsubscribeCamera = onSnapshot(cameraRef, (snapshot) => {
      const products = snapshot.docs
        .map((doc) => doc.data())
        .filter((data) => data.username === user.username)
        .map((data) => parseInt(data.product));
      
      console.log(`User ${user.username} products:`, products);
      setUserProducts(products);
    });

    const unsubscribePlantImages = onSnapshot(plantImagesRef, (snapshot) => {
      const newImages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlantImages(newImages);
    });

    const unsubscribeDiseases = onSnapshot(diseaseRef, (snapshot) => {
      setDiseases(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsubscribePlantImages();
      unsubscribeDiseases();
      unsubscribeCamera();
    };
  }, [user]);

  // Process and group notifications - กรองเฉพาะ product ของ user
  useEffect(() => {
    if (plantImages.length === 0 || !user || userProducts.length === 0) return;

    const readStatusMap = JSON.parse(localStorage.getItem(`readNotifications_${user.uid}`) || '{}');

    const groupedNotifications = plantImages.reduce((acc, plant) => {
      if (!plant.date || !plant.time) return acc;

      const plantProduct = parseInt(plant["product"]);
      
      // ✅ กรองเฉพาะ product ที่เป็นของ user นี้เท่านั้น
      if (!userProducts.includes(plantProduct)) {
        console.log(`Filtering out plant with product ${plantProduct} - not owned by ${user.username}`);
        return acc;
      }

      const hourKey = `${plant.date}_${plant.time.substring(0, 2)}`;
      const plantName = plant["plant-name"] || "Unknown";

      if (!acc[hourKey]) {
        acc[hourKey] = {
          id: plant.id,
          date: plant.date,
          time: plant.time,
          plantName,
          images: [],
          confidence: plant.confidence,
          product: plantProduct,
          camera: parseInt(plant["camera"]) || null,
          documents: 0,
          symptoms: "",
          solutions: "",
          description: "",
          read: readStatusMap[hourKey] || false,
        };
      }

      acc[hourKey].images.push(plant["image-url"]);
      acc[hourKey].documents += 1;

      const diseaseInfo = diseases.find((d) => d.disease_name === plantName);
      if (diseaseInfo) {
        acc[hourKey].symptoms = diseaseInfo.symptoms;
        acc[hourKey].solutions = diseaseInfo.solutions;
        acc[hourKey].description = diseaseInfo.description;
      }

      return acc;
    }, {});

    const notificationsArray = Object.values(groupedNotifications).sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}`);
      const bDate = new Date(`${b.date}T${b.time}`);
      return bDate - aDate; // เรียงจากใหม่ไปเก่า
    });

    setNotifications(notificationsArray);
    
    // นับจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
    const unreadNotifications = notificationsArray.filter(n => !n.read);
    setUnreadCount(unreadNotifications.length);
    
    console.log(`User ${user.username} has ${notificationsArray.length} notifications, ${unreadNotifications.length} unread`);
  }, [plantImages, diseases, user, userProducts]);

  // Check for new notification and show popup - เฉพาะของ user นี้
  useEffect(() => {
    if (notifications.length === 0 || !user) return;

    const latest = notifications[0]; // เอาตัวล่าสุด (เรียงจากใหม่ไปเก่าแล้ว)
    const { date, time } = latest;

    const fullDateString = `${date}T${time}`;
    const notificationTime = new Date(fullDateString);

    if (isNaN(notificationTime)) {
      console.error("Invalid time value:", fullDateString);
      return;
    }

    const notificationHour = notificationTime.toISOString().slice(0, 13);
    const shownHoursKey = `popupShownHours_${user.uid}`;
    const shownHours = JSON.parse(localStorage.getItem(shownHoursKey) || "[]");

    // ตรวจสอบว่าเป็นแจ้งเตือนใหม่และยังไม่ได้แสดง popup
    if (!shownHours.includes(notificationHour) && !latest.read) {
      console.log(`Showing popup for user ${user.username}, product ${latest.product}:`, latest);
      
      setNewNotification(latest);
      setShowPopup(true);
      latestNotificationId.current = latest.id;

      shownHours.push(notificationHour);
      localStorage.setItem(shownHoursKey, JSON.stringify(shownHours));
    }
  }, [notifications, user]);

  const closePopup = () => {
    setShowPopup(false);
    setNewNotification(null);
  };

  const markNotificationAsRead = (id, date, time) => {
    const hourKey = `${date}_${time.substring(0, 2)}`;
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);

    // Save read status in localStorage
    const readStatusMap = JSON.parse(localStorage.getItem(`readNotifications_${user?.uid}`) || '{}');
    readStatusMap[hourKey] = true;
    localStorage.setItem(`readNotifications_${user?.uid}`, JSON.stringify(readStatusMap));
    
    // อัพเดตจำนวนแจ้งเตือนที่ยังไม่ได้อ่าน
    const unreadNotifications = updated.filter(n => !n.read);
    setUnreadCount(unreadNotifications.length);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);

    // Save all as read in localStorage
    const readStatusMap = JSON.parse(localStorage.getItem(`readNotifications_${user?.uid}`) || '{}');
    notifications.forEach(n => {
      const hourKey = `${n.date}_${n.time.substring(0, 2)}`;
      readStatusMap[hourKey] = true;
    });
    localStorage.setItem(`readNotifications_${user?.uid}`, JSON.stringify(readStatusMap));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        showPopup,
        setShowPopup,
        newNotification,
        closePopup,
        setNewNotification,
        markNotificationAsRead,
        markAllAsRead,
        unreadCount, // เพิ่มสำหรับ navbar
        userProducts, // เพิ่มเพื่อให้ component อื่นเข้าถึงได้
      }}
    >
      {children}

      {showPopup && newNotification && (
        <div className="popup-container">
          <div className="popup">
            <h3>🚨 New Plant Disease Alert</h3>
            <div className="popup-header">
              <span className="product-badge">Product #{newNotification.product}</span>
              <span className="user-badge">👤 {user.username}</span>
            </div>
            <p>
              <strong>🌱 Plant Disease:</strong> {newNotification.plantName}
            </p>
            <p>
              <strong>🎯 Confidence:</strong> {parseFloat(newNotification.confidence).toFixed(2)}%
            </p>
            <p>
              <strong>⏰ Detected at:</strong>{" "}
              {new Date(`${newNotification.date}T${newNotification.time}`).toLocaleString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }).replace(/:\d{2}$/, ":00")}
            </p>
            <p>
              <strong>🔴 Symptoms:</strong> {newNotification.symptoms}
            </p>
            <p>
              <strong>💊 Solutions:</strong> {newNotification.solutions}
            </p>
            <div className="popup-images">
              <img
                src={newNotification.images[0]}
                alt={`Plant ${newNotification.plantName}`}
              />
            </div>
            <div className="popup-actions">
              <button onClick={closePopup} className="popup-close-btn">
                ✅ Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
