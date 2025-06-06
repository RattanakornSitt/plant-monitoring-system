import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AboutUs.css';

function AboutUs() {
  const navigate = useNavigate(); // Initialize navigate for navigation
  
  return (
    <div className="about-us-container">
        <button className="back-button" onClick={() => navigate('/pages/main')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span></span>
      </button>
      {/* About Us Information Section */}
      <section className="about-us-info">
        <h1>About Us</h1>
      </section>

      {/* Product and System Section Container */}
      <div className="product-system-container">
        {/* 3 กล่องเรียงกันแนวนอน */}
        <div className="side-by-side-boxes">
          {/* Plant Monitoring */}
          <section className="plant-monitoring-system box">
            <h2>Plant Monitoring System</h2>
            <p>ระบบติดตามการเจริญเติบโตของพืชผ่านกล้องและตรวจสอบสภาพพืช แจ้งเตือนปัญหาเกี่ยวกับโรคพืชและให้คำแนะนำการดูแล เพื่อการเกษตรที่ชาญฉลาด</p>
          </section>

          {/* About Product */}
          <section className="about-product box">
            <h2>About Our Device</h2>
            <div className="product-image">
              <img src="/img/device.jpg" alt="Our Product" />
            </div>
          </section>

          {/* Key Features */}
          <section className="key-features box">
            <h2>Key Features</h2>
            <ul>
              <li>แจ้งเตือนเมื่อพบว่าพืชเป็นโรค</li>
              <li>ติดตามพืชผ่านวีดีโอเรียลไทม์</li>
              <li>เก็บภาพพืชทุกวันเวลา 9:00 และ 15:00</li>
              <li>แสดงสถิติการเกิดโรคของพืช</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Contact Us Section */}
      <section className="contact-us">
        <div className="contact-info">
        <h1>Contact Us</h1>
          <div className="contact-item">
          <img src="/img/phone-1.png" alt="Phone" className="contact-icon" />
            <span>02-12345678</span>
          </div>
          <div className="contact-item">
          <img src="/img/email.png" alt="Email" className="contact-icon" />
            <span>plantmonitoring@gmail.com</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
