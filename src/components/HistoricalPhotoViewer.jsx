// HistoricalPhotoViewer.jsx
import { useState, useEffect, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { MapView } from '@deck.gl/core';
import { MAPBOX_TOKEN } from '../config/mapbox';
import createPhotoMarkersLayer from './Layers/PhotoMarkersLayer';
import { getPhotoById } from '../data/historicalPhotoData';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set mapbox token globally
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function HistoricalPhotoViewer({ photoId = 'mystic-lake' }) {
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -110, // Center on the Southwest US
    latitude: 40,
    zoom: 5,
    pitch: 45, // Add some pitch to better see the terrain
    bearing: 0,
    maxPitch: 85,
    minZoom: 2,
    maxZoom: 20,
    transitionDuration: 1000
  });
  const [layers, setLayers] = useState([]);
  const [activePhotoId, setActivePhotoId] = useState(null);
  
  // Handle photo selection when a marker is clicked
  const handlePhotoSelect = useCallback((id) => {
    try {
      const selectedPhoto = getPhotoById(id);
      if (selectedPhoto) {
        console.log("Selected photo:", selectedPhoto.name);
        setActivePhotoId(id);
        
        // Update viewState to fly to the selected photo's camera position
        setViewState({
          longitude: selectedPhoto.camera.viewpoint.longitude,
          latitude: selectedPhoto.camera.viewpoint.latitude,
          zoom: selectedPhoto.camera.zoom || 12,
          pitch: selectedPhoto.camera.pitch || 45,
          bearing: selectedPhoto.camera.bearing || 0,
          transitionDuration: 1000
        });
      }
    } catch (err) {
      console.error("Error handling photo selection:", err);
      setError(`Failed to select photo: ${err.message}`);
    }
  }, []);
  
  // Create marker layer
  useEffect(() => {
    try {
      // Create photo markers layer
      const markers = createPhotoMarkersLayer({
        onPhotoSelect: handlePhotoSelect,
        selectedPhotoId: activePhotoId
      });
      
      // Set layers - only markers for now
      setLayers([markers]);
    } catch (err) {
      console.error("Error creating layers:", err);
      setError(`Failed to create layers: ${err.message}`);
    }
  }, [handlePhotoSelect, activePhotoId]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          zIndex: 10, 
          background: 'red', 
          color: 'white', 
          padding: '5px',
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}
      
      {/* Control panel */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 10, 
        background: 'rgba(255, 255, 255, 0.8)', 
        padding: '10px',
        borderRadius: '4px',
        maxWidth: '300px' 
      }}>
        <h3>Historical Photo Locations</h3>
        <p>Click on any marker to zoom to that location</p>
        <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
          <li><span style={{ color: 'rgb(255, 87, 51)' }}>●</span> Jackson photos</li>
          <li><span style={{ color: 'rgb(75, 144, 226)' }}>●</span> Hillers photos</li>
        </ul>
        
        {activePhotoId && (
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>{getPhotoById(activePhotoId)?.name}</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
              {getPhotoById(activePhotoId)?.photographer}, {getPhotoById(activePhotoId)?.year}
            </p>
            <p style={{ margin: '0', fontSize: '12px' }}>
              {getPhotoById(activePhotoId)?.description}
            </p>
          </div>
        )}
      </div>
      
      {/* DeckGL Map */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={layers}
        views={new MapView({ repeat: true })}
        onError={(err) => {
          console.error("DeckGL Error:", err);
          setError(`DeckGL error: ${err.message}`);
        }}
        getTooltip={({object}) => object && `${object.name} (${object.year})\nBy: ${object.photographer}`}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          reuseMaps
          orthographic: false
          attributionControl={true}
          terrain={{ source: 'mapbox-dem', exaggeration: 15 }}
        />
      </DeckGL>
    </div>
  );
}