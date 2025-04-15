// src/components/Map/PhotoMarker.jsx
import { useState, useEffect } from 'react';
import { Marker } from 'react-map-gl';
import { getPhotoById } from '../../data/historicalPhotoData';

export default function PhotoMarker({ photoId = 'mystic-lake', onMarkerClick }) {
  const [photoData, setPhotoData] = useState(null);
  
  useEffect(() => {
    const photo = getPhotoById(photoId);
    if (photo) {
      setPhotoData(photo);
    }
  }, [photoId]);
  
  const handleClick = () => {
    if (photoData && onMarkerClick) {
      onMarkerClick(photoData);
    }
  };
  
  if (!photoData) return null;
  
  return (
    <Marker
      longitude={photoData.coordinates.longitude}
      latitude={photoData.coordinates.latitude}
      anchor="bottom"
      onClick={handleClick}
    >
      <div 
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#FF5733',
          border: '2px solid white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>📷</div>
      </div>
    </Marker>
  );
}