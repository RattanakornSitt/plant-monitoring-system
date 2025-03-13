// src/pages/Camera.js

import React from 'react';
import { useNavigate } from 'react-router-dom'; // ใช้ useNavigate แทน Link
import './css/Camera.css';

function Camera() {
  const navigate = useNavigate(); // สร้างตัวแปร navigate สำหรับใช้ในการนำทาง

  return (
    <div className="camera-container">
      {/* ปุ่มย้อนกลับ */}
      <button className="back-button" onClick={() => navigate('/pages/services')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Camera</span>
      </button>
      <h2>Camera 1</h2>

      <div className="box-container">
        {/* กล่อง 1: Video Real Time */}
        <div className="box" onClick={() => navigate('/pages/realtimevideo')}>
          <img src="/img/video-icon.png" alt="Video Real Time" className="box-image" />
          <p className="box-title">Video real time</p>
        </div>

        {/* กล่อง 2: Plant Information */}
        <div className="box" onClick={() => navigate('/pages/plantinfo')}>
          <img src="/img/plant-info.png" alt="Plant Information" className="box-image" />
          <p className="box-title">Plant information</p>
        </div>

        {/* กล่อง 3: Statistics */}
        <div className="box" onClick={() => navigate('/pages/statistics')}>
          <img src="/img/graph.png" alt="Statistics" className="box-image" />
          <p className="box-title">Statistics</p>
        </div>

        {/* กล่อง Album */}
        <div className="box" onClick={() => navigate('/pages/albums-test')}>
          <img src="/img/album.png" alt="Album" className="box-image" />
          <p className="box-title">Albums</p>
        </div>
      </div>
    </div>
  );
}

export default Camera;
