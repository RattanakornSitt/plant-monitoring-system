import React, { useContext } from 'react';
import { NotificationContext } from './NotificationContext';

function NotificationList() {
  const { notifications, showPopup, setShowPopup, newNotification } = useContext(NotificationContext);

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      <section className="notifications-content">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${!notification.read ? 'unread' : ''}`}
            onClick={() => { /* ทำการ mark as read ที่นี่ */ }}
          >
            <h2>{notification.plantName}</h2>
            <p><strong>Symptoms:</strong> {notification.symptoms}</p>
            <p><strong>Solutions:</strong> {notification.solutions}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default NotificationList;
