// HelloPopup.js
import React from 'react';
import './css/hellopopup.css';

function HelloPopup({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="hello-popup" onClick={(e) => e.stopPropagation()}>
        <p className="hello-title">Please log in to<br />access our services</p>
        <img src="/img/veggy-2.png" alt="Hello Icon" className="hello-icon" />
      </div>
    </div>
  );
}

export default HelloPopup;
