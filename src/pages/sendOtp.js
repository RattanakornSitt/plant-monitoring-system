// sendOtp.js

import nodemailer from 'nodemailer';

// ฟังก์ชันในการส่ง OTP ไปยังอีเมล
const sendOtpToEmail = async (email) => {
  try {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    console.log("Generated OTP:", generatedOtp);

    // สร้าง transporter สำหรับส่งอีเมล (ในตัวอย่างนี้ใช้ Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${generatedOtp}`
    };

    // ส่ง OTP ไปที่อีเมล
    await transporter.sendMail(mailOptions);
    console.log("OTP sent to email:", email);

    // เก็บ OTP ในตัวแปรหรือตัวเก็บข้อมูล (สามารถเก็บในฐานข้อมูลหรือ session ก็ได้)
    return generatedOtp; // OTP ที่ใช้ในการตรวจสอบ
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};

export default sendOtpToEmail;
