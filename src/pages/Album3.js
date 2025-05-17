import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './css/Album_2.css';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Album3() {
  const { date, hour } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(1);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        console.log("📅 Date from URL:", date);
        console.log("⏰ Hour from URL:", hour);
        console.log("📸 Selected Camera:", selectedCamera);

        const plantImagesRef = collection(db, 'PLANT_IMAGES');
        const startTime = `${hour}:00:00`;
        const endHour = String(Number(hour) + 1).padStart(2, '0');
        const endTime = `${endHour}:00:00`;

        console.log("⏳ Time range:", startTime, "to", endTime);

        const q = query(
          plantImagesRef,
          where('date', '==', date),
          where('time', '>=', startTime),
          where('time', '<', endTime),
          where('camera', '==', selectedCamera)  // ถ้าใน Firestore เป็น string ให้ .toString()
        );

        const querySnapshot = await getDocs(q);

        console.log("📄 Number of documents fetched:", querySnapshot.size);

        const fetchedImages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("📄 Document Data:", data);
          return data["image-url"];
        });

        console.log("🖼️ Image URLs fetched:", fetchedImages);

        setImages(fetchedImages);
      } catch (error) {
        console.error('❌ Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [date, hour, selectedCamera]);

  return (
    <div className="album2-container">
        <Link to={`/pages/album2/${date}`} className="back-button">
          <img src="/img/back-icon.png" alt="Back" className="back-icon" />
          <span>Time {hour}:00</span>
        </Link>

      <h2 className="album2-subtitle">Butterhead</h2>

      <div className="content-container">
        <div className="camera-buttons">
          <button
            className={selectedCamera === 0 ? 'camera-button active' : 'camera-button'}
            onClick={() => setSelectedCamera(0)}
          >
            Camera 1
          </button>
          <button
            className={selectedCamera === 1 ? 'camera-button active' : 'camera-button'}
            onClick={() => setSelectedCamera(1)}
          >
            Camera 2
          </button>
        </div>

        {loading ? (
          <p className="loading-message">Loading images...</p>
        ) : (
          <div className="image-container">
            {images.length > 0 ? (
              <div className="image-grid">
                {images.map((imageUrl, index) => (
                  <div key={index} className="image-card">
                    <img src={imageUrl} alt={`Image ${index}`} className="album2-image" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="loading-message">No images found for the selected date, time, and camera.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Album3;
