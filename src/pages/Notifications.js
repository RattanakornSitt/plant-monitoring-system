import React, { useContext, useEffect, useCallback } from 'react';
import { NotificationContext } from '../components/NotificationContext';
import './css/Notifications.css';

function Notifications() {
  const { notifications, setNotifications } = useContext(NotificationContext);

  // ฟังก์ชันที่จะเลื่อนไปยังการแจ้งเตือนที่เลือก
  const scrollToNotification = (id) => {
    const element = document.getElementById(`notification-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ฟังก์ชันตรวจสอบว่าเป็นการแจ้งเตือนใหม่หรือไม่
  const isNew = (date) => {
    const notificationDate = new Date(date);
    const currentDate = new Date();
    const timeDifference = currentDate - notificationDate;
    return timeDifference < 86400000; // 86400000 ms = 1 วัน
  };

  // ฟังก์ชัน markAsRead เพื่ออัปเดตสถานะการอ่าน
  const markAsRead = useCallback((id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications); // อัปเดตสถานะการอ่าน
  }, [notifications, setNotifications]);

  // ใช้ useEffect เพื่อเลื่อนไปยังการแจ้งเตือนที่เลือกจาก URL query
  useEffect(() => {
    const notificationId = new URLSearchParams(window.location.search).get('id');
    if (notificationId) {
      scrollToNotification(notificationId); // เลื่อนไปยังการแจ้งเตือนที่เลือก
      markAsRead(notificationId); // อัปเดตสถานะการอ่านหลังจากเลื่อนไปแล้ว
    }
  }, [notifications, markAsRead]); // ตรวจสอบเมื่อ notifications หรือ markAsRead เปลี่ยนแปลง

  // เรียงลำดับการแจ้งเตือนจากใหม่ไปเก่า
  const sortedNotifications = notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="notifications-page">
      <div className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          <img src="/img/back-icon.png" alt="Back" className="back-icon" />
          <span>Back</span>
        </button>
        <h1>Notifications</h1>
      </div>

      <section className="notifications-content">
        {sortedNotifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              id={`notification-${notification.id}`} // แก้ไข id ให้ถูกต้อง
              className={`notification-card ${!notification.read ? 'unread' : ''}`} // แก้ไข className ให้ถูกต้อง
              onClick={() => {
                markAsRead(notification.id); // เมื่อคลิกที่การแจ้งเตือนจะตั้งเป็น read
                scrollToNotification(notification.id); // เลื่อนไปยังการแจ้งเตือนที่คลิก
              }} 
            >
              {isNew(notification.date) && <span className="new-tag">New</span>}
              <div className="notification-header">
                <h2>{notification.plantName}</h2>
                <p className="notification-date">{notification.date}</p>
              </div>
              <p><strong>Time:</strong> {notification.time}</p>
              <p><strong>Confidence:</strong> {parseFloat(notification.confidence).toFixed(2)}%</p>
              <p><strong>Amount:</strong> {notification.documents} ต้น</p>
              <p><strong>Symptoms:</strong> {notification.symptoms}</p>
              <p><strong>Solutions:</strong> {notification.solutions}</p>
              <div className="notification-images">
                {notification.images.map((url, i) => (
                  <img key={i} src={url} alt={`Plant ${notification.plantName}`} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default Notifications;
