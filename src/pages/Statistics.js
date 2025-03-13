import React, { useState, useEffect } from 'react';
import './css/Statistics.css';
import { db } from './firebaseConfig'; // Firebase functions
import { useNavigate } from 'react-router-dom'; // ใช้ useNavigate แทน Link
import { collection, addDoc, getDocs, query, orderBy, where, limit } from "firebase/firestore"; // Firestore functions
import { Line } from 'react-chartjs-2';  // นำเข้า Line chart จาก react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';  // นำเข้าโมดูลต่างๆ ของ Chart.js

// ลงทะเบียนโมดูลที่ใช้ใน Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Statistics() {
  const navigate = useNavigate(); // สร้างตัวแปร navigate สำหรับใช้ในการนำทาง
  const [diseaseChartData, setDiseaseChartData] = useState({
    labels: [], 
    datasets: []
  });
  const [pestChartData, setPestChartData] = useState({
    labels: [], 
    datasets: []
  });
  const [selectedRange, setSelectedRange] = useState(7); // Default to 7 days

  useEffect(() => {
    // Fetch data based on selected range
    const fetchData = async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedRange);

      // Convert start and end dates to timestamps for querying
      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      // Get disease data
      const diseaseCollectionRef = collection(db, 'diseaseData');
      const diseaseQuery = query(
        diseaseCollectionRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp),
        orderBy("date", "desc"), // Order by date
        limit(10) // Limit to the most recent 10 entries
      );
      
      // Get pest data
      const pestCollectionRef = collection(db, 'pestData');
      const pestQuery = query(
        pestCollectionRef,
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp),
        orderBy("date", "desc"),
        limit(10)
      );

      try {
        const [diseaseSnapshot, pestSnapshot] = await Promise.all([getDocs(diseaseQuery), getDocs(pestQuery)]);

        let diseaseData = { healthy: 0, leafSpot: 0, leafBlight: 0 };
        let pestData = { healthy: 0, caterpillar: 0, leafworm: 0 };

        diseaseSnapshot.forEach((doc) => {
          const data = doc.data();
          const diseaseDate = new Date(data.date);  // แปลงจาก string เป็น Date object
          const timestamp = diseaseDate.getTime();  // แปลงเป็น timestamp

          // ตอนนี้สามารถใช้ timestamp ได้ในการคำนวณช่วงเวลา
          if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
            diseaseData.healthy += parseFloat(data.healthy) || 0;
            diseaseData.leafSpot += parseFloat(data.leafSpot) || 0;
            diseaseData.leafBlight += parseFloat(data.leafBlight) || 0;
          }
        });

        pestSnapshot.forEach((doc) => {
          const data = doc.data();
          const pestDate = new Date(data.date);  // แปลงจาก string เป็น Date object
          const timestamp = pestDate.getTime();  // แปลงเป็น timestamp

          if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
            pestData.healthy += parseFloat(data.healthy) || 0;
            pestData.caterpillar += parseFloat(data.caterpillar) || 0;
            pestData.leafworm += parseFloat(data.leafworm) || 0;
          }
        });

        // Set chart data for disease
        setDiseaseChartData({
          labels: ['Healthy', 'Leaf Spot', 'Leaf Blight'],
          datasets: [
            {
              label: 'Disease Occurrence',
              data: [diseaseData.healthy, diseaseData.leafSpot, diseaseData.leafBlight],
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderColor: 'rgb(12, 99, 99)',
              borderWidth: 1,
            }
          ],
        });

        // Set chart data for pests
        setPestChartData({
          labels: ['Healthy', 'Cabbage Caterpillar', 'Leafworm'],
          datasets: [
            {
              label: 'Pest Occurrence',
              data: [pestData.healthy, pestData.caterpillar, pestData.leafworm],
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderColor: 'rgb(112, 54, 228)',
              borderWidth: 1,
            }
          ],
        });

      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [selectedRange]);

  return (
    <div className="statistics-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/pages/camera')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Back</span>
      </button>

      {/* Statistics Section */}
      <section className="statistics-content">
        <h1>Statistics</h1>

        {/* Date Range Selector */}
        <div className="date-range-buttons">
          <button className="date-range-btn" onClick={() => setSelectedRange(7)}>7 Days</button>
          <button className="date-range-btn" onClick={() => setSelectedRange(14)}>14 Days</button>
          <button className="date-range-btn" onClick={() => setSelectedRange(30)}>30 Days</button>
        </div>

        {/* Container with Graphs */}
        <div className="charts-container">
          {/* Disease Occurrence Graph */}
          <div className="chart-section">
            <h2 className="chart-heading">Disease Occurrence</h2>
            <Line data={diseaseChartData} />
          </div>

          {/* Pest Occurrence Graph */}
          <div className="chart-section">
            <h2 className="chart-heading">Pest Occurrence</h2>
            <Line data={pestChartData} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
