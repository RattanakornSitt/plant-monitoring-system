import React, { useState, useEffect } from 'react';
import './css/Statistics.css';
import { db } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

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
  const navigate = useNavigate();
  const [diseaseChartData, setDiseaseChartData] = useState({ labels: [], datasets: [] });
  const [summaryData, setSummaryData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('Healthy');

  useEffect(() => {
    const fetchData = async () => {
      const diseaseCollectionRef = collection(db, 'diseaseData');
      const diseaseQuery = query(diseaseCollectionRef, orderBy("date", "asc")); // เรียงจากวันเก่าไปใหม่
  
      try {
        const diseaseSnapshot = await getDocs(diseaseQuery);
        const allData = [];
  
        diseaseSnapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.date);
          allData.push({
            date,
            healthy: parseFloat(data.healthy) || 0,
            leafSpot: parseFloat(data.leafSpot) || 0
          });
        });
  
        if (allData.length === 0) return;
  
        const startDate = allData[0].date;
        //const endDate = allData[allData.length - 1].date;
  
        const labels = [1, 3, 5, 7, 14, 21, 30];
        const summary = [];
        const diseaseData = [];
  
        labels.forEach(days => {
          const rangeEnd = new Date(startDate);
          rangeEnd.setDate(startDate.getDate() + days - 1);  // ช่วงวันจาก startDate
  
          let healthySum = 0;
          let leafSpotSum = 0;
  
          allData.forEach(entry => {
            if (entry.date >= startDate && entry.date <= rangeEnd) {
              healthySum += entry.healthy;
              leafSpotSum += entry.leafSpot;
            }
          });
  
          const total = healthySum + leafSpotSum;
  
          const healthyPercent = (healthySum / total) * 100 || 0;
          const leafSpotPercent = (leafSpotSum / total) * 100 || 0;
  
          summary.push({
            range: `${days} Days`,
            diseaseHealthy: healthyPercent,
            leafSpot: leafSpotPercent
          });
  
          diseaseData.push({
            healthy: healthyPercent,
            leafSpot: leafSpotPercent
          });
        });
  
        setSummaryData(summary);
  
        setDiseaseChartData({
          labels: labels.map(l => `${l} Days`),
          datasets: [
            {
              label: 'Healthy',
              data: diseaseData.map(d => d.healthy),
              borderColor: 'green',
              fill: false,
              hidden: selectedGraph !== 'Healthy'
            },
            {
              label: 'Leaf Spot',
              data: diseaseData.map(d => d.leafSpot),
              borderColor: 'red',
              fill: false,
              hidden: selectedGraph !== 'Leaf Spot'
            }
          ]
        });
  
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
  
    fetchData();
  }, [selectedGraph]); // ไม่ใช้ selectedRange แล้ว  

  const handleGraphChange = (graphType) => {
    setSelectedGraph(graphType);
  };

  return (
    <div className="statistics-container">
      <button className="back-button" onClick={() => navigate('/pages/camera')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1>Statistics</h1>
      <section className="statistics-content">
        <div className="graph-selector">
          <button
            className={selectedGraph === 'Healthy' ? 'active' : ''}
            onClick={() => handleGraphChange('Healthy')}
          >
            Show Healthy
          </button>
          <button
            className={selectedGraph === 'Leaf Spot' ? 'active' : ''}
            onClick={() => handleGraphChange('Leaf Spot')}
          >
            Show Leaf Spot
          </button>
        </div>

        <div className="chart-and-summary">
          <div className="chart-section">
            <h2>Disease Occurrence (%)</h2>
            <Line data={diseaseChartData} />
          </div>

          <div className="summary-table-container">
            <h2>Summary Data</h2>
            <table className="summary-table-content">
              <thead>
                <tr>
                  <th>Range</th>
                  <th>Healthy (Disease)</th>
                  <th>Leaf Spot</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.range}</td>
                    <td>{row.diseaseHealthy.toFixed(2)}%</td>
                    <td>{row.leafSpot.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
