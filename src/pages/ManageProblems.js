import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import "./css/ManageProblems.css";

function ManageSystemProblems() {
  const db = getFirestore();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchDate, setSearchDate] = useState("");

  const fetchReports = async () => {
    const reportRef = collection(db, "REPORT");
    let q = query(reportRef, orderBy("createdAt", "desc"));

    if (searchDate) {
      const selectedDate = new Date(searchDate);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);

      q = query(
        reportRef,
        where("createdAt", ">=", selectedDate),
        where("createdAt", "<", nextDate),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    const reportData = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setReports(reportData);
  };

  const markAsResolved = async (reportId) => {
    const reportRef = doc(db, "REPORT", reportId);
    await updateDoc(reportRef, { resolved: true });
    fetchReports();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="manage-problems-container">
      <button className="back-button" onClick={() => navigate('/pages/AdminDashboard')}>
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </button>
      <h1>Manage System Problems</h1>
      <div className="search-controls">
        <label>Date: </label>
        <input
          type="date"
          style={{ width: "250px" }}
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        <button onClick={fetchReports}>Search</button>
        <button onClick={() => { setSearchDate(""); fetchReports(); }}>Show All</button>
      </div>

      <div className="report-list">
        {reports.map((report) => (
          <div key={report.id} className={`report-card ${report.resolved ? "resolved" : ""}`}>
            <h3>Report by {report.username}</h3>
            <p><strong>Case ID:</strong> {report.case_ID || '-'}</p> {/* เพิ่มการแสดง case_ID */}
            <p><strong>Reason:</strong> {report.reason}</p>
            <p><strong>Description:</strong> {report.description || "-"}</p> {/* เปลี่ยนจาก Subscription เป็น Description */}
            <p><strong>Date:</strong> {report.createdAt?.toDate().toLocaleString()}</p>
            {report.fileURL && (
              <div>
                <a href={report.fileURL} target="_blank" rel="noopener noreferrer">
                  View Attachment
                </a>
              </div>
            )}
            {!report.resolved ? (
              <div className="button-container">
                <button className="mark-button" onClick={() => markAsResolved(report.id)}>
                  Mark as Resolved
                </button>
              </div>
            ) : (
              <div className="button-container">
                <div className="resolved-label">✔ Resolved</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageSystemProblems;
