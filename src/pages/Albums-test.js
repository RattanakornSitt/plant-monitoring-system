import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // เพิ่ม useNavigate
import './css/Albums_T.css';
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

function Album_T() {
  const [albums, setAlbums] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // เดือนปัจจุบัน
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // ปีปัจจุบัน
  const [datesWithImages, setDatesWithImages] = useState([]); // เก็บวันที่ที่มีรูป
  const navigate = useNavigate(); // ใช้สำหรับการนำทาง
  const location = useLocation();

   // ✅ ดึง query string จาก URL
  const queryParams = new URLSearchParams(location.search);
  const cameraName = queryParams.get("cameraName");
  const product = queryParams.get("product"); // จะเป็น string เช่น "1"

  useEffect(() => {
    const fetchPlantImages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'PLANT_IMAGES'));
        const plantImagesData = querySnapshot.docs.map(doc => doc.data());

        // ✅ กรองเฉพาะรูปที่ตรงกับ product
        const filteredData = plantImagesData.filter(album => album.product?.toString() === product);

        const uniqueDates = [...new Set(filteredData.map(album => album.date))];
          setDatesWithImages(uniqueDates);

          const groupedByDate = uniqueDates.map(date => ({
            date,
            images: filteredData.filter(album => album.date === date),
          }));

          setAlbums(groupedByDate);
        } catch (error) {
          console.error('Error getting documents: ', error);
        }
      };

      if (product) fetchPlantImages();
    }, [product]);

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const handleDateClick = (date) => {
      setSelectedDate(date);
      // ✅ ส่ง cameraName และ product ไปยังหน้า Album2 ด้วย query string
      navigate(`/pages/Album2/${date}?cameraName=${cameraName}&product=${product}`);
    };

  const handleMonthChange = (delta) => {
    const newMonth = currentMonth + delta;
    if (newMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else if (newMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  return (
    <div className="albumsT-container">
      <Link to={`/pages/camera?product=${product}&cameraName=${encodeURIComponent(cameraName)}`} className="back-button">
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </Link>
      <h2 className="albumsT-subtitle">{cameraName || 'Unknown Camera'}</h2>

      <div className="calendar-header">
        <button onClick={() => handleMonthChange(-1)}>&lt;</button>
        <span>{`${currentMonth + 1} / ${currentYear}`}</span>
        <button onClick={() => handleMonthChange(1)}>&gt;</button>
      </div>

      <div className="calendar-grid">
        {daysInMonth.map((day, index) => {
          const dateStr = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;
          const hasImage = datesWithImages.includes(dateStr); // Check if there are images for this day

          return (
            <div
              key={index}
              className={`calendar-day ${hasImage ? 'has-image' : ''} ${selectedDate === dateStr ? 'selected' : ''}`}
              onClick={hasImage ? () => handleDateClick(dateStr) : null}
            >
              <span>{day.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Album_T;
