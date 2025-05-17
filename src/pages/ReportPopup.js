import React, { useState, useEffect } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './css/ReportPopup.css';

function ReportPopup({ onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [caseID, setCaseID] = useState(''); // เพิ่ม state สำหรับ case_ID

  useEffect(() => {
    // สร้าง case_ID ทันทีเมื่อ popup เปิด
    const generateCaseID = () => {
      const randomID = 'CASE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setCaseID(randomID);
    };

    // ดึงข้อมูลผู้ใช้จาก Firebase Auth
    const fetchUser = () => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUsername(user.displayName || user.email || '');
        } else {
          setUsername('');
        }
      });
    };

    generateCaseID();
    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileURL = '';
      if (file) {
        const fileRef = ref(storage, `reports/${file.name}-${Date.now()}`);
        await uploadBytes(fileRef, file);
        fileURL = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'REPORT'), {
        case_ID: caseID, // บันทึก case_ID ไปด้วย
        username,
        reason,
        description,
        fileURL,
        createdAt: serverTimestamp(),
      });

      alert('Report submitted successfully!');
      setReason('');
      setDescription('');
      setFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-popup-overlay">
      <div className="report-popup-content">
        <span className="report-popup-close" onClick={onClose}>&times;</span>
        <h2>Report System Problem</h2>
        
        {/* แสดง case_ID */}
        <div className="case-id-display">
          <strong>Case ID:</strong> {caseID}
        </div>

        <form className="report-popup-form" onSubmit={handleSubmit}>
          <label>Reason for Report:</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <label>Attach File (optional):</label>
          <input type="file" onChange={handleFileChange} />

          <button
            className="report-popup-submit-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportPopup;
