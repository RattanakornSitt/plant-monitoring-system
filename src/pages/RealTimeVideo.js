import React, { useState, useEffect } from 'react';
import './css/RealTimeVideo.css';
import { db, onSnapshot } from './firebaseConfig';
import { collection } from "firebase/firestore";
import { useLocation } from 'react-router-dom';

function RealTimeVideo() {
  const [videoSrc, setVideoSrc] = useState('');
  const location = useLocation();

  // ดึง query string จาก URL
  const queryParams = new URLSearchParams(location.search);
  const product = Number(queryParams.get('product'));
  const cameraName = queryParams.get('cameraName');

  useEffect(() => {
    if (!product) return;

    const videoCollectionRef = collection(db, 'settings');

    const unsubscribe = onSnapshot(videoCollectionRef, (querySnapshot) => {
      querySnapshot.forEach((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.product === product && data.ngrok_url) {
            setVideoSrc(data.ngrok_url);
          }
        }
      });
    }, (error) => {
      console.error('Error fetching video URL:', error);
    });

    return () => unsubscribe();
  }, [product]);

  const handleFullScreen = () => {
    const iframeElement = document.getElementById('realTimeVideo');
    if (iframeElement.requestFullscreen) {
      iframeElement.requestFullscreen();
    } else if (iframeElement.mozRequestFullScreen) {
      iframeElement.mozRequestFullScreen();
    } else if (iframeElement.webkitRequestFullscreen) {
      iframeElement.webkitRequestFullscreen();
    } else if (iframeElement.msRequestFullscreen) {
      iframeElement.msRequestFullscreen();
    }
  };

  return (
    <div className="real-time-video-container">
      <button className="back-button" onClick={() => window.history.back()}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>

      <section className="real-time-video-content">
        <h1>Video Real Time {cameraName && `(${cameraName})`}</h1>

        <div className="video-box">
          {videoSrc ? (
            <iframe
              id="realTimeVideo"
              src={videoSrc}
              title="Real-time Video Stream"
              allow="autoplay"
              allowFullScreen
              frameBorder="0"
              className="video-iframe"
            />
          ) : (
            <p>ไม่พบข้อมูลวิดีโอ หรือวิดีโอกำลังโหลด...</p>
          )}
          <button className="fullscreen-button" onClick={handleFullScreen}>
            Fullscreen
          </button>
        </div>
      </section>
    </div>
  );
}

export default RealTimeVideo;
