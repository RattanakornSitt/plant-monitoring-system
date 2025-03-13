// src/pages/Services.js

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // ใช้ useNavigate
import AddCameraPopup from "../components/AddCameraPopup";  // นำเข้า Popup component
import "./css/Services.css";

function Services() {
  const navigate = useNavigate(); // สร้างตัว navigate สำหรับการนำทาง
  const [isAddCameraPopupOpen, setIsAddCameraPopupOpen] = useState(false); // State สำหรับเปิด/ปิด Popup
  const [cameraList, setCameraList] = useState([]);  // State สำหรับเก็บข้อมูลกล้องที่เพิ่มใหม่

 // โหลดข้อมูลกล้องจาก localStorage เมื่อโหลดหน้าเว็บ
 useEffect(() => {
  const savedCameras = JSON.parse(localStorage.getItem("cameraList")) || [];
  setCameraList(savedCameras);
}, []);

const handleAddCamera = (newCamera) => {
  const updatedCameraList = [newCamera, ...cameraList];
  setCameraList(updatedCameraList);

  // เก็บข้อมูลใหม่ลงใน localStorage
  localStorage.setItem("cameraList", JSON.stringify(updatedCameraList));
  setIsAddCameraPopupOpen(false);  // ปิด Popup
};

const handleClearCameraData = () => {
  localStorage.removeItem("cameraList"); // ลบข้อมูลกล้อง
  setCameraList([]); // รีเซ็ต state cameraList
};

  return (
    <div className="services-main-content">
      {/* ปุ่มย้อนกลับ */}
      <button className="back-button" onClick={() => navigate('/pages/main')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h2 className="services-title">Our Services</h2>
      <p className="welcome-message">HI, welcome to the services page!</p>

      <div className="card-container">
        <div className="card">
          <img src="/img/plant-icon.png" alt="Camera 1" className="card-image" />
          <p className="card-title">Camera 1</p>
          <p className="card-id">ID: 0001</p>
          <button 
            className="details-button" 
            onClick={() => navigate("/pages/camera")}
          >
            More details
          </button>
        </div>
        {/* เพิ่มข้อมูลกล้อง */}
      <div className="card-container">
        {cameraList.map((camera, index) => (
          <div className="card" key={index}>
            <img src="/img/plant-icon.png" alt={camera.cameraName} className="card-image" />
            <p className="card-title">{camera.cameraName}</p>
            <p className="card-id">ID: {camera.cameraID}</p>
            <button 
              className="details-button" 
              onClick={() => navigate(`/pages/${camera.cameraName}`)} // ปรับ path ตามชื่อกล้อง
            >
              More details
            </button>
            <button onClick={handleClearCameraData}>Clear Camera Data</button>
          </div>
        ))}
      </div>

        <div className="card">
          <img src="/img/plus-icon.png" alt="Add Camera" className="card-image" />
          <p className="card-title">Add camera</p>
          <button className="add-button" onClick={() => setIsAddCameraPopupOpen(true)}>Add</button>
        </div>
      </div>
      {/* แสดง Popup เมื่อเปิด */}
      <AddCameraPopup 
        isOpen={isAddCameraPopupOpen} 
        onClose={() => setIsAddCameraPopupOpen(false)}
        onAddCamera={handleAddCamera}  // ส่งฟังก์ชันไปยัง Popup
      />
    </div>
  );
}

export default Services;
