import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Support.css';
import ReportPopup from './ReportPopup';

function Support() {
  const navigate = useNavigate();
  const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState([false, false, false]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const toggleFaq = (index) => {
    setIsFaqOpen((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const toggleGuide = () => {
    setIsGuideOpen(!isGuideOpen);
  };

  const openReportPopup = () => {
    setIsReportPopupOpen(true);
  };

  const closeReportPopup = () => {
    setIsReportPopupOpen(false);
  };

  return (
    <div className="support-container">
      <button className="back-button" onClick={() => navigate('/pages/main')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
        <span></span>
      </button>

      <section className="support-title">
        <h1>Support</h1>
      </section>

      <section className="report-problem">
        <p onClick={openReportPopup} className="report-link">
          📩 Report System Problems
        </p>
      </section>

      {isReportPopupOpen && <ReportPopup onClose={closeReportPopup} />}

      <section className="faq">
        <h2>❓ FAQ</h2>

        <div className="faq-item">
          <p onClick={() => toggleFaq(0)} className="faq-question">
            🌿 What is the plant monitoring system?
          </p>
          {isFaqOpen[0] && (
            <div className="faq-answer">
              <p>
                Our plant monitoring system is an advanced tool designed to help farmers and gardeners track the health of their crops in real-time.
                It detects plant diseases and pests using AI image analysis, and provides alerts via web notification.
                Daily images are captured using a camera module, and personalized care tips are generated based on plant health status.
              </p>
            </div>
          )}
        </div>

        <div className="faq-item">
          <p onClick={() => toggleFaq(1)} className="faq-question">
            📹 How can I monitor my plants?
          </p>
          {isFaqOpen[1] && (
            <div className="faq-answer">
              <p>
                You can monitor your plants using the camera installed in your greenhouse or field. 
                Our system captures images twice daily and streams live video.
                You can log in to your dashboard to see growth history, disease alerts, and camera status.
              </p>
            </div>
          )}
        </div>

        <div className="faq-item">
          <p onClick={() => toggleFaq(2)} className="faq-question">
          🔍🌿 What do I do if my plant has a disease?
          </p>
          {isFaqOpen[2] && (
            <div className="faq-answer">
              <p>
                When a disease is detected, the system will notify you immediately and display information on the type of threat.
                You will also receive scientifically backed recommendations for organic or chemical treatments, prevention tips, and the option to contact support.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="guides">
        <h2>📘 Guides</h2>
        <div className="guide-item">
          <p onClick={toggleGuide} className="guide-question">
            🛠️ How to use the plant monitoring system?
          </p>
          {isGuideOpen && (
            <div className="guide-answer">
              <p>
                <strong>Step 1:</strong> Install the Raspberry Pi with a camera module near your plant bed.<br />
                <strong>Step 2:</strong> Register your device in the system dashboard.<br />
                <strong>Step 3:</strong> Schedule image capturing and monitoring frequency.<br />
                <strong>Step 4:</strong> Review alerts and suggestions daily via your dashboard.<br />
                <strong>Step 5:</strong> Export reports for analysis and compare trends across time.<br /><br />
                Our user-friendly interface ensures even first-time users can navigate the features with ease.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Support;
