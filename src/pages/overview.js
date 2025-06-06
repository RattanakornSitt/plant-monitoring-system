import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "./firebaseConfig";
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import "./css/overview.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Overview() {
  const navigate = useNavigate();
  const [userProducts, setUserProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [summaryData, setSummaryData] = useState({});
  const [selectedGraph, setSelectedGraph] = useState("Healthy");
  const [selectedTableProduct, setSelectedTableProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  
  // เพิ่ม state สำหรับ modal แสดงรูปขยาย
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProductsFromCamera(user.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  async function fetchUserProductsFromCamera(username) {
    if (!username) return;

    const q = query(collection(db, "CAMERA"), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No camera user found.");
      setUserProducts([]);
      return;
    }

    const cameraData = querySnapshot.docs.map((doc) => doc.data());
    const products = cameraData.flatMap((data) => (data.product ? data.product : []));
    setUserProducts(products);
  }

    const [productNamesMap, setProductNamesMap] = useState({});
   useEffect(() => {
    const fetchCameraNames = async () => {
      const cameraSnapshot = await getDocs(collection(db, "CAMERA"));
      const cameraMap = {};

      cameraSnapshot.forEach((doc) => {
        const data = doc.data();
        // ตรวจว่ามี product และ cameraName
        if (data.product && data.cameraName) {
          cameraMap[data.product] = data.cameraName;
        }
      });

      setProductNamesMap(cameraMap);
    };

    fetchCameraNames();
  }, []);

  async function fetchProductImages(selectedProductNums) {
    if (selectedProductNums.length === 0) {
      setProductImages([]);
      return;
    }

    const q = query(collection(db, "PLANT_IMAGES"), where("product", "in", selectedProductNums));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No images found.");
      setProductImages([]);
      return;
    }

    const imagesData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        product: data.product,
        imageUrl: data["image-url"],
        date: data.date,
        time: data.time
      };
    });    

    setProductImages(imagesData);
  }

// แก้ไขในส่วนของ fetchSummaryData function
async function fetchSummaryData(selectedProductNums) {
  if (selectedProductNums.length === 0) return;

  const q = query(collection(db, "diseaseData"), where("product", "in", selectedProductNums), orderBy("date", "asc"));
  const querySnapshot = await getDocs(q);
  const allData = querySnapshot.docs.map((doc) => doc.data());

  const validData = allData.filter((data) => data.date && !isNaN(new Date(data.date).getTime()));
  
  // แก้ไขตรงนี้ - ถ้าไม่มีข้อมูลให้สร้างข้อมูลเป็น 0
  if (validData.length === 0) {
    console.log("No valid data with date found. Creating zero data.");
    
    const labels = [1, 5, 10, 15, 20, 25, 30, 35];
    const displayLabelMap = {
          1: "14 Days",
          5: "19 Days",
          10: "24 Days",
          15: "29 Days",
          20: "34 Days",
          25: "39 Days",
          30: "44 Days",
          35: "49 Days",
    };
    const displayLabels = labels.map(l => displayLabelMap[l]);

    // สร้างข้อมูลเป็น 0 สำหรับทุก product
    const summaryDataPerProduct = {};
    const summaryPerProduct = [];
    
    selectedProductNums.forEach(product => {
      const zeroData = labels.map(() => ({ healthy: 0, leafSpot: 0 }));
      summaryPerProduct.push({ product, data: zeroData });
      
      summaryDataPerProduct[product] = labels.map((label, i) => ({
        range: label,
        healthy: 0,
        leafSpot: 0
      }));
    });

    setSummaryData(summaryDataPerProduct);
    setSelectedTableProduct(selectedProductNums[0]);

    // สร้าง datasets สำหรับกราฟ
    const datasets = [];
    summaryPerProduct.forEach(({ product, data }) => {
      const productName = productNamesMap[product] || `Unnamed Device (${product})`;
      const colorHue = Math.random() * 360;

      datasets.push({
        label: `Healthy - ${productName}`,
        data: data.map((d) => d.healthy), // จะเป็น [0, 0, 0, ...]
        borderColor: `hsl(${colorHue}, 70%, 50%)`,
        fill: false,
        hidden: selectedGraph !== "Healthy"
      });
      datasets.push({
        label: `Leaf Spot - ${productName}`,
        data: data.map((d) => d.leafSpot), // จะเป็น [0, 0, 0, ...]
        borderColor: `hsl(${colorHue}, 70%, 50%)`,
        borderDash: [5, 5],
        fill: false,
        hidden: selectedGraph !== "Leaf Spot"
      });
    });
    
    setChartData({
      labels: displayLabels,
      datasets
    });
    return;
  }

  const startDate = new Date(validData[0].date);
  const labels = [1, 5, 10, 15, 20, 25, 30, 35];
  const summaryPerProduct = [];
  
  const displayLabelMap = {
          1: "14 Days",
          5: "19 Days",
          10: "24 Days",
          15: "29 Days",
          20: "34 Days",
          25: "39 Days",
          30: "44 Days",
          35: "49 Days",
  };
  const displayLabels = labels.map(l => displayLabelMap[l]);

  for (const product of selectedProductNums) {
    const productData = validData.filter((entry) => entry.product === product);
    const productSummary = [];

    labels.forEach((days) => {
      const rangeEnd = new Date(startDate);
      rangeEnd.setDate(startDate.getDate() + days - 1);

      let healthySum = 0;
      let leafSpotSum = 0;

      productData.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate >= startDate && entryDate <= rangeEnd) {
          healthySum += entry.healthy || 0;
          leafSpotSum += entry.leafSpot || 0;
        }
      });

      const total = healthySum + leafSpotSum;
      
      // แก้ไขตรงนี้ - ถ้าไม่มีข้อมูลให้แสดง 0 แทนที่จะเป็น "0.00"
      const healthyPercent = total > 0 ? parseFloat(((healthySum / total) * 100).toFixed(2)) : 0;
      const leafSpotPercent = total > 0 ? parseFloat(((leafSpotSum / total) * 100).toFixed(2)) : 0;

      productSummary.push({
        healthy: healthyPercent,
        leafSpot: leafSpotPercent
      });
    });
    summaryPerProduct.push({ product, data: productSummary });
  }

  const summaryDataPerProduct = {};
  summaryPerProduct.forEach(({ product, data }) => {
    summaryDataPerProduct[product] = labels.map((label, i) => ({
      range: label,
      healthy: data[i].healthy,
      leafSpot: data[i].leafSpot
    }));
  });

  console.log("Healthy Data", summaryPerProduct.map(p => ({ product: p.product, data: p.data.map(d => d.healthy) })));

  setSummaryData(summaryDataPerProduct);
  setSelectedTableProduct(selectedProductNums[0]);

  const datasets = [];
  summaryPerProduct.forEach(({ product, data }) => {
    const productName = productNamesMap[product] || `Unnamed Device (${product})`;
    const colorHue = Math.random() * 360;

    datasets.push({
      label: `Healthy - ${productName}`,
      data: data.map((d) => d.healthy),
      borderColor: `hsl(${colorHue}, 70%, 50%)`,
      fill: false,
      hidden: selectedGraph !== "Healthy"
    });
    datasets.push({
      label: `Leaf Spot - ${productName}`,
      data: data.map((d) => d.leafSpot),
      borderColor: `hsl(${colorHue}, 70%, 50%)`,
      borderDash: [5, 5], 
      fill: false,
      hidden: selectedGraph !== "Leaf Spot"
    });
  });
  
  setChartData({
    labels: displayLabels,
    datasets
  });
}

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const numValue = Number(value);
    setSelectedProducts(checked ? [...selectedProducts, numValue] : selectedProducts.filter((p) => p !== numValue));
  };

  const handleConfirmSelection = () => {
    fetchProductImages(selectedProducts);
    fetchSummaryData(selectedProducts);
  };

// แก้ไข chartOptions
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

  const handleGraphChange = (graphType) => {
    setSelectedGraph(graphType);
    setChartData((prevData) => ({
      ...prevData,
      datasets: prevData.datasets.map((dataset) => ({
        ...dataset,
        hidden: !dataset.label.includes(graphType)
      }))
    }));
  };

  // ฟังก์ชันสำหรับเปิด modal แสดงรูปขยาย
  const openImageModal = (img, productName) => {
    setSelectedImage({
      ...img,
      productName: productName
    });
    setIsModalOpen(true);
  };

  // ฟังก์ชันสำหรับปิด modal
  const closeImageModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  const uniqueProducts = [...new Set(userProducts.map(p => String(p)))];
  console.log("userProducts:", userProducts);

  return (
    <div className="overview-container">
      <button className="back-button" onClick={() => navigate("/pages/services")}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1 className="overview-title">Overview</h1>

      <section className="section">
        <h2>Select Devices</h2>
        <div className="checkbox-container">
          {uniqueProducts.length > 0 ? (
            uniqueProducts.map((product, index) => (
              <label key={index} className="checkbox-label">
                <input type="checkbox" value={product} onChange={handleCheckboxChange} />
                {productNamesMap[product] || `Unnamed Device (${product})`}
              </label>
            ))
          ) : (
            <p>⚠️ No devices found.</p>
          )}
        </div>
        <button className="confirm-button" onClick={handleConfirmSelection}>
          OK
        </button>
      </section>

      {/* Modal สำหรับแสดงรูปขยาย */}
      {isModalOpen && selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeImageModal}>
              ×
            </button>
            <div className="modal-image-container">
              <img 
                src={selectedImage.imageUrl} 
                alt={`${selectedImage.productName} - ${selectedImage.time}`}
                className="modal-image"
              />
              <div className="modal-image-info">
                <h4>{selectedImage.productName}</h4>
                <p><strong>วันที่:</strong> {selectedImage.date}</p>
                <p><strong>เวลา:</strong> {selectedImage.time}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="section">
        <h2>Images Overview</h2>

        {productImages.length > 0 ? (
          <>
            {/* Dropdown สำหรับเลือก Product */}
              <div className="dropdown-container">
                <label htmlFor="product-select">Choose Device:</label>
                <select
                  id="product-select"
                  value={selectedProduct ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedProduct(value === '' ? '' : Number(value)); // แปลงกลับเป็น number
                  }}
                >
                  <option value="">-- All Devices --</option>
                  {[...new Set(productImages.map((img) => img.product))].map((product) => (
                    <option key={product} value={product}>
                      {productNamesMap[product] || `Unnamed Device (${product})`}
                    </option>
                  ))}
                </select>
              </div>

            {/* กรองและจัดกลุ่มภาพตาม product และ date พร้อมเรียงตามวันที่จากล่าสุดไปเก่า */}
            {Object.entries(
              productImages
                .filter((img) => !selectedProduct || img.product === selectedProduct)
                .reduce((acc, img) => {
                  // จัดกลุ่มตาม product ก่อน
                  if (!acc[img.product]) acc[img.product] = {};
                  if (!acc[img.product][img.date]) acc[img.product][img.date] = [];
                  acc[img.product][img.date].push(img);
                  return acc;
                }, {})
            )
            // เรียงลำดับ product
            .sort(([productA], [productB]) => Number(productA) - Number(productB))
            .map(([product, dateGroups]) => {
              const productName = productNamesMap[product] || `Unnamed Device (${product})`;
              
              // เรียงลำดับ date จากล่าสุดไปเก่า
              const sortedDates = Object.entries(dateGroups).sort(([dateA], [dateB]) => {
                return new Date(dateB) - new Date(dateA); // เรียงจากล่าสุดไปเก่า
              });

              return (
                <div key={product} className="product-group">
                  <h3 className="product-title">{productName}</h3>
                  
                  {sortedDates.map(([date, images]) => {
                    // เรียงลำดับรูปภาพในแต่ละวันตามเวลา (จากล่าสุดไปเก่า)
                    const sortedImages = images.sort((a, b) => {
                      // แปลงเวลาเป็น Date object เพื่อเปรียบเทียบ
                      const timeA = new Date(`${a.date} ${a.time}`);
                      const timeB = new Date(`${b.date} ${b.time}`);
                      return timeB - timeA; // เรียงจากล่าสุดไปเก่า
                    });

                    return (
                      <div key={`${product}-${date}`} className="image-group">
                        <h4 className="date-label">
                          {date}
                          <span className="image-count">({sortedImages.length} รูป)</span>
                        </h4>
                        
                        <div className="image-grid">
                          {sortedImages.map((img, index) => (
                            <div 
                              key={index} 
                              className="image-item"
                              onClick={() => openImageModal(img, productName)}
                            >
                              <img 
                                src={img.imageUrl} 
                                alt={`${productName} - ${img.time}`} 
                              />
                              <p className="image-caption">{img.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        ) : (
          <p>⚠️ No images available.</p>
        )}
      </section>

      <section className="section">
        <h2>Statistics</h2>
        <div className="graph-selector">
          <button className={selectedGraph === "Healthy" ? "active" : ""} onClick={() => handleGraphChange("Healthy")}>
            Show Healthy
          </button>
          <button className={selectedGraph === "Leaf Spot" ? "active" : ""} onClick={() => handleGraphChange("Leaf Spot")}>
            Show Leaf Spot
          </button>
        </div>
        <div className="chart-container">
          {chartData.datasets.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>⚠️ No statistics available.</p>}
        </div>
      </section>

      <div className="section">
      <h2 className="summary-title">Summary Data</h2>
      <div className="product-tab-buttons">
        {Object.keys(summaryData).map((product) => (
          <button key={product} onClick={() => setSelectedTableProduct(product)} className={selectedTableProduct === product ? "active" : ""}>
            {productNamesMap[product] || `Unnamed Device (${product})`}
          </button>
        ))}
      </div>

      {selectedTableProduct && summaryData[selectedTableProduct] ? (
          <table className="summary-table-content">
            <thead>
              <tr>
                <th>Range</th>
                <th>Healthy</th>
                <th>Leaf Spot</th>
              </tr>
            </thead>
            <tbody>
              {summaryData[selectedTableProduct].map((row, index) => {
                const rangeDisplayMap = {
                  1: "14 Days",
                  3: "19 Days",
                  5: "24 Days",
                  7: "29 Days",
                  14: "34 Days",
                  21: "39 Days",
                  30: "44 Days",
                  36: "59 Days",
                };
                const displayRange = rangeDisplayMap[row.range] || `${row.range}`;
                return (
                  <tr key={index}>
                    <td>{displayRange}</td>
                    <td>{row.healthy}%</td>
                    <td>{row.leafSpot}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

export default Overview;