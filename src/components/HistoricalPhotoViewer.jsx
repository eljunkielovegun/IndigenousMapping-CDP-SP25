// HistoricalPhotoViewer.jsx
import { useState, useEffect, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { MapView } from '@deck.gl/core';
import { BitmapLayer } from '@deck.gl/layers';
import { MAPBOX_TOKEN } from '../config/mapbox';
import createPhotoMarkersLayer from './Layers/PhotoMarkersLayer';
import { createPhotoOverlayLayerSync } from './Layers/PhotoOverlayLayer';
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
  
  // Adjustment controls for photo positioning
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  // Handle photo selection when a marker is clicked
  const handlePhotoSelect = useCallback((id) => {
    try {
      const selectedPhoto = getPhotoById(id);
      if (selectedPhoto) {
        console.log("Selected photo:", selectedPhoto.name);
        console.log("Photo data:", JSON.stringify(selectedPhoto, null, 2));
        setActivePhotoId(id);
        
        // Reset adjustment controls when selecting a new photo
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
        setScale(1.0);
        
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
  
  // Create layers (markers and photo overlay)
  useEffect(() => {
    try {
      // Create photo markers layer
      const markers = createPhotoMarkersLayer({
        onPhotoSelect: handlePhotoSelect,
        selectedPhotoId: activePhotoId
      });
      
      const layersArray = [markers];
      
      // Add photo overlay for selected photo
      if (activePhotoId) {
        const selectedPhoto = getPhotoById(activePhotoId);
        if (selectedPhoto) {
          console.log(`Creating overlay for ${selectedPhoto.name}`);
          
          // Get photo parameters
          const bounds = selectedPhoto.overlay.bounds;
          const photoBearing = selectedPhoto.camera.bearing || 0;
          const pitch = selectedPhoto.camera.pitch || 0;
          const photoScale = selectedPhoto.overlay.scale || 1.0;
          
          // Get aspect ratio if available
          const aspectRatio = selectedPhoto.overlay.aspect || 1.33; // Default 4:3
          
          // Convert bounds from nested array to flat array
          const flatBounds = [
            bounds[0][0], // left/west
            bounds[0][1], // bottom/south
            bounds[1][0], // right/east
            bounds[1][1]  // top/north
          ];
          
          // Calculate center point
          const centerLon = (flatBounds[0] + flatBounds[2]) / 2;
          const centerLat = (flatBounds[1] + flatBounds[3]) / 2;
          
          // Calculate width and height in degrees
          const width = Math.abs(flatBounds[2] - flatBounds[0]);
          const height = Math.abs(flatBounds[3] - flatBounds[1]);
          
          // Adjust bounds to match desired aspect ratio
          let adjustedWidth, adjustedHeight;
          if (width / height > aspectRatio) {
            // Current shape is wider than desired, adjust width
            adjustedWidth = height * aspectRatio;
            adjustedHeight = height;
          } else {
            // Current shape is taller than desired, adjust height
            adjustedWidth = width;
            adjustedHeight = width / aspectRatio;
          }
          
          // Apply both photo scale and UI scale adjustment
          const combinedScale = photoScale * scale;
          adjustedWidth *= combinedScale;
          adjustedHeight *= combinedScale;
          
          // Apply manual offsets (convert from pixels to approximate degrees)
          const pixelToDegree = 0.0001; // Rough approximation
          const offsetLon = offsetX * pixelToDegree;
          const offsetLat = offsetY * pixelToDegree;
          
          // Calculate adjusted bounds with proper aspect ratio and offsets
          const adjustedBounds = [
            centerLon - adjustedWidth/2 + offsetLon,  // left
            centerLat - adjustedHeight/2 + offsetLat, // bottom
            centerLon + adjustedWidth/2 + offsetLon,  // right
            centerLat + adjustedHeight/2 + offsetLat  // top
          ];
          
          console.log("Original bounds:", flatBounds);
          console.log("Adjusted bounds:", adjustedBounds);
          
          // Create bitmap layer with rotation and adjusted bounds
          const photoLayer = new BitmapLayer({
            id: `photo-overlay-${selectedPhoto.id}`,
            bounds: adjustedBounds,
            image: window.location.origin + selectedPhoto.image_url,
            opacity: selectedPhoto.overlay.opacity || 0.7,
            // Create transformation matrix with combined bearing and pitch
            // Use both photo bearing and UI rotation adjustment
            modelMatrix: getTransformationMatrix(
              centerLon + offsetLon, 
              centerLat + offsetLat, 
              photoBearing + rotation, 
              pitch
            )
          });
          
          console.log(`Created bitmap layer for ${selectedPhoto.id} at bearing ${photoBearing + rotation}°`);
          layersArray.push(photoLayer);
        }
      }
      
      // Set layers
      setLayers(layersArray);
    } catch (err) {
      console.error("Error creating layers:", err);
      setError(`Failed to create layers: ${err.message}`);
    }
  }, [handlePhotoSelect, activePhotoId]);
  
  // Advanced helper function to create 3D transformation matrix
  function getTransformationMatrix(centerLon, centerLat, bearingDegrees, pitchDegrees = 0) {
    // Convert angles to radians
    const bearingRad = (bearingDegrees * Math.PI) / 180;
    const pitchRad = (pitchDegrees * Math.PI) / 180;
    
    // Get cos and sin of rotation angles
    const cosBearing = Math.cos(bearingRad);
    const sinBearing = Math.sin(bearingRad);
    const cosPitch = Math.cos(pitchRad);
    const sinPitch = Math.sin(pitchRad);
    
    // This is a simplified approximation - in a real implementation 
    // we would use proper 3D matrix math with appropriate projections
    
    // For simplicity, we're only implementing bearing rotation for now
    // Proper pitch would require 3D projection adjustments
    
    // Convert center to approximate mercator coordinates
    const scale = 100000; // approximate scale factor to make the translation visible
    const tx = centerLon * scale;
    const ty = centerLat * scale;
    
    // Create transformation matrix (in column-major format for WebGL)
    // Simplified to handle primarily bearing rotation
    return [
      cosBearing, sinBearing, 0, 0,                     // column 1
      -sinBearing, cosBearing, 0, 0,                    // column 2
      0, 0, 1, 0,                                       // column 3
      tx - cosBearing * tx + sinBearing * ty,           // translate back x
      ty - sinBearing * tx - cosBearing * ty,           // translate back y
      0, 1                                              // column 4
    ];
  }
  
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
        maxWidth: '300px',
        maxHeight: '80vh',
        overflowY: 'auto'
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
            <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
              {getPhotoById(activePhotoId)?.description}
            </p>
            
            {/* Photo adjustment controls */}
            <div style={{ marginTop: '10px' }}>
              <h5 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Adjust Photo Overlay:</h5>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ width: '80px', fontSize: '12px' }}>Position X:</label>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  value={offsetX} 
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{offsetX}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ width: '80px', fontSize: '12px' }}>Position Y:</label>
                <input 
                  type="range" 
                  min="-50" 
                  max="50" 
                  value={offsetY} 
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{offsetY}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ width: '80px', fontSize: '12px' }}>Rotation:</label>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={rotation} 
                  onChange={(e) => setRotation(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{rotation}°</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ width: '80px', fontSize: '12px' }}>Scale:</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2" 
                  step="0.1" 
                  value={scale} 
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{scale}x</span>
              </div>
              
              <button
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '5px'
                }}
                onClick={() => {
                  setOffsetX(0);
                  setOffsetY(0);
                  setRotation(0);
                  setScale(1.0);
                }}
              >
                Reset Adjustments
              </button>
            </div>
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
          attributionControl={true}
          terrain={{ source: 'mapbox-dem', exaggeration: 15 }}
        />
      </DeckGL>
    </div>
  );
}