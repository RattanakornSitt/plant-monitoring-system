import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // ปรับตามโปรเจกต์จริง
import AddCameraPopup from "../components/AddCameraPopup";
import "./css/Services.css";

function Services() {
  const navigate = useNavigate();
  const [isAddCameraPopupOpen, setIsAddCameraPopupOpen] = useState(false);
  const [cameraList, setCameraList] = useState([]);
  const [editingCamera, setEditingCamera] = useState(null);
  const [cameraForm, setCameraForm] = useState({
    cameraName: "",
    location: "",
    description: "",
  });
  const username = localStorage.getItem("username"); // หรือจาก auth context ก็ได้

  // ใช้ onSnapshot เพื่อฟังการเปลี่ยนแปลงแบบเรียลไทม์
  useEffect(() => {
    const cameraRef = collection(db, "CAMERA");
    const q = query(cameraRef, where("username", "==", username));

    // ฟังก์ชัน onSnapshot จะถูกเรียกทุกครั้งที่ข้อมูลในฐานข้อมูลเปลี่ยนแปลง
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const cameras = [];
      querySnapshot.forEach((docSnap) => {
        cameras.push({ ...docSnap.data(), id: docSnap.id });
      });
      setCameraList(cameras); // อัพเดต cameraList แบบ real-time
    });

    // ค่าคืนจาก onSnapshot จะเป็นฟังก์ชันสำหรับยกเลิกการติดตามข้อมูล (unsubscribe)
    return () => unsubscribe();
  }, [username]);

  const handleAddCamera = (newCamera) => {
    setIsAddCameraPopupOpen(false); // ปิด popup เมื่อเพิ่มกล้องสำเร็จ
  };

  const handleDeleteCamera = async (cameraId) => {
    try {
      await deleteDoc(doc(db, "CAMERA", cameraId));
    } catch (error) {
      console.error("Error deleting camera:", error);
    }
  };

  const handleEditCamera = (camera) => {
    setEditingCamera(camera.id);
    setCameraForm({
      cameraName: camera.cameraName,
      location: camera.location || "",
      description: camera.description || "",
    });
  };

  const handleUpdateCamera = async () => {
    try {
      const cameraRef = doc(db, "CAMERA", editingCamera);
      await updateDoc(cameraRef, {
        cameraName: cameraForm.cameraName,
        location: cameraForm.location,
        description: cameraForm.description,
      });
      setEditingCamera(null);
      setCameraForm({
        cameraName: "",
        location: "",
        description: "",
      });
    } catch (error) {
      console.error("Error updating camera:", error);
    }
  };

  return (
    <div className="services-main-content">
      <button className="back-button" onClick={() => navigate('/pages/main')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <button className="overview-button" onClick={() => navigate('/pages/overview')}>
        Overview
      </button>

      <h2 className="services-title">Our Services</h2>
      <p className="welcome-message">Hello, welcome to the services page!</p>

      <div className="card-container">
        {/* การ์ดคงที่ Butterhead */}
        <div className="card">
          <img src="/img/plant-icon.png" alt="Camera 1" className="card-image" />
          <p className="card-title">Butterhead</p>
          <p className="card-id">ID: 100</p>
          <p className="card-location">Location: Greenhouse 1</p>
          <p className="card-description">Description: Butterhead</p>
          <button 
            className="details-button" 
            onClick={() => navigate("/pages/camera")}
          >
            More details
          </button>
          <button className="clear-camera-btn" disabled>&times;</button>
          <button 
              className="edit-camera-btn" 
            >
              ✏️
            </button>
        </div>

        {/* การ์ดจาก Firebase แบบ real-time */}
        {cameraList.map((camera) => (
          <div className="card" key={camera.id}>
            <img src="/img/plant-icon.png" alt={camera.cameraName} className="card-image" />
            <p className="card-title">{camera.cameraName}</p>
            <p className="card-id">ID: {camera.cameraID}</p>
            <p className="card-location">Location: {camera.location || "-"}</p>
            <p className="card-description">Description: {camera.description || "-"}</p>
            <button 
              className="details-button" 
              onClick={() => navigate(`/pages/${camera.cameraName}`)}
            >
              More details
            </button>
            <button 
              className="clear-camera-btn" 
              onClick={() => handleDeleteCamera(camera.id)}
            >
              &times;
            </button>
            <button 
              className="edit-camera-btn" 
              onClick={() => handleEditCamera(camera)}
            >
              ✏️
            </button>
          </div>
        ))}

        {/* ปุ่มเพิ่มกล้อง */}
        <div className="card">
          <img src="/img/plus-icon.png" alt="Add Camera" className="card-image" />
          <p className="card-title">Add Device</p>
          <button className="add-button" onClick={() => setIsAddCameraPopupOpen(true)}>Add</button>
        </div>
      </div>

      {editingCamera && (
  <div className="edit-camera-popup-modal">
    <div className="edit-camera-popup-form">
      <h3>Edit Device</h3>
      
      <label>Device Name</label>
      <input 
        type="text" 
        value={cameraForm.cameraName} 
        onChange={(e) => setCameraForm({...cameraForm, cameraName: e.target.value})} 
        placeholder="Enter device name"
      />
      
      <label>Location</label>
      <input 
        type="text" 
        value={cameraForm.location} 
        onChange={(e) => setCameraForm({...cameraForm, location: e.target.value})} 
        placeholder="Enter location"
      />
      
      <label>Description</label>
      <textarea 
        value={cameraForm.description} 
        onChange={(e) => setCameraForm({...cameraForm, description: e.target.value})} 
        placeholder="Enter description"
      ></textarea>
      
      <div className="edit-camera-popup-buttons-container">
        <button className="edit-camera-popup-save-button" onClick={handleUpdateCamera}>Save</button>
        <button className="edit-camera-popup-cancel-button" onClick={() => setEditingCamera(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}

      <AddCameraPopup 
        isOpen={isAddCameraPopupOpen} 
        onClose={() => setIsAddCameraPopupOpen(false)}
        onAddCamera={handleAddCamera}
        username={username}
      />
    </div>
  );
}

export default Services;
