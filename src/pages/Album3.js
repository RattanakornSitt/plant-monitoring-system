import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import './css/Album_2.css';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Album3() {
  const { date, hour } = useParams();
  const location = useLocation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(1);
   const [expandedImage, setExpandedImage] = useState(null); // <-- state รูปที่ขยาย

  // ดึง query string
  const queryParams = new URLSearchParams(location.search);
  const cameraName = queryParams.get('cameraName') || 'Unknown Camera';
 // ex: "Camera 1" หรือ "0" (ขึ้นอยู่กับที่บันทึกใน Firestore)
  const product = queryParams.get('product');

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

        const fetchedImages = querySnapshot.docs
          .map(doc => doc.data())
          .sort((a, b) => a.time.localeCompare(b.time))  // 🔁 เรียงจากเวลาน้อยไปมาก
          .map(data => data["image-url"]);               // 🔁 ดึงเฉพาะ URL

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

  // ฟังก์ชันปิดรูปขยาย
  const closeExpandedImage = () => setExpandedImage(null);

  return (
    <div className="album2-container">
      <Link to={`/pages/album2/${date}?cameraName=${cameraName}&product=${product}`} className="back-button">
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Time {hour}:00</span>
      </Link>

      <h2 className="album2-subtitle">{cameraName}</h2>

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
          <div className="image-container-3">
            {images.length > 0 ? (
              <div className="image-grid-3">
                {images.map((imageUrl, index) => (
                  <div key={index} className="image-card-3">
                     <img
                      src={imageUrl}
                      alt={`Image ${index}`}
                      className="album2-image"
                      onClick={() => setExpandedImage(imageUrl)} // เมื่อกดรูป
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="loading-message">No images found for the selected date, time, and camera.</p>
            )}
          </div>
        )}
      </div>
       {/* Overlay แสดงรูปขยาย */}
      {expandedImage && (
        <div className="overlay-for-images" onClick={closeExpandedImage}>
          <img
            src={expandedImage}
            alt="Expanded"
            className="expanded-image"
            onClick={e => e.stopPropagation()} // ป้องกัน event bubble เมื่อกดรูปใน overlay
          />
        </div>
      )}
    </div>
  );
}

export default Album3;
