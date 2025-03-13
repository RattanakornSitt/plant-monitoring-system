import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../pages/firebaseConfig';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false); // ✅ state สำหรับ Popup
  const [newNotification, setNewNotification] = useState(null); // ✅ ข้อมูลของการแจ้งเตือนใหม่

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const plantImagesRef = collection(db, 'PLANT_IMAGES');
        const diseaseRef = collection(db, 'DISEASE');

        let plantImages = [];
        let diseases = [];

        // ฟังการเปลี่ยนแปลงใน PLANT_IMAGES
        onSnapshot(plantImagesRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              plantImages.push({
                id: change.doc.id || `notification-id-${change.doc.ref.id}`,
                ...change.doc.data(),
              });
              updateNotifications([...plantImages], diseases); // ✅ ส่งค่า Array ใหม่
            }
          });
        });

        // ฟังการเปลี่ยนแปลงใน DISEASE
        onSnapshot(diseaseRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              diseases.push({
                id: change.doc.id || `disease-id-${change.doc.ref.id}`,
                ...change.doc.data(),
              });
              updateNotifications(plantImages, [...diseases]); // ✅ ส่งค่า Array ใหม่
            }
          });
        });

      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const updateNotifications = (plantImages, diseases) => {
      const groupedNotifications = plantImages.reduce((acc, plant) => {
        const key = `${plant.date}_${plant['plant-name']}`;

        if (!acc[key]) {
          acc[key] = {
            id: plant.id,
            date: plant.date,
            plantName: plant['plant-name'],
            images: [],
            confidence: plant.confidence,
            time: plant.time,
            documents: 0,
            symptoms: '',
            solutions: '',
            description: '',
            read: false,
          };
        }

        acc[key].images.push(plant['image-url']);
        acc[key].documents += 1;

        const diseaseInfo = diseases.find(d => d.disease_name === plant['plant-name']);
        if (diseaseInfo) {
          acc[key].symptoms = diseaseInfo.symptoms;
          acc[key].solutions = diseaseInfo.solutions;
          acc[key].description = diseaseInfo.description;
        }

        return acc;
      }, {});

      const notificationsArray = Object.values(groupedNotifications);
      setNotifications(notificationsArray);

      // ✅ เปิด Popup เมื่อมีแจ้งเตือนใหม่
      if (notificationsArray.length > 0) {
        const latestNotification = notificationsArray[notificationsArray.length - 1];
        setNewNotification(latestNotification);
        setShowPopup(true); // ✅ เปิด Popup ทันที
      }
    };

    fetchNotifications();
  }, []); 

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, showPopup, setShowPopup, newNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
