import React, { useContext, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Camera from './pages/Camera';
import PlantInfo from './pages/PlantInfo';
import RealTimeVideo from './pages/RealTimeVideo';
import AboutUs from './pages/AboutUs';
import AlbumT from './pages/Album1';
import Album1T from './pages/Album2';
import Album2T from './pages/Album3';
import Album_T from './pages/Albums-test';
import Main from "./pages/main";
import Statistics from "./pages/Statistics";
import { NotificationContext } from "./components/NotificationContext";
import Notifications from "./pages/Notifications";
import Layout from './components/Layout';
import AddCameraPopup from "./components/AddCameraPopup"; // นำเข้า Popup
import { UserProvider } from "./pages/UserContext"; // นำเข้า UserProvider
import HelloPopup from './pages/HelloPopup';
import NotificationPopup from './components/NotificationPopup';
import CameraPage from './pages/CameraPage';  // นำเข้าเพจกล้องใหม่
import './App.css';
import { NotificationProvider } from './components/NotificationContext';

function AppContent() {
  const [isLogInPopupOpen, setIsLogInPopupOpen] = useState(false);
  const { showPopup, setShowPopup, newNotification } = useContext(NotificationContext);
  const [isHelloPopupOpen, setIsHelloPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  const [setUser] = useState(null);  // State to hold logged-in user data
  const [isPopupOpen, setIsPopupOpen] = useState(false);  // State for the login reminder popup
  const [isAddCameraPopupOpen, setIsAddCameraPopupOpen] = useState(false); // State สำหรับ Add Camera Popup
  const [ setCameras] = useState([ // State สำหรับจัดการกล้อง
    { cameraID: "0001", cameraName: "Camera 1", image: "/img/plant-icon.png" }
  ]);
  const location = useLocation(); // Get current route

  const toggleLogInPopup = () => {
    setIsLogInPopupOpen(!isLogInPopupOpen);
    setIsSignUpPopupOpen(false);
  };

  const toggleSignUpPopup = () => {
    setIsSignUpPopupOpen(!isSignUpPopupOpen);
    setIsLogInPopupOpen(false);
  };

  const handleServicesClick = () => {
      setIsHelloPopupOpen(true); // Show login popup if the user is not logged in
  };
  const handleClosePopup = () => {
    setIsHelloPopupOpen(false);  // ปิด Popup
  };

  const handleAddCamera = (newCamera) => {
    setCameras((prevCameras) => [
      { ...newCamera, image: "/img/plant-icon.png" }, // เพิ่มกล้องใหม่
      ...prevCameras,
    ]);
    setIsAddCameraPopupOpen(false); // ปิด Popup หลังเพิ่ม
  };

  // Conditional rendering: Only show Navbar, Popups, and Footer on specific pages
  const showNavbarAndFooter = location.pathname === '/' || location.pathname === '/pages/home';

  return (
    <div className="App">
      {/* Navbar and Footer only for certain routes */}
      {showNavbarAndFooter && (
        <nav className="navbar">
          <div className="logo">
            <a href="/">
              <img src="/img/logo.png" alt="Logo" />
            </a>
            <h1>Plant Monitoring System</h1>
          </div>
          <div className="nav-links">
            <a href="#services" onClick={handleServicesClick}>Services</a>  {/* Trigger login popup */}
            <a href="#about">About Us</a>
            <a href="#support">Support</a>
            <button className="login-btn" onClick={toggleLogInPopup}>Log in</button>
          </div>
        </nav>
      )}
    
      <Routes>
        {/* Route for Home page (No Layout needed here) */}
        <Route path="/" element={
          <main className="main-content" style={{
            backgroundImage: "url('/img/wallpaper.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}>
            <h2>Welcome to the Plant Monitoring System</h2>
            <p>ระบบติดตามพืชและตรวจสอบสภาพพืช แจ้งเตือนปัญหาและให้คำแนะนำดูแล เพื่อการเกษตรที่ชาญฉลาด!</p>
            <div className="auth-buttons">
              <button className="login-btn" onClick={toggleLogInPopup}>Log in</button>
              <button className="sign-in-btn" onClick={toggleSignUpPopup}>Sign up</button>
            </div>
          </main>
        } />

        {/* Layout used for all other pages */}
        <Route path="/pages/home" element={<Layout><Home toggleLogInPopup={toggleLogInPopup} toggleSignUpPopup={toggleSignUpPopup} /></Layout>} />
        <Route path="/pages/services" element={<Layout><Services /></Layout>} />
        <Route path="/pages/camera" element={<Layout><Camera /></Layout>} />
        <Route path="/pages/realtimevideo" element={<Layout><RealTimeVideo /></Layout>} />
        <Route path="/pages/aboutus" element={<Layout><AboutUs /></Layout>} />
        <Route path="/pages/plantinfo" element={<Layout><PlantInfo /></Layout>} />
        <Route path="/pages/album1" element={<Layout><AlbumT /></Layout>} />
        <Route path="/pages/Notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/pages/Statistics" element={<Layout><Statistics /></Layout>} />
        <Route path="/pages/album2/:date" element={<Layout><Album1T /></Layout>} />
        <Route path="/pages/album3/:date/:hour" element={<Layout><Album2T /></Layout>} />
        <Route path="/pages/main" element={<Layout><Main /></Layout>} />
        <Route path="/pages/NotificationContext" element={<Layout><NotificationContext /></Layout>} />
        <Route path="/pages/albums-test" element={<Layout><Album_T/></Layout>} />
        <Route path="/pages/:cameraName" element={<Layout><CameraPage /></Layout>} />
      </Routes>

      {/* Show popups if they are open */}
      {isLogInPopupOpen && <LogIn togglePopup={toggleLogInPopup} toggleToSignUp={toggleSignUpPopup} setUser={setUser} />}
      {isSignUpPopupOpen && <SignUp togglePopup={toggleSignUpPopup} toggleToLogIn={toggleLogInPopup} />}

      {/* Popup to show if the user is not logged in */}
      {isPopupOpen && (
        <div className="popup-overlay" onClick={() => setIsPopupOpen(false)}>
          <div className="happy-popup">
            <p className="happy-title">Please login to<br />access our services</p>
            <img src="/img/veggy-2.png" alt="Happy Icon" className="happy-icon" />
          </div>
        </div>
      )}
      {/* แสดง HelloPopup ถ้า isHelloPopupOpen เป็น true */}
      {isHelloPopupOpen && <HelloPopup onClose={handleClosePopup} />}
      {isAddCameraPopupOpen && (
          <AddCameraPopup
            isOpen={isAddCameraPopupOpen}
            onClose={() => setIsAddCameraPopupOpen(false)}
            onAddCamera={handleAddCamera}
          />
        )}
      {showPopup && newNotification && (
        <NotificationPopup notification={newNotification} onClose={() => setShowPopup(false)} />
      )}

      {/* Footer only for certain routes */}
      {showNavbarAndFooter && (
        <footer className="footer">
          <p>&copy; 2024 Plant Monitoring System</p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <UserProvider> {/* ห่อส่วนทั้งหมดด้วย UserProvider */}
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
