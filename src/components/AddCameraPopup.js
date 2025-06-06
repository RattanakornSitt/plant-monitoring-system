import React, { useState, useEffect } from "react";
import { db } from "../pages/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import "./AddCameraPopup.css";

function AddCameraPopup({ isOpen, onClose, onAddCamera, username }) {
  const [product, setCameraID] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [cameraIDExists, setCameraIDExists] = useState(null);
  const [cameraIDRegistered, setCameraIDRegistered] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (product !== "") {
        checkCameraID();
      } else {
        setCameraIDExists(null);
        setCameraIDRegistered(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [product]);

  const checkCameraID = async () => {
    try {
      const inputID = Number(product);
      
      // ตรวจสอบว่า ID มีอยู่ใน CAMERA_DATA หรือไม่
      const cameraDataSnapshot = await getDocs(collection(db, "CAMERA_DATA"));
      let existsInData = false;

      cameraDataSnapshot.forEach((doc) => {
        const data = doc.data();
        if (Number(data.ID) === inputID) {
          existsInData = true;
        }
      });

      setCameraIDExists(existsInData);

      // ตรวจสอบว่า ID ถูกลงทะเบียนใน CAMERA แล้วหรือไม่
      if (existsInData) {
        const cameraSnapshot = await getDocs(
          query(collection(db, "CAMERA"), where("product", "==", inputID))
        );
        
        const isRegistered = !cameraSnapshot.empty;
        setCameraIDRegistered(isRegistered);
      } else {
        setCameraIDRegistered(null);
      }

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

    if (cameraIDRegistered) {
      alert("Camera ID นี้ถูกลงทะเบียนแล้ว กรุณาใช้ ID อื่น");
      return;
    }

    try {
      await addDoc(collection(db, "CAMERA"), {
        product: Number(product),
        cameraName,
        location,
        description,
        username,
      });

      const newCamera = {
        product: Number(product),
        cameraName,
        location,
        description,
        username,
      };
      onAddCamera(newCamera);
      onClose();
    } catch (error) {
      console.error("Error adding camera: ", error);
    }
  };

  // เงื่อนไขสำหรับปุ่ม Submit
  const isSubmitDisabled = !cameraIDExists || cameraIDRegistered;

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
                value={product} 
                onChange={(e) => setCameraID(e.target.value)} 
                placeholder="Enter device ID (e.g., 001)" 
                required 
                className={
                  cameraIDExists === false || cameraIDRegistered === true 
                    ? "input-error" 
                    : ""
                }
              />
              {cameraIDExists === true && cameraIDRegistered === false && (
                <span className="checkmark">&#10004;</span>
              )}
            </div>
            
            {cameraIDExists === false && (
              <span className="error-text">Device ID ไม่พบในระบบ</span>
            )}
            
            {cameraIDRegistered === true && (
              <span className="error-text">Device ID นี้ถูกลงทะเบียนแล้ว</span>
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

          <button 
            type="submit" 
            disabled={isSubmitDisabled}
            style={{
              opacity: isSubmitDisabled ? 0.5 : 1,
              cursor: isSubmitDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCameraPopup;