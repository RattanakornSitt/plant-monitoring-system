import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from './NotificationContext';

const Navbar = ({ user, handleLogOut }) => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const popoverRef = useRef(null);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // ฟังก์ชัน markAsRead เพื่ออัปเดตสถานะการอ่านใน NotificationContext
  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    // ส่งข้อมูลที่อัปเดตไปที่ NotificationContext
    setNotifications(updatedNotifications);
  };

  // ฟังก์ชันตรวจสอบว่าเป็นการแจ้งเตือนใหม่หรือไม่
  const isNew = (date) => {
    const notificationDate = new Date(date);
    const currentDate = new Date();
    const timeDifference = currentDate - notificationDate;
    return timeDifference < 86400000; // 86400000 ms = 1 วัน
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/pages/dashboard">
          <img src="/img/logo.png" alt="Logo" />
        </Link>
        <h1>Plant Monitoring System</h1>
      </div>
      <div className="nav-links">
        <Link to="#services">Services</Link>
        <Link to="#about">About Us</Link>
        <Link to="#support">Support</Link>

        {user && (
          <div className="notification-container">
            <div className="notification-icon" onClick={toggleNotifications}>
              <img src="/img/bell-icon.png" alt="Notifications" className="bell-icon" />
              {unreadNotifications > 0 && (
                <span className="notification-count">{unreadNotifications}</span>
              )}
            </div>
            {showNotifications && (
              <div className="notification-popover" ref={popoverRef}>
                <h3>Recent Notifications</h3>
                <ul className="notification-list">
                  {Array.isArray(notifications) && notifications.length > 0 ? (
                    notifications.slice(0, 3).map((notification, index) => (
                      <li 
                        key={index} 
                        className={notification.read ? '' : 'unread'}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Link 
                          to="/pages/Notifications" // ไปยังหน้า Notifications
                          onClick={() => {
                            // ใช้ scrollIntoView เพื่อเลื่อนไปที่การแจ้งเตือน
                            const notificationElement = document.getElementById(`notification-${notification.id}`);
                            if (notificationElement) {
                              notificationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            // เมื่อคลิกที่การแจ้งเตือนให้ตั้งค่า read
                            markAsRead(notification.id);
                          }}
                        >
                          {isNew(notification.date) && <span className="new-tag">New</span>}
                          <small>{notification.date} {notification.description}</small>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <p>No notifications available.</p>
                  )}
                </ul>
                <Link to="/pages/Notifications" className="view-all-link" onClick={() => setShowNotifications(false)}>
                  View All
                </Link>
              </div>
            )}
          </div>
        )}

        {user ? (
          <div className="user-profile">
            <img src="/img/user.png" alt="User" className="user-photo" />
            <span>{user.displayName}</span>
            <button className="logout-btn" onClick={handleLogOut}>
              Log out
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="login-btn">Log in</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
