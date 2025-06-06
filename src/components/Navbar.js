import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from './NotificationContext';

const Navbar = ({ user, handleLogOut }) => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const popoverRef = useRef(null);

  const unreadNotifications =
  user?.username === "rattanakorn123"
    ? notifications.filter(n => !n.read).length
    : 0;

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Retrieve notifications from localStorage when the component mounts
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, [setNotifications]);

  // Save unread notifications count to localStorage
  useEffect(() => {
    if (unreadNotifications !== null) {
      localStorage.setItem('unreadNotifications', unreadNotifications);
    }
  }, [unreadNotifications]);

  // Retrieve unread notifications count from localStorage
  useEffect(() => {
    const savedUnreadNotifications = localStorage.getItem('unreadNotifications');
    if (savedUnreadNotifications) {
      // We don't need setUnreadNotifications anymore, as we just calculate it from notifications
      // If you want to directly update some state, you can consider using state for unread count
    }
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  const isNew = (date, time) => {
    const combinedDateTimeStr = `${date}T${time}`;
    const notificationTime = new Date(combinedDateTimeStr);
    const now = new Date();

    if (isNaN(notificationTime)) {
      console.error("Invalid DateTime:", combinedDateTimeStr);
      return false;
    }

    return now - notificationTime < 86400000; // ภายใน 24 ชั่วโมง
  };

  const formatNotificationDate = (date, time) => {
    const combinedDateTimeStr = `${date}T${time}`;
    const notificationTime = new Date(combinedDateTimeStr);
    return notificationTime.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.user-profile-dropdown')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewAllClick = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/pages/main">
          <img src="/img/logo.png" alt="Logo" />
        </Link>
        <h1>Plant Monitoring System</h1>
      </div>

      <div className="nav-links">
        <Link to="/pages/services">Services</Link>
        <Link to="/pages/aboutus">About Us</Link>
        <Link to="/pages/support">Support</Link>

      {user && (
      <div className="notification-container">
        <div className="notification-icon" onClick={toggleNotifications}>
          <img src="/img/bell-icon.png" alt="Notifications" className="bell-icon" />
          {unreadNotifications > 0 && (
            <span className="notification-count">{unreadNotifications}</span>
          )}
        </div>

        {showNotifications && user.username === "rattanakorn123" && (
          <div className="notification-popover" ref={popoverRef}>
            <h3>Recent Notifications</h3>
            <ul className="notification-list">
              {Array.isArray(notifications) && notifications.length > 0 ? (
                [...notifications]
                  .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
                  .slice(0, 3)
                  .map((notification) => (
                    <li
                      key={notification.id}
                      className={notification.read ? '' : 'unread'}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Link
                        to="/pages/Notifications"
                        onClick={() => {
                          setShowNotifications(false);
                        }}
                      >
                        {isNew(notification.date, notification.time) && <span className="new-tag">New</span>}
                        <small>
                          {formatNotificationDate(notification.date, notification.time)}{" "}
                          {notification.description}
                        </small>
                      </Link>
                    </li>
                  ))
              ) : (
                <p>No notifications available.</p>
              )}
            </ul>
            <Link to="/pages/Notifications" className="view-all-link" onClick={() => {
              setShowNotifications(false);
              handleViewAllClick();
            }}>
              View All
            </Link>
          </div>
        )}
      </div>
    )}

        {user ? (
          <div className="user-profile-dropdown">
            <div className="user-profile" onClick={() => setShowUserMenu(prev => !prev)}>
              <img src="/img/user.png" alt="User" className="user-photo" />
              <span className="user-name">{user.username}</span>
            </div>

            {showUserMenu && (
              <div className="dropdown-menu">
                <Link to="/pages/realtime" onClick={() => setShowUserMenu(false)}>Video Real Time</Link>
                <Link to="/pages/plantinfo" onClick={() => setShowUserMenu(false)}>Plant Info</Link>
                <Link to="/pages/statistics" onClick={() => setShowUserMenu(false)}>Statistics</Link>
                <Link to="/pages/albums-test" onClick={() => setShowUserMenu(false)}>Albums</Link>
                
                {/* Conditionally render the "Administrator" link if the username is 'Admin' */}
                {user.username === "Admin" && (
                  <Link to="/pages/admindashboard" onClick={() => setShowUserMenu(false)}>Administrator</Link>
                )}

                <button onClick={() => {
                  setShowUserMenu(false);
                  handleLogOut();
                }}>Log out</button>
              </div>
            )}
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
