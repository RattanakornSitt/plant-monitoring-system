// Home.js
import React from 'react';

function Home({ toggleLogInPopup, toggleSignUpPopup }) {
  return (
    <main className="main-content" 
      style={{
        backgroundImage: "url('/img/wallpaper.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
      <h2>Welcome to the Plant Monitoring System</h2>
      <p>ระบบติดตามพืชและตรวจสอบสภาพพืช แจ้งเตือนปัญหาและให้คำแนะนำดูแล เพื่อการเกษตรที่ชาญฉลาด!</p>
      <div className="auth-buttons">
        <button className="login-btn" onClick={toggleLogInPopup}>Log in</button>
        <button className="sign-in-btn" onClick={toggleSignUpPopup}>Sign up</button>
      </div>
    </main>
  );
}

export default Home