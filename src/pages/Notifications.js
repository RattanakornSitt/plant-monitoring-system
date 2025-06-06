import React, { useContext, useEffect, useCallback, useState } from 'react';
import { NotificationContext } from '../components/NotificationContext';
import './css/Notifications.css';

function Notifications() {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [selectedDate, setSelectedDate] = useState(''); // เก็บวันที่เลือก (รูปแบบ YYYY-MM-DD)
  const [selectedImage, setSelectedImage] = useState(null);

   const openImage = (imgUrl) => {
    setSelectedImage(imgUrl);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const scrollToNotification = (id) => {
    const element = document.getElementById(`notification-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

    const removeNotificationFromView = useCallback((id) => {
    const updatedNotifications = notifications.filter((n) => n.id !== id);
    setNotifications(updatedNotifications);
  }, [notifications, setNotifications]);

  const isNew = (date) => {
    if (!date) return false;
    const notificationDate = new Date(date);
    if (isNaN(notificationDate.getTime())) return false;
    const currentDate = new Date();
    const timeDifference = currentDate - notificationDate;
    return timeDifference < 86400000;
  };

  const markAsRead = useCallback((id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id && !notification.read
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);

    const readStatusMap = JSON.parse(localStorage.getItem('readNotifications') || '{}');
    readStatusMap[id] = true;
    localStorage.setItem('readNotifications', JSON.stringify(readStatusMap));
  }, [notifications, setNotifications]);

  useEffect(() => {
    const notificationId = new URLSearchParams(window.location.search).get('id');
    if (notificationId) {
      scrollToNotification(notificationId);
      markAsRead(notificationId);
    }

    const readStatusMap = JSON.parse(localStorage.getItem('readNotifications') || '{}');
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: readStatusMap[notification.id] || notification.read,
    }));
    setNotifications(updatedNotifications);
  }, [markAsRead, notifications, setNotifications]);

  // เรียงลำดับจากใหม่สุดไปเก่าสุด โดยใช้ date + time
  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA;
  });

  // กรองการแจ้งเตือนตาม selectedDate
  const filteredNotifications = selectedDate
    ? sortedNotifications.filter((n) => n.date === selectedDate)
    : sortedNotifications;

  return (
    <div className="notifications-page">
      <div className="header">
        <button className="back-button" onClick={() => window.history.back()}>
          <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        </button>
        <h1>Notifications</h1>
      </div>

      {/* เพิ่ม input เลือกวันที่ */}
      <div className="date-filter-wrapper">
        <div className="date-filter-container">
        <label htmlFor="datePicker">Filter by date: </label>
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // ไม่เลือกวันอนาคตได้
        />
        {selectedDate && (
          <button onClick={() => setSelectedDate('')}>Clear</button>
        )}
        </div>
      </div>

      <section className="notifications-content">
        {filteredNotifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              id={`notification-${notification.id}`}
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
              onClick={() => {
                markAsRead(notification.id);
                scrollToNotification(notification.id);
              }}
            >
              {isNew(notification.date) && <span className="new-tag">New</span>}
              
               {/* ปุ่มลบ */}
                <button
                  className="delete-noti-button"
                  onClick={(e) => {
                    e.stopPropagation(); // ป้องกันไม่ให้ event หลักถูกเรียก
                    removeNotificationFromView(notification.id);
                  }}
                  title="Delete notification"
                >
                  Delete
                </button>

              <div className="notification-header">
                <h2>{notification.plantName}</h2>
                <p className="notification-date">{notification.date}</p>
              </div>
              <p><strong>Device ID:</strong> {notification.product}</p>
              <p><strong>Time:</strong> {notification.time}</p>
              <p><strong>Confidence:</strong> {parseFloat(notification.confidence).toFixed(2)}%</p>
              <p><strong>Amount:</strong> {notification.documents} ต้น</p>
              <p><strong>Symptoms:</strong> {notification.symptoms}</p>
              <p><strong>Solutions:</strong> {notification.solutions}</p>
              <div className="notification-images">
                {notification.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Plant"
                    onClick={() => openImage(url)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
          ))         
        )}
      </section>
      {/* Modal แสดงภาพขนาดใหญ่ */}
      {selectedImage && (
        <div className="modal-overlay-noti" onClick={closeImage}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="Expanded" />
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
