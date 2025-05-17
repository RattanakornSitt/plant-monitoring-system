import React, { useState, useEffect } from "react";
import { db } from "../pages/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import "./AddCameraPopup.css";

function AddCameraPopup({ isOpen, onClose, onAddCamera, username }) {
  const [cameraID, setCameraID] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [cameraIDExists, setCameraIDExists] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cameraID !== "") {
        checkCameraID();
      } else {
        setCameraIDExists(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [cameraID]);

  const checkCameraID = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "CAMERA_DATA"));
      let exists = false;
      const inputID = Number(cameraID);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (Number(data.ID) === inputID) {
          exists = true;
        }
      });

      setCameraIDExists(exists);
    } catch (error) {
      console.error("Error checking camera ID: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cameraIDExists) {
      alert("Camera ID ไม่ถูกต้องหรือไม่มีในระบบ กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    try {
      await addDoc(collection(db, "CAMERA"), {
        cameraID: Number(cameraID),
        cameraName,
        location,
        description,
        username, // ✅ เพิ่ม username ลงใน Firebase
      });

      const newCamera = {
        cameraID: Number(cameraID),
        cameraName,
        location,
        description,
        username, // ✅ เพิ่ม username ให้ state ด้วย (ถ้าใช้ต่อ)
      };
      onAddCamera(newCamera);
      onClose();
    } catch (error) {
      console.error("Error adding camera: ", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="add-camera-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Add Device</h3>
        <form onSubmit={handleSubmit}>
          <label className="camera-id-label">
            Device ID:
            <div className="input-wrapper">
              <input 
                type="text" 
                value={cameraID} 
                onChange={(e) => setCameraID(e.target.value)} 
                placeholder="Enter device ID (e.g., 001)" 
                required 
                className={cameraIDExists === false ? "input-error" : ""}
              />
              {cameraIDExists === true && (
                <span className="checkmark">&#10004;</span>
              )}
            </div>
            {cameraIDExists === false && (
              <span className="error-text">Device ID ไม่พบในระบบ</span>
            )}
          </label>

          <label>
            Device Name:
            <div className="input-wrapper">
              <input 
                type="text" 
                value={cameraName} 
                onChange={(e) => setCameraName(e.target.value)} 
                placeholder="e.g., Device 1" 
                required 
              />
            </div>
          </label>

          <label>
            Location:
            <div className="input-wrapper">
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., Greenhouse A" 
                required 
              />
            </div>
          </label>

          <label>
            Description:
            <div className="input-wrapper">
              <input 
                type="text"
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g., Butterhead plants" 
                required 
              />
            </div>
          </label>

          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}

export default AddCameraPopup;
