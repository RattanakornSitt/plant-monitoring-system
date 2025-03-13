import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Albums.css'; // นำเข้าไฟล์ CSS ที่กำหนด
import { db } from './firebaseConfig'; // นำเข้า Firebase configuration
import { collection, getDocs } from 'firebase/firestore'; // นำเข้า getDocs และ collection จาก Firestore

function AlbumT() {
  const [albums, setAlbums] = useState([]);
  
  useEffect(() => {
    // ฟังก์ชันดึงข้อมูล PLANT_IMAGES จาก Firestore
    const fetchPlantImages = async () => {
      try {
        // ดึงข้อมูลจาก collection PLANT_IMAGES
        const querySnapshot = await getDocs(collection(db, 'PLANT_IMAGES'));
        const plantImagesData = querySnapshot.docs.map(doc => doc.data());

        // กรองและจัดเรียงข้อมูลอัลบั้มตามวันที่
        const uniqueDates = [...new Set(plantImagesData.map(album => album.date))]; // หาวันที่ที่ไม่ซ้ำกัน
        const groupedByDate = uniqueDates.map(date => ({
          date,
          images: plantImagesData.filter(album => album.date === date),
        }));

        // ตั้งค่าข้อมูลอัลบั้มที่กรองแล้ว
        setAlbums(groupedByDate);
      } catch (error) {
        console.error('Error getting documents: ', error);
      }
    };

    fetchPlantImages(); // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูล
  }, []); // ดึงข้อมูลแค่ครั้งเดียวเมื่อคอมโพเนนต์โหลด

  return (
    <div className="albums-container">
      <Link to="/pages/camera" className="back-button">
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Albums</span>
      </Link>
      <h2 className="albums-subtitle">Butterhead</h2>

      <div className="albums-grid">
        {albums.map((album, index) => (
          <Link key={index} to={`/pages/album2/${album.date}`} className="album-card">
            <img src="/img/folder.png" alt="Album Icon" className="album-image" />
            <p className="album-text">{album.date}</p>
            {/* สร้างลิงก์เพื่อไปที่หน้าของอัลบั้มวันที่นั้นๆ */}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AlbumT;
