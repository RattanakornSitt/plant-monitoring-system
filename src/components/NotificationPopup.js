import React, { useContext, useEffect } from 'react';
import { NotificationContext } from './NotificationContext';
import './NotiPopup.css';

function NotificationPopup() {
  const { showPopup, setShowPopup, newNotification } = useContext(NotificationContext);

  useEffect(() => {
    console.log("showPopup:", showPopup);
    console.log("newNotification:", newNotification);
  }, [showPopup, newNotification]); // ✅ เช็คค่าเมื่อเปลี่ยนแปลง

  if (!showPopup || !newNotification) return null;

  const imageUrl = newNotification['image-url'] || '/img/logo.png';

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>New Notification!</h2>
        <img src={imageUrl} alt="Notification" className="notification-image" />
        <p><strong>{newNotification.description}</strong></p>
        <p><strong>Symptoms:</strong> {newNotification.symptoms}</p>
        <p><strong>Solutions:</strong> {newNotification.solutions}</p>
        <div className="popup-actions">
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPopup;
