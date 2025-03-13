import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig"; // ใช้ firebaseConfig ของโปรเจค
import { useEffect } from "react";

// ขอ FCM Token จากผู้ใช้
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      const token = await getToken(messaging, {
        vapidKey: "BHY7-4vf6FNk2lc657RY-DSE0du_luVowAR9Vs72foMed6vkEI25sIqJE6JdYWFNb4kLwIfr50vWUA8BA086yA0", // แทนที่ด้วย VAPID Key จาก Firebase
      });

      console.log("FCM Token:", token);
      localStorage.setItem("fcmToken", token); // เก็บ Token ไว้ใช้งาน
      return token;
    } else {
      console.log("Notification permission denied.");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
  }
};

// ฟังก์ชันในการส่ง push notification ไปยัง FCM
export const sendManualNotification = async (title, body, imageUrl) => {
  try {
    const payload = {
      notification: {
        title,
        body,
        image: imageUrl,
      },
      to: localStorage.getItem("fcmToken"), // ใช้ token ที่ขอมา
    };

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Push notification sent:", data);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

// รับข้อความแจ้งเตือนเมื่อเปิดแอป
export const receiveNotification = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
  });
};

// React Component ที่จะใช้ฟังก์ชันเหล่านี้
const PushNotificationComponent = () => {
  useEffect(() => {
    // เรียกขอ permission และ token เมื่อเริ่มต้น
    requestNotificationPermission();
    receiveNotification(); // รับข้อความแจ้งเตือน
  }, []); // ทำงานครั้งเดียวเมื่อคอมโพเนนต์โหลด

  return (
    <div>
      <h1>Push Notification Component</h1>
      {/* UI ที่ต้องการ */}
    </div>
  );
};

export default PushNotificationComponent;
