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
  const { user } = useUser(); // Ensure user is available
  const latestNotificationId = useRef(null);

  // Fetch data from Firestore
  useEffect(() => {
    if (!user) return; // Ensure user is present before fetching data

    const plantImagesRef = collection(db, "PLANT_IMAGES");
    const diseaseRef = collection(db, "DISEASE");

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
    };
  }, [user]);

  // Process and group notifications
  useEffect(() => {
    if (plantImages.length === 0 || !user) return; // Ensure user is present

    const readStatusMap = JSON.parse(localStorage.getItem(`readNotifications_${user?.uid}`) || '{}');

    const groupedNotifications = plantImages.reduce((acc, plant) => {
      if (!plant.date || !plant.time) return acc;

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
          product_ID: parseInt(plant["product_ID"]) || null, // แก้ตรงนี้
          camera_ID: parseInt(plant["camera_ID"]) || null,   // แก้ตรงนี้
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
      return aDate - bDate;
    });

    setNotifications(notificationsArray);
  }, [plantImages, diseases, user]);

  // Check for new notification and show popup
  useEffect(() => {
    if (notifications.length === 0 || !user) return; // Ensure user is present

    const latest = notifications[notifications.length - 1];
    const { date, time } = latest;

    const fullDateString = `${date}T${time}`;
    const notificationTime = new Date(fullDateString);

    if (isNaN(notificationTime)) {
      console.error("Invalid time value:", fullDateString);
      return;
    }

    const notificationHour = notificationTime.toISOString().slice(0, 13); // e.g., 2025-04-18T09
    const shownHoursKey = `popupShownHours_${user?.uid}`; // Check user exists before using uid
    const shownHours = JSON.parse(localStorage.getItem(shownHoursKey) || "[]");

    if (!shownHours.includes(notificationHour)) {
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
      }}
    >
      {children}

      {showPopup && newNotification && (
        <div className="popup-container">
          <div className="popup">
            <h3>New Notification</h3>
            <p>
              <strong>Plant:</strong> {newNotification.plantName}
            </p>
            <p>
              <strong>Confidence:</strong> {parseFloat(newNotification.confidence).toFixed(2)}%
            </p>
            <p>
              <strong>Detected at:</strong>{" "}
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
              <strong>Symptoms:</strong> {newNotification.symptoms}
            </p>
            <p>
              <strong>Solutions:</strong> {newNotification.solutions}
            </p>
            <div className="popup-images">
              <img
                src={newNotification.images[0]}
                alt={`Plant ${newNotification.plantName}`}
              />
            </div>
            <button onClick={closePopup} className="popup-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
