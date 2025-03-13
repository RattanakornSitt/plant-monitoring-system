import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // ดึงข้อมูลจาก URL และ Link
import './css/Album_2.css'; // สไตล์ของหน้า Album2T
import { db } from './firebaseConfig'; // นำเข้า Firebase configuration
import { collection, query, where, getDocs } from 'firebase/firestore'; // นำเข้า query และ where จาก Firestore

function Album3() {
  const { date, hour } = useParams(); // ดึงข้อมูลวันที่และเวลาจาก URL
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // ดึงข้อมูลจาก Firestore ตามวันที่และเวลาที่ได้รับจาก URL
        const plantImagesRef = collection(db, 'PLANT_IMAGES');
        const q = query(
          plantImagesRef, 
          where('date', '==', date), // กรองข้อมูลที่ตรงกับวันที่
          where('time', '>=', `${hour}:00:00`), // กรองข้อมูลที่ตรงกับชั่วโมง
        );

        const querySnapshot = await getDocs(q);
        const fetchedImages = querySnapshot.docs.map(doc => doc.data()["image-url"]);  // ดึงเฉพาะ "image-url"

        setImages(fetchedImages);  // ตั้งค่าภาพทั้งหมดที่ตรงกับวันและเวลา
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);  // หลังจากโหลดข้อมูลเสร็จให้เปลี่ยนสถานะเป็นไม่โหลด
      }
    };

    fetchImages();  // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูล
  }, [date, hour]);

  return (
    <div className="album2-container">
      {/* ปุ่มย้อนกลับและข้อความ */}
      <div className="header-content">
        <Link to={`/pages/album2/${date}`} className="back-button">
          <img src="/img/back-icon.png" alt="Back" className="back-icon" />
          <span>Time {hour}:00</span> {/* แสดงชั่วโมง */}
        </Link>
      </div>
      <h2 className="album2-subtitle">Butterhead</h2>

      {loading ? (
        <p>Loading images...</p>
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
            <p>No images found for the selected date and time.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Album3;
