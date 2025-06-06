import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ใช้ useNavigate แทน Link
import './css/Camera.css';

function Camera() {
  const navigate = useNavigate(); // สร้างตัวแปร navigate สำหรับใช้ในการนำทาง
 const location = useLocation();

  // ✅ ดึงค่าจาก query string
  const queryParams = new URLSearchParams(location.search);
  const product = queryParams.get('product') || 'No product info';
  const cameraName = queryParams.get('cameraName') || 'Unknown camera';

// ✅ ฟังก์ชันช่วย navigate พร้อมส่ง query string
  const goToPage = (path) => {
    navigate(`${path}?product=${product}&cameraName=${encodeURIComponent(cameraName)}`);
  };

  return (
    <div className="camera-page-container">
      {/* ปุ่มย้อนกลับ */}
      <button className="back-button" onClick={() => navigate('/pages/services')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1 className="camera-page-title">{cameraName}</h1>
      {/*<h2 className="camera-page-title">Product ID: {product}</h2>*/}
      <div className="camera-page-box-container">
        {/* กล่อง 1: Video Real Time */}
        <div className="camera-page-box" onClick={() => goToPage('/pages/realtimevideo')}>
          <img src="/img/video-icon.png" alt="Video Real Time" className="camera-page-box-image" />
          <p className="camera-page-box-title">Video real time</p>
        </div>

        {/* กล่อง 2: Plant Information */}
        <div className="camera-page-box" onClick={() => goToPage('/pages/plantinfo')}>
          <img src="/img/plant-info.png" alt="Plant Information" className="camera-page-box-image" />
          <p className="camera-page-box-title">Plant information</p>
        </div>

        {/* กล่อง 3: Statistics */}
        <div className="camera-page-box" onClick={() => goToPage('/pages/statistics')}>
          <img src="/img/graph.png" alt="Statistics" className="camera-page-box-image" />
          <p className="camera-page-box-title">Statistics</p>
        </div>

        {/* กล่อง Album */}
        <div className="camera-page-box" onClick={() => goToPage('/pages/albums-test')}>
          <img src="/img/album.png" alt="Album" className="camera-page-box-image" />
          <p className="camera-page-box-title">Albums</p>
        </div>
      </div>
    </div>
  );
}

export default Camera;
