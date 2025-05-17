import React, { useContext } from "react";
import { NotificationContext } from "./NotificationContext";
import "./NotiPopup.css";

function NotificationPopup() {
  const { showPopup, newNotification, closePopup } = useContext(NotificationContext);

  if (!showPopup || !newNotification) return null;

  const imageUrl = newNotification.images?.[0] || "/img/logo.png";

  // สร้างวันที่และเวลาสำหรับแสดงผล
  const currentDate = new Date().toISOString().split("T")[0];
  const timeString = `${currentDate}T${newNotification.time}`;
  const notificationTime = new Date(timeString);

  const localTime = notificationTime.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const uid = newNotification?.uid;

  // ตรวจสอบและแปลงให้ปลอดภัย
  const productId = Number(newNotification.product_ID);
  const cameraId = Number(newNotification.camera_ID);

  const isValidNumber = (value) => !isNaN(value) && typeof value === "number";

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>🚨 New Notification!</h2>
        <img src={imageUrl} alt="Notification" className="notification-image" />
        
        {/* แสดง ID เฉพาะเมื่อเป็นเลขที่ valid */}
        <div className="id-row">
          {isValidNumber(productId) && (
            <div className="id-tag"><strong>Product ID:</strong> {productId}</div>
          )}
          {isValidNumber(cameraId) && (
            <div className="id-tag"><strong>Camera:</strong> {cameraId}</div>
          )}
        </div>

        {newNotification.description && (
          <p><strong>{newNotification.description}</strong></p>
        )}
        <p><strong>Plant:</strong> {newNotification.plantName}</p>
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
