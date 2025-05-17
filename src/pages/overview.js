
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

  async function fetchSummaryData(selectedProductNums) {
    if (selectedProductNums.length === 0) return;

    const q = query(collection(db, "diseaseData"), where("product", "in", selectedProductNums), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    const allData = querySnapshot.docs.map((doc) => doc.data());

    const validData = allData.filter((data) => data.date && !isNaN(new Date(data.date).getTime()));
    if (validData.length === 0) {
      console.log("No valid data with date found.");
      return;
    }

    const startDate = new Date(validData[0].date);
    const labels = [1, 3, 5, 7, 14, 21, 30];
    const summaryPerProduct = [];
    // สร้าง map สำหรับแปลง label เป็นค่าที่จะแสดง
const displayLabelMap = {
  1: "14 Days",
  3: "16 Days",
  5: "18 Days",     // สมมติใส่เองตามลำดับ
  7: "21 Days",
  14: "28 Days",
  21: "35 Days",
  30: "44 Days"
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
        const healthyPercent = total > 0 ? ((healthySum / total) * 100).toFixed(2) : "0.00";
        const leafSpotPercent = total > 0 ? ((leafSpotSum / total) * 100).toFixed(2) : "0.00";

        productSummary.push({
          healthy: parseFloat(healthyPercent),
          leafSpot: parseFloat(leafSpotPercent)
        });
      });
      summaryPerProduct.push({ product, data: productSummary });
    }

    const summaryDataPerProduct = {};
    summaryPerProduct.forEach(({ product, data }) => {
      summaryDataPerProduct[product] = labels.map((label, i) => ({
        range: `${label} Days`,
        healthy: data[i].healthy,
        leafSpot: data[i].leafSpot
      }));
    });
    console.log("Healthy Data", summaryPerProduct.map(p => ({ product: p.product, data: p.data.map(d => d.healthy) })));

    setSummaryData(summaryDataPerProduct);
    setSelectedTableProduct(selectedProductNums[0]);

    const datasets = [];
    summaryPerProduct.forEach(({ product, data }) => {
      datasets.push({
        label: `Healthy - Butterhead ${product}`,
        data: data.map((d) => d.healthy),
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        fill: false,
        hidden: selectedGraph !== "Healthy"
      });
      datasets.push({
        label: `Leaf Spot - Butterhead ${product}`,
        data: data.map((d) => d.leafSpot),
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
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

  return (
    <div className="overview-container">
      <button className="back-button" onClick={() => navigate("/pages/services")}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1 className="overview-title">Overview</h1>

      <section className="section">
        <h2>Select Devices</h2>
        <div className="checkbox-container">
          {userProducts.length > 0 ? (
            userProducts.map((product, index) => (
              <label key={index} className="checkbox-label">
                <input type="checkbox" value={product} onChange={handleCheckboxChange} />
                Butterhead {product}
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

      <section className="section">
        <h2>Images Overview</h2>

        {productImages.length > 0 ? (
          <>
            {/* Dropdown สำหรับเลือก Product */}
            <div className="dropdown-container">
              <label htmlFor="product-select">Choose Device:</label>
              <select
                id="product-select"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">-- All Devices --</option>
                {[...new Set(productImages.map((img) => img.product))].map((product) => (
                  <option key={product} value={product}>
                    Butterhead {product}
                  </option>
                ))}
              </select>
            </div>

            {/* กรองและจัดกลุ่มภาพตาม date */}
            {Object.entries(
              productImages
                .filter((img) => !selectedProduct || img.product === selectedProduct)
                .reduce((acc, img) => {
                  const key = `${img.product}|${img.date}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(img);
                  return acc;
                }, {})
            ).map(([key, images]) => {
              const [product, date] = key.split("|");
              return (
                <div key={key} className="image-group">
                  <h3 className="product-label">Butterhead {product} - {date}</h3>
                  <div className="image-grid">
                    {images.map((img, index) => (
                      <div key={index} className="image-item">
                        <img src={img.imageUrl} alt={`Butterhead ${product}`} />
                        <p className="image-caption">{img.time}</p>
                      </div>
                    ))}
                  </div>
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
          {chartData.datasets.length > 0 ? <Line data={chartData} /> : <p>⚠️ No statistics available.</p>}
        </div>
      </section>

      <div className="section">
      <h2 className="summary-title">Summary Data</h2>
      <div className="product-tab-buttons">
        {Object.keys(summaryData).map((product) => (
          <button key={product} onClick={() => setSelectedTableProduct(product)} className={selectedTableProduct === product ? "active" : ""}>
            Butterhead {product}
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
            {summaryData[selectedTableProduct].map((row, index) => (
              <tr key={index}>
                <td>{row.range}</td>
                <td>{row.healthy}%</td>
                <td>{row.leafSpot}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      </div>
    </div>
  );
}

export default Overview;
