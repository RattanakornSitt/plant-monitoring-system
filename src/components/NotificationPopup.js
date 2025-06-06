import React, { useContext } from "react";
import { NotificationContext } from "./NotificationContext";
import "./NotiPopup.css";

function NotificationPopup() {
  const { showPopup, newNotification, closePopup } = useContext(NotificationContext);
  
  // กำหนดรายชื่อผู้ใช้ที่ได้รับการแจ้งเตือน
  const allowedUsers = ["rattanakorn123"]; // เพิ่มชื่อผู้ใช้ที่ต้องการได้รับการแจ้งเตือน
  
  // ฟังก์ชันสำหรับดึงชื่อผู้ใช้ปัจจุบัน
  const getCurrentUser = () => {
    // วิธีที่ 1: ดึงจาก localStorage
    const userFromStorage = localStorage.getItem('username') || localStorage.getItem('currentUser');
    if (userFromStorage) return userFromStorage;
    
    // วิธีที่ 2: ดึงจาก sessionStorage
    const userFromSession = sessionStorage.getItem('username') || sessionStorage.getItem('currentUser');
    if (userFromSession) return userFromSession;
    
    // วิธีที่ 3: ดึงจาก Context หรือ State management (ถ้ามี)
    // const { currentUser } = useContext(AuthContext);
    // if (currentUser) return currentUser.username;
    
    // วิธีที่ 4: ดึงจาก JWT token (ถ้ามี)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   try {
    //     const decoded = JSON.parse(atob(token.split('.')[1]));
    //     return decoded.username;
    //   } catch (error) {
    //     console.error('Error decoding token:', error);
    //   }
    // }
    
    return null;
  };
  
  const currentUser = getCurrentUser();
  
  // ตรวจสอบว่าผู้ใช้ปัจจุบันอยู่ในรายชื่อที่อนุญาตหรือไม่
  const isAuthorizedUser = currentUser && allowedUsers.includes(currentUser);
  
  // ไม่แสดง popup หากไม่มีการแจ้งเตือน, ไม่ได้เปิด popup, หรือผู้ใช้ไม่ได้รับอนุญาต
  if (!showPopup || !newNotification || !isAuthorizedUser) return null;

  const imageUrl = newNotification.images?.[0] || "/img/logo.png";

  // ป้องกัน time format ผิดพลาด
  const timeStr = newNotification.time?.padStart(8, "0"); // แปลงเป็น HH:mm:ss เช่น 09:00:00
  const currentDate = new Date().toISOString().split("T")[0];
  const timeString = `${currentDate}T${timeStr}`;
  const notificationTime = new Date(timeString);

  const localTime = isNaN(notificationTime.getTime())
    ? "Invalid time"
    : notificationTime.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

  const uid = newNotification?.uid;

  // ตรวจสอบว่าเป็นเลขที่ใช้ได้จริง
  const isValidNumber = (val) => !isNaN(Number(val)) && Number(val) > 0;

  const productId = newNotification.product;
  const cameraId = newNotification.camera;

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>🚨 New Notification!</h2>
        <img src={imageUrl} alt="Notification" className="notification-image" />

        <div className="id-row">
          {isValidNumber(productId) && (
            <div className="id-tag"><strong>Device ID:</strong> {productId}</div>
          )}
          {isValidNumber(cameraId) && (
            <div className="id-tag"><strong>Camera:</strong> {cameraId}</div>
          )}
        </div>

        {newNotification.description && (
          <p><strong>{newNotification.description}</strong></p>
        )}
        <p><strong>Disease name:</strong> {newNotification.plantName}</p>
        <p><strong>Confidence:</strong> {parseFloat(newNotification.confidence).toFixed(2)}%</p>
        <p><strong>Detected at:</strong> {localTime}</p>
        {newNotification.symptoms && (
          <p><strong>Symptoms:</strong> {newNotification.symptoms}</p>
        )}
        {uid && <p><strong>UID:</strong> {uid}</p>}

        <div className="popup-actions">
          <button onClick={closePopup}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPopup;