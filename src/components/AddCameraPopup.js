// src/components/AddCameraPopup.js
import React, { useState } from "react";
import { db } from "../pages/firebaseConfig";  // นำเข้า Firebase config
import { collection, addDoc } from "firebase/firestore";  // ฟังก์ชันสำหรับเพิ่มข้อมูล
import "./AddCameraPopup.css";

function AddCameraPopup({ isOpen, onClose, onAddCamera }) {
  const [cameraID, setCameraID] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "CAMERA"), {
        cameraID,
        cameraName,
        location,
        description,
      });
      // ส่งข้อมูลกล้องกลับไปยังหน้า Services
      const newCamera = { cameraID, cameraName, location, description };
      onAddCamera(newCamera); // ส่งข้อมูลใหม่กลับไปยัง parent component

      onClose(); // ปิด Popup หลังจากเพิ่มข้อมูล
    } catch (error) {
      console.error("Error adding camera: ", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="add-camera-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Add Camera</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Camera ID:
            <input 
              type="text" 
              value={cameraID} 
              onChange={(e) => setCameraID(e.target.value)} 
              required 
            />
          </label>
          <label>
            Camera Name:
            <input 
              type="text" 
              value={cameraName} 
              onChange={(e) => setCameraName(e.target.value)} 
              required 
            />
          </label>
          <label>
            Location:
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required 
            />
          </label>
          <label>
            Description:
            <input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
            />
          </label>
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}

export default AddCameraPopup;
