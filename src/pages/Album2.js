import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './css/Albums.css'; // Make sure your styles are defined here
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Album1T() {
  const { date } = useParams();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const plantImagesRef = collection(db, 'PLANT_IMAGES');
        const q = query(plantImagesRef, where('date', '==', date));

        const querySnapshot = await getDocs(q);
        const fetchedImages = querySnapshot.docs.map(doc => doc.data());

        const groupedByHour = fetchedImages.reduce((acc, image) => {
          const hour = image.time.split(':')[0];
          if (!acc[hour]) {
            acc[hour] = [];
          }
          acc[hour].push(image);
          return acc;
        }, {});

        setImages(groupedByHour);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [date]);

  return (
    <div className="albums-container">
      <Link to="/pages/albums-test" className="back-button">
        <img src="/img/back-icon.png" alt="Back" className="back-icon" />
      </Link>
      <h2 className="albums-title">Butterhead Album</h2>
      <p className="selected-date">{date}</p>

      {Object.keys(images).length > 0 ? (
        <div className="albums-grid">
          {Object.keys(images).map((hour, index) => (
            <Link key={index} to={`/pages/album3/${date}/${hour}`} className="album-card">
              <img src="/img/folder.png" alt="Album Icon" className="album-image" />
              <p className="album-text">{hour}:00</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-album-message">There's no album available for this date.</p>
      )}
    </div>
  );
}

export default Album1T;
