import React, { useState, useEffect } from 'react';
import './css/RealTimeVideo.css';
import { db, onSnapshot } from './firebaseConfig'; // นำเข้า firebase functions
import { collection } from "firebase/firestore";

function RealTimeVideo() {
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลจาก Firestore collection config (Real-time)
    const videoCollectionRef = collection(db, 'config'); // Collection ชื่อ config
    
    // การดึงข้อมูลแบบ Real-time
    const unsubscribe = onSnapshot(videoCollectionRef, (querySnapshot) => {
      querySnapshot.forEach((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.url) {
            setVideoSrc(data.url); // ตั้งค่า videoSrc จาก field 'url'
          }
        }
      });
    }, (error) => {
      console.error('Error fetching video URL:', error);
    });

    // Cleanup listener when the component unmounts
    return () => unsubscribe();
  }, []); // ใช้ [] เพื่อให้ทำงานแค่ครั้งเดียวเมื่อ component mount

  // ฟังก์ชันขยายวีดิโอเป็นเต็มจอ
  const handleFullScreen = () => {
    const videoElement = document.getElementById('realTimeVideo');
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.mozRequestFullScreen) { // Firefox
      videoElement.mozRequestFullScreen();
    } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) { // IE/Edge
      videoElement.msRequestFullscreen();
    }
  };

  return (
    <div className="real-time-video-container">
      <button className="back-button" onClick={() => window.history.back()}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Back</span>
      </button>

      <section className="real-time-video-content">
        <h1>Real-time Video Example</h1>

        <div className="video-box">
          <video id="realTimeVideo" controls autoPlay>
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
            Your browser does not support the video tag.
          </video>
          {/* ปุ่มขยายวีดิโอ */}
          <button className="fullscreen-button" onClick={handleFullScreen}>
            Fullscreen
          </button>
        </div>
      </section>
    </div>
  );
}

export default RealTimeVideo;
