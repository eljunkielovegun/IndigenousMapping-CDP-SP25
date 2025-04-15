// src/components/Map/HistoricalPhotoMap.jsx
import { useState, useEffect } from 'react';
import { Map, Marker } from 'react-map-gl';
import MapboxStyleLoader from '../DeckGL/MapboxStyleLoader';
import { getPhotoById } from '../../data/historicalPhotoData';
import { MAPBOX_TOKEN } from '../../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function HistoricalPhotoMap({ photoId = 'mystic-lake' }) {
  const [photoData, setPhotoData] = useState(null);
  
  useEffect(() => {
    const photo = getPhotoById(photoId);
    if (photo) {
      setPhotoData(photo);
    }
  }, [photoId]);
  
  const handleMarkerClick = () => {
    if (!photoData) return;
    
    // Access the map instance directly and fly to the camera position
    const map = document.querySelector('.mapboxgl-map').__mapboxgl;
    if (map) {
      map.flyTo({
        center: [
          photoData.camera.viewpoint.longitude,
          photoData.camera.viewpoint.latitude
        ],
        zoom: photoData.camera.zoom,
        pitch: photoData.camera.pitch,
        bearing: photoData.camera.bearing,
        duration: 2000 // 2 seconds
      });
    }
  };
  
  if (!photoData) return null;
  
  return (
    <div className="historical-photo-marker" 
         style={{ 
           position: 'absolute', 
           left: '50%', 
           top: '50%', 
           transform: 'translate(-50%, -50%)', 
           zIndex: 10,
           pointerEvents: 'none' // Makes it not interfere with map interactions
         }}
    >
      <div 
        onClick={handleMarkerClick}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#FF5733',
          border: '2px solid white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto' // Make just the marker clickable
        }}
      >
        <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>📷</div>
      </div>
    </div>
  );
}