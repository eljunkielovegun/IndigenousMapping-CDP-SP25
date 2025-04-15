// HistoricalPhotoGallery.jsx
import { useState } from 'react';
import { getAllPhotos } from '../data/historicalPhotoData';

export default function HistoricalPhotoGallery({ onSelectPhoto }) {
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const photos = getAllPhotos();
  
  const handlePhotoSelect = (photo) => {
    setSelectedPhotoId(photo.id);
    if (onSelectPhoto && typeof onSelectPhoto === 'function') {
      onSelectPhoto(photo.id);
    }
  };
  
  return (
    <div className="historical-photo-gallery" style={{ padding: '15px' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Historical Expedition Photos</h2>
      
      <div className="photo-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {photos.map(photo => (
          <div 
            key={photo.id}
            className={`photo-item ${selectedPhotoId === photo.id ? 'selected' : ''}`}
            onClick={() => handlePhotoSelect(photo)}
            style={{ 
              background: 'white', 
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              transform: selectedPhotoId === photo.id ? 'scale(1.02)' : 'scale(1)',
              border: selectedPhotoId === photo.id ? '2px solid #4a90e2' : '1px solid #ddd'
            }}
          >
            <div className="photo-thumbnail" style={{ height: '150px', overflow: 'hidden' }}>
              <img 
                src={photo.image_url} 
                alt={photo.description} 
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600/FF9900/FFFFFF?text=Image+Not+Found';
                  e.target.alt = 'Image not available';
                }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.3s'
                }}
              />
            </div>
            
            <div className="photo-info" style={{ padding: '12px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{photo.name}</h3>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                {photo.photographer}, {photo.year}
              </p>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px',
                fontStyle: 'italic',
                color: '#666'
              }}>
                {photo.description}
              </p>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Lat: {photo.coordinates.latitude.toFixed(4)}, 
                Lon: {photo.coordinates.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}