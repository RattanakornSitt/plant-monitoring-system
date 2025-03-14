import React, { useState, useEffect } from 'react';
import './css/Statistics.css';
import { db } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
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
  const [selectedRange] = useState(7);
  const [diseaseChartData, setDiseaseChartData] = useState({ labels: [], datasets: [] });
  const [pestChartData, setPestChartData] = useState({ labels: [], datasets: [] });
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedRange);

      const diseaseCollectionRef = collection(db, 'diseaseData');
      const pestCollectionRef = collection(db, 'pestData');

      const diseaseQuery = query(diseaseCollectionRef, orderBy("date", "desc"), limit(50));
      const pestQuery = query(pestCollectionRef, orderBy("date", "desc"), limit(50));

      try {
        const [diseaseSnapshot, pestSnapshot] = await Promise.all([
          getDocs(diseaseQuery),
          getDocs(pestQuery)
        ]);

        let diseaseData = [];
        let pestData = [];
        let labels = [7, 14, 21, 30];
        let summary = [];

        labels.forEach(days => {
          let diseaseCounts = { healthy: 0, leafSpot: 0, leafBlight: 0, total: 0 };
          let pestCounts = { healthy: 0, caterpillar: 0, leafworm: 0, total: 0 };
          const rangeStart = new Date();
          rangeStart.setDate(endDate.getDate() - days);
          console.log("Start Date:", startDate);
          console.log("End Date:", endDate);


          diseaseSnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = new Date(data.date).getTime();
            if (timestamp >= rangeStart.getTime() && timestamp <= endDate.getTime()) {
              diseaseCounts.healthy += parseFloat(data.healthy) || 0;
              diseaseCounts.leafSpot += parseFloat(data.leafSpot) || 0;
              diseaseCounts.leafBlight += parseFloat(data.leafBlight) || 0;
            }
          });
          diseaseCounts.total = diseaseCounts.healthy + diseaseCounts.leafSpot + diseaseCounts.leafBlight;

          pestSnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = new Date(data.date).getTime();
            if (timestamp >= rangeStart.getTime() && timestamp <= endDate.getTime()) {
              pestCounts.healthy += parseFloat(data.healthy) || 0;
              pestCounts.caterpillar += parseFloat(data.caterpillar) || 0;
              pestCounts.leafworm += parseFloat(data.leafworm) || 0;
            }
          });
          pestCounts.total = pestCounts.healthy + pestCounts.caterpillar + pestCounts.leafworm;

          summary.push({
            range: `${days} Days`,
            diseaseHealthy: (diseaseCounts.healthy / diseaseCounts.total) * 100 || 0,
            leafSpot: (diseaseCounts.leafSpot / diseaseCounts.total) * 100 || 0,
            leafBlight: (diseaseCounts.leafBlight / diseaseCounts.total) * 100 || 0,
            pestHealthy: (pestCounts.healthy / pestCounts.total) * 100 || 0,
            caterpillar: (pestCounts.caterpillar / pestCounts.total) * 100 || 0,
            leafworm: (pestCounts.leafworm / pestCounts.total) * 100 || 0
          });

          diseaseData.push({
            healthy: (diseaseCounts.healthy / diseaseCounts.total) * 100 || 0,
            leafSpot: (diseaseCounts.leafSpot / diseaseCounts.total) * 100 || 0,
            leafBlight: (diseaseCounts.leafBlight / diseaseCounts.total) * 100 || 0
          });

          pestData.push({
            healthy: (pestCounts.healthy / pestCounts.total) * 100 || 0,
            caterpillar: (pestCounts.caterpillar / pestCounts.total) * 100 || 0,
            leafworm: (pestCounts.leafworm / pestCounts.total) * 100 || 0
          });
        });

        setSummaryData(summary);

        setDiseaseChartData({
          labels: labels.map(l => `${l} Days`),
          datasets: [
            { label: 'Healthy', data: diseaseData.map(d => d.healthy), borderColor: 'green', fill: false },
            { label: 'Leaf Spot', data: diseaseData.map(d => d.leafSpot), borderColor: 'red', fill: false },
            { label: 'Leaf Blight', data: diseaseData.map(d => d.leafBlight), borderColor: 'blue', fill: false }
          ]
        });

        setPestChartData({
          labels: labels.map(l => `${l} Days`),
          datasets: [
            { label: 'Healthy', data: pestData.map(p => p.healthy), borderColor: 'green', fill: false },
            { label: 'Cabbage Caterpillar', data: pestData.map(p => p.caterpillar), borderColor: 'orange', fill: false },
            { label: 'Leafworm', data: pestData.map(p => p.leafworm), borderColor: 'purple', fill: false }
          ]
        });

      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [selectedRange]);

  // Chart.js options with enhanced Y-axis display
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          max: 100,
          callback: function (value) { return `${value}%`; } // Show percentage on Y-axis
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}%`; // Show values as percentage
          }
        }
      }
    }
  };

  return (
    <div className="statistics-container">
      <button className="back-button" onClick={() => navigate('/pages/camera')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Back</span>
      </button>

      <section className="statistics-content">
        <h1>Statistics</h1>
        <div className="charts-container">
          <div className="chart-section">
            <h2>Disease Occurrence (%)</h2>
            <Line data={diseaseChartData} options={chartOptions} />
          </div>
          <div className="chart-section">
            <h2>Pest Occurrence (%)</h2>
            <Line data={pestChartData} options={chartOptions} />
          </div>
        </div>

        <div className="summary-table-container">
          <h2>Summary Data</h2>
          <table className="summary-table-content">
            <thead>
              <tr>
                <th>Range</th>
                <th>Healthy (Disease)</th>
                <th>Leaf Spot</th>
                <th>Leaf Blight</th>
                <th>Healthy (Pest)</th>
                <th>Caterpillar</th>
                <th>Leafworm</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((row, index) => (
                <tr key={index}>
                  <td>{row.range}</td>
                  <td>{row.diseaseHealthy.toFixed(2)}%</td>
                  <td>{row.leafSpot.toFixed(2)}%</td>
                  <td>{row.leafBlight.toFixed(2)}%</td>
                  <td>{row.pestHealthy.toFixed(2)}%</td>
                  <td>{row.caterpillar.toFixed(2)}%</td>
                  <td>{row.leafworm.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
