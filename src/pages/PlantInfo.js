import React from 'react';
import './css/PlantInfo.css';

function PlantInfo() {
  return (
    <div className="plant-information-container">
      <button className="back-button" onClick={() => window.history.back()}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span>Back</span>
      </button>

      {/* Plant Information Section */}
      <section className="plant-information-content">
        <h1>Plant Information</h1>

        {/* Container with Plant Image Box and Information Box */}
        <div className="plant-info-container">
          {/* Plant Image Box */}
          <div className="plant-image-box">
            <img src="/img/butterhead.jpg" alt="Butterhead Lettuce" />
          </div>

          {/* Plant Information Box */}
          <div className="plant-info-box">
            <h2>Butterhead Lettuce Details</h2>
            <p>
              Butterhead lettuce is a leafy vegetable characterized by its smooth, tender leaves that form loose heads. It grows well in cool weather and is a rich source of vitamins A and K.
            </p>
            <ul>
              <li>Ideal Growing Temperature: 10-20°C</li>
              <li>Watering Needs: Regular watering to keep soil moist</li>
              <li>Harvest Time: 45-60 days</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PlantInfo;
