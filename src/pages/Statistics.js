import React, { useState, useEffect } from 'react';
import './css/Statistics.css';
import { db } from './firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation(); // อ่าน location
  const queryParams = new URLSearchParams(location.search);
  const product = Number(queryParams.get('product')); // 🔧 แปลง string เป็น number

  const [diseaseChartData, setDiseaseChartData] = useState({ labels: [], datasets: [] });
  const [summaryData, setSummaryData] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState('Healthy');

  // Chart options with Y-axis percentage formatting
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: (legendItem, data) => {
            const dataset = data.datasets[legendItem.datasetIndex];
            return !dataset.hidden;
          }
        }
      },
      tooltip: { // แก้จาก tooltips เป็น tooltip
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false, // ไม่บังคับเริ่มที่ 0
        // ลบ max: 100 ออกเพื่อให้ปรับตามข้อมูล
        ticks: {
          callback: function(value) {
            return value + '%';
          }
          // ลบ stepSize ออกเพื่อให้ Chart.js คำนวณเอง
        },
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      }
    }
  };

  useEffect(() => {
    if (!product) {
      console.warn('No product specified in query string');
      return;
    }

    const fetchData = async () => {
    const diseaseCollectionRef = collection(db, 'diseaseData');
    const diseaseQuery = query(diseaseCollectionRef, orderBy("date", "asc")); // เรียงจากวันเก่าไปใหม่
  
      try {
        const diseaseSnapshot = await getDocs(diseaseQuery);
        const allData = []; // ✅ ต้องอยู่ใน scope นี้

        diseaseSnapshot.forEach((doc) => {
          const data = doc.data();

          // ✅ กรองเฉพาะเอกสารที่มี product === 1
          if (data.product === product) {
            const date = new Date(data.date);
            allData.push({
              date,
              healthy: parseFloat(data.healthy) || 0,
              leafSpot: parseFloat(data.leafSpot) || 0
            });
          }
        });
  
        if (allData.length === 0) return;
  
        const startDate = allData[0].date;
        //const endDate = allData[allData.length - 1].date;
          const labelMap = {
          1: "14 Days",
          5: "19 Days",
          10: "24 Days",
          15: "29 Days",
          20: "34 Days",
          25: "39 Days",
          30: "44 Days",
          35: "49 Days",
        };

        const labels = [1, 5, 10, 15, 20, 25, 30, 35];
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

          const label = labelMap[days] || `${days} Days`;
  
          summary.push({
            range: labelMap[days] || `${days} Days`,
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
          labels: labels.map(l => labelMap[l] || `${l} Days`),
          datasets: [
            {
              label: 'Healthy',
              data: diseaseData.map(d => d.healthy),
              borderColor: '#22c55e',
              backgroundColor: '#22c55e',
              borderWidth: 4,
              fill: false,
              tension: 0.1,
              hidden: selectedGraph !== 'Healthy'
            },
            {
              label: 'Leaf Spot',
              data: diseaseData.map(d => d.leafSpot),
              borderColor: '#ef4444',
              backgroundColor: '#ef4444',
              borderWidth: 4,
              fill: false,
              tension: 0.1,
              hidden: selectedGraph !== 'Leaf Spot'
            }
          ]
        });
  
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
  
    fetchData();
  }, [selectedGraph, product]); // ไม่ใช้ selectedRange แล้ว  

  const handleGraphChange = (graphType) => {
    setSelectedGraph(graphType);
  };
  

  return (
    <div className="statistics-container">
      <button className="back-button" onClick={() => window.history.back()}>
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
          <div className="chart-section" style={{height: '500px', width: '100%'}}>
            <h2>Disease Occurrence (%)</h2>
            {diseaseChartData.labels.length === 0 ? (
              <p>ไม่พบข้อมูลสำหรับแสดงกราฟ</p>
            ) : (
              <div style={{height: '400px', width: '100%'}}>
                <Line data={diseaseChartData} options={chartOptions} />
              </div>
            )}
          </div>

          <div className="summary-table-container">
            <h2>Summary Data</h2>
            {summaryData.length === 0 ? (
              <p>ไม่พบข้อมูลสำหรับแสดงตาราง</p>
            ) : (
              <table className="summary-table-content">
                <thead>
                  <tr>
                    <th>Range</th>
                    <th>Healthy</th>
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
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;