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
import Overview from "./pages/overview";
import Statistics from "./pages/Statistics";
import { NotificationContext } from "./components/NotificationContext";
import Notifications from "./pages/Notifications";
import Layout from './components/Layout';
import AddCameraPopup from "./components/AddCameraPopup"; // นำเข้า Popup
import { UserProvider } from "./pages/UserContext"; // นำเข้า UserProvider
import HelloPopup from './pages/HelloPopup';
import NotificationPopup from './components/NotificationPopup';
import CameraPage from './pages/CameraPage';  // นำเข้าเพจกล้องใหม่
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import ManageUser from "./pages/ManageUser";
import ManageSystemProblems from "./pages/ManageProblems";
import ProtectedRoute from './pages/PrivateRoute'; 
import './App.css';
import { NotificationProvider } from './components/NotificationContext';

function AppContent() {
  const [isLogInPopupOpen, setIsLogInPopupOpen] = useState(false);
  const { showPopup, setShowPopup, newNotification } = useContext(NotificationContext);
  const [isHelloPopupOpen, setIsHelloPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  const { setNewNotification } = useContext(NotificationContext);
  const [setUser] = useState(null);  // State to hold logged-in user data
  const [isPopupOpen, setIsPopupOpen] = useState(false);  // State for the login reminder popup
  const [isAddCameraPopupOpen, setIsAddCameraPopupOpen] = useState(false); // State สำหรับ Add Camera Popup
  const [setCameras] = useState([ // State สำหรับจัดการกล้อง
    { cameraID: "0001", cameraName: "Camera 1", image: "/img/plant-icon.png" }
  ]);
  const location = useLocation(); // Get current route

  // ฟังก์ชันเปิด/ปิด Popup

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
            <a href="/pages/aboutus">About Us</a>
            <a href="/pages/support">Support</a>
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

         {/* หน้าเข้าถึงได้เสมอ */}
        <Route path="/pages/aboutus" element={<Layout><AboutUs /></Layout>} />
        <Route path="/pages/support" element={<Layout><Support /></Layout>} />
        {/* Layout used for all other pages */}
        <Route path="/pages/home" element={<ProtectedRoute><Layout><Home toggleLogInPopup={toggleLogInPopup} toggleSignUpPopup={toggleSignUpPopup} /></Layout></ProtectedRoute>} />
        <Route path="/pages/services" element={<ProtectedRoute><Layout><Services /></Layout></ProtectedRoute>} />
        <Route path="/pages/camera" element={<ProtectedRoute><Layout><Camera /></Layout></ProtectedRoute>} />
        <Route path="/pages/realtimevideo" element={<ProtectedRoute><Layout><RealTimeVideo /></Layout></ProtectedRoute>} />
        <Route path="/pages/plantinfo" element={<ProtectedRoute><Layout><PlantInfo /></Layout></ProtectedRoute>} />
        <Route path="/pages/album1" element={<ProtectedRoute><Layout><AlbumT /></Layout></ProtectedRoute>} />
        <Route path="/pages/Notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
        <Route path="/pages/Statistics" element={<ProtectedRoute><Layout><Statistics /></Layout></ProtectedRoute>} />
        <Route path="/pages/album2/:date" element={<ProtectedRoute><Layout><Album1T /></Layout></ProtectedRoute>} />
        <Route path="/pages/album3/:date/:hour" element={<ProtectedRoute><Layout><Album2T /></Layout></ProtectedRoute>} />
        <Route path="/pages/main" element={<ProtectedRoute><Layout><Main /></Layout></ProtectedRoute>} />
        <Route path="/pages/AdminDashboard" element={<ProtectedRoute><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
        <Route path="/pages/overview" element={<ProtectedRoute><Layout><Overview /></Layout></ProtectedRoute>} />
        <Route path="/pages/ManageUser" element={<ProtectedRoute><Layout><ManageUser /></Layout></ProtectedRoute>} />
        <Route path="/pages/ManageProblems" element={<ProtectedRoute><Layout><ManageSystemProblems /></Layout></ProtectedRoute>} />
        <Route path="/pages/NotificationContext" element={<ProtectedRoute><Layout><NotificationContext /></Layout></ProtectedRoute>} />
        <Route path="/pages/albums-test" element={<ProtectedRoute><Layout><Album_T /></Layout></ProtectedRoute>} />
        <Route path="/pages/:cameraName" element={<ProtectedRoute><Layout><CameraPage /></Layout></ProtectedRoute>} />
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
          <NotificationPopup 
            notification={newNotification} 
            onClose={() => {
              setShowPopup(false);  // รีเซ็ตสถานะของ showPopup
              setNewNotification(null);  // รีเซ็ต newNotification ถ้าต้องการ
            }} 
          />
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
