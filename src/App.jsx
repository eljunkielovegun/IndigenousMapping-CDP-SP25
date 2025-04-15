import { useState, useCallback, useMemo, useEffect } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import MapboxStyleLoader from './components/DeckGL/MapboxStyleLoader';
import createPhotoMarkersLayer from './components/Layers/PhotoMarkersLayer';
import { createPhotoOverlayLayerSync } from './components/Layers/PhotoOverlayLayer';
import { getPhotoById, getAllPhotos } from './data/historicalPhotoData';
import { useViewState } from './hooks/deck/useViewState';

// Pre-defined optimal settings for photos
// These values come from the "Capture Settings" button logs
const OPTIMAL_PHOTO_SETTINGS = {
  "holy-cross": {
    "offsetX": 0,
    "offsetY": 0,
    "rotationX": 30,    // Pitch - rotation around X axis
    "rotationY": 0,     // Roll - rotation around Y axis
    "rotationZ": -20,   // Yaw - rotation around Z axis (bearing)
    "scale": 1.0
  },
  // Add more photos here as you optimize them
};

// Path to the custom Mapbox style
const CUSTOM_STYLE_URL = '/assets/geojson/mapBoxStyle.json';

export default function App() {
  const [error, setError] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [viewState, setViewState] = useState(null);
  const initialViewState = useViewState();
  const [territoriesVisible, setTerritoriesVisible] = useState({
    navajo: true,   // Navajo (Diné) Nation
    hopi: true,     // Hopi Nation
    zuni: true,     // Zuni Nation
    others: false   // All other territories
  });
  
  // Adjustment controls for photo positioning and 3D rotation
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0); // Rotation around Z-axis (bearing)
  const [rotationX, setRotationX] = useState(0); // Rotation around X-axis (pitch)
  const [rotationY, setRotationY] = useState(0); // Rotation around Y-axis (roll)
  const [photoScale, setPhotoScale] = useState(1.0);
  
  // Store for capturing optimized adjustments
  const [capturedSettings, setCapturedSettings] = useState({});
  
  // Load predefined settings on component mount
  useEffect(() => {
    // Initialize with our predefined optimal settings
    setCapturedSettings(OPTIMAL_PHOTO_SETTINGS);
    console.log("Loaded optimal photo settings:", OPTIMAL_PHOTO_SETTINGS);
  }, []);
  
  // Toggle a territory's visibility
  const toggleTerritory = useCallback((territory) => {
    setTerritoriesVisible(prev => ({
      ...prev,
      [territory]: !prev[territory]
    }));
  }, []);
  
  // Toggle all territories on/off
  const toggleAllTerritories = useCallback(() => {
    const allCurrentlyVisible = 
      territoriesVisible.navajo && 
      territoriesVisible.hopi && 
      territoriesVisible.zuni && 
      territoriesVisible.others;
    
    // If all are visible, turn all off; otherwise turn all on
    setTerritoriesVisible({
      navajo: !allCurrentlyVisible,
      hopi: !allCurrentlyVisible,
      zuni: !allCurrentlyVisible,
      others: !allCurrentlyVisible
    });
  }, [territoriesVisible]);
  
  // Use the current effective view state for calculations
  const effectiveViewState = viewState || initialViewState;
  
  // Function to capture the current photo settings for future use
  const captureCurrentSettings = useCallback(() => {
    if (!selectedPhotoId) return;
    
    // Save the current settings
    const settings = {
      id: selectedPhotoId,
      offsetX,
      offsetY,
      rotationX,
      rotationY,
      rotationZ,
      scale: photoScale
    };
    
    // Add to captured settings
    setCapturedSettings(prev => ({
      ...prev,
      [selectedPhotoId]: settings
    }));
    
    // Log for developer to copy
    console.log(`
// Optimized settings for ${selectedPhotoId}:
"${selectedPhotoId}": {
  "offsetX": ${offsetX},
  "offsetY": ${offsetY},
  "rotationX": ${rotationX},
  "rotationY": ${rotationY},
  "rotationZ": ${rotationZ},
  "scale": ${photoScale}
},`);
    
    return settings;
  }, [selectedPhotoId, offsetX, offsetY, rotationX, rotationY, rotationZ, photoScale]);

  // Handler for when a photo marker is clicked
  const handlePhotoSelect = useCallback((id) => {
    try {
      const photo = getPhotoById(id);
      if (photo) {
        console.log("Selected photo:", photo.name);
        console.log("Camera data:", photo.camera);
        setSelectedPhotoId(id);
        
        // Check if we have saved settings for this photo
        if (capturedSettings[id]) {
          // Use saved settings
          const saved = capturedSettings[id];
          setOffsetX(saved.offsetX || 0);
          setOffsetY(saved.offsetY || 0);
          setRotationX(saved.rotationX || 0);
          setRotationY(saved.rotationY || 0);
          setRotationZ(saved.rotationZ || saved.rotation || 0); // Backward compatibility
          setPhotoScale(saved.scale || 1.0);
          console.log("Applied saved settings for photo:", id);
        } else {
          // Reset adjustment controls for new photos
          setOffsetX(0);
          setOffsetY(0);
          setRotationX(0);
          setRotationY(0);
          setRotationZ(0);
          setPhotoScale(1.0);
        }
        
        // Update the view state to zoom to the selected photo
        // Handle negative pitch values (DeckGL doesn't support negative pitch, only 0-85 degrees)
        let pitchValue = photo.camera.pitch || 60;
        if (pitchValue < 0) {
          pitchValue = 0; // Set minimum pitch to 0 when negative values are encountered
        }
        
        // Calculate current position (assuming we're showing something)
        const currentLng = effectiveViewState?.longitude || initialViewState.longitude;
        const currentLat = effectiveViewState?.latitude || initialViewState.latitude;
        const currentZoom = effectiveViewState?.zoom || initialViewState.zoom;
        
        // Destination position from photo
        const destLng = photo.camera.viewpoint.longitude;
        const destLat = photo.camera.viewpoint.latitude;
        const destZoom = photo.camera.zoom || 12;
        const destBearing = photo.camera.bearing || 0;
        const destPitch = pitchValue;
        
        // Calculate distance (rough approximation)
        const distance = Math.sqrt(
          Math.pow(currentLng - destLng, 2) + 
          Math.pow(currentLat - destLat, 2)
        );
        
        // Use built-in flyTo interpolator with curved path and swooping effect
        
        // Set up to use the built-in FlyToInterpolator from deck.gl
        const newViewState = {
          longitude: destLng,
          latitude: destLat,
          zoom: destZoom,
          pitch: destPitch, 
          bearing: destBearing,
          transitionDuration: 3000, // 3 seconds total
          transitionInterpolator: new FlyToInterpolator({
            speed: 1.2,          // Slightly faster flight
            curve: 1.5,          // More curved path for dramatic effect
            screenSpeed: 15,     // Control screen-space speed
            maxDuration: 3000    // Maximum flight time
          }),
          transitionEasing: t => {
            // Ease-in-out cubic for smooth motion
            return t < 0.5
              ? 4 * t * t * t
              : 1 - Math.pow(-2 * t + 2, 3) / 2;
          }
        };
        
        // Store constraints separately to enforce in MapboxStyleLoader
        // Don't include these in the viewState object directly
        const viewStateConstraints = {
          maxZoom: photo.camera.zoom + 2, // Limit max zoom to slightly more than camera setting
          minZoom: photo.camera.zoom - 2, // Limit min zoom to slightly less than camera setting
          maxPitch: pitchValue + 10, // Limit max pitch to slightly more than camera setting
          minPitch: Math.max(0, pitchValue - 10) // Limit min pitch to slightly less than camera setting
        };
        
        console.log("Setting viewState:", newViewState);
        setViewState(newViewState);
      }
    } catch (err) {
      console.error("Error selecting photo:", err);
      setError(`Failed to select photo: ${err.message}`);
    }
  }, []);

  // Create the photo markers layer and photo overlay if a photo is selected
  const layers = useMemo(() => {
    const layerList = [
      createPhotoMarkersLayer({
        onPhotoSelect: handlePhotoSelect,
        selectedPhotoId: selectedPhotoId
      })
    ];
    
    // Add photo overlay layer if a photo is selected
    if (selectedPhotoId) {
      const photoData = getPhotoById(selectedPhotoId);
      if (photoData) {
        // Create an overlay layer for the selected photo
        try {
          // Create a modified photo data object with our adjustments
          const adjustedPhotoData = {
            ...photoData,
            camera: {
              ...photoData.camera,
              // Apply 3D rotations
              bearing: (photoData.camera.bearing || 0) + rotationZ,
              pitch: (photoData.camera.pitch || 0) + rotationX
            },
            overlay: {
              ...photoData.overlay,
              // Apply our scale adjustment
              scale: (photoData.overlay.scale || 1.0) * photoScale,
              // Add custom properties for our adjustments
              customOffsetX: offsetX,
              customOffsetY: offsetY,
              customRotationY: rotationY // Y-axis rotation (roll)
            }
          };
          
          // Create the photo overlay with our adjustments
          const photoOverlay = createPhotoOverlayLayerSync(
            adjustedPhotoData, 
            0.8  // 80% opacity for better visibility
          );
          
          console.log("Created photo overlay for:", photoData.name, "with adjustments");
          
          if (photoOverlay) {
            layerList.push(photoOverlay);
          }
        } catch (err) {
          console.error("Error creating photo overlay:", err);
        }
      }
    }
    
    return layerList;
  }, [selectedPhotoId, handlePhotoSelect, offsetX, offsetY, rotationX, rotationY, rotationZ, photoScale]);
  
  // Render selected photo info if a photo is selected
  const selectedPhoto = selectedPhotoId ? getPhotoById(selectedPhotoId) : null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'white', padding: '10px', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Indigenous Territories & Expeditions</h3>
        
        {/* Legend */}
        <div style={{ fontSize: '12px', marginBottom: '10px' }}>
          <div><span style={{ color: 'hsla(0, 99%, 61%, 0.83)', fontWeight: 'bold' }}>▬▬▬</span> Hillers Expedition</div>
          <div><span style={{ color: 'hsl(199, 100%, 43%)', fontWeight: 'bold' }}>▬▬▬</span> Jackson Expedition</div>
          <div><span style={{ color: 'hsla(54, 72%, 49%, 0.6)', fontWeight: 'bold' }}>▬▬▬</span> Travel Routes</div>
          <div><span style={{ color: 'hsl(54, 100%, 50%)', fontWeight: 'bold' }}>●</span> Major Cities</div>
          <div><span style={{ color: 'hsl(30, 100%, 50%)', fontWeight: 'bold' }}>●</span> General Photo Locations</div>
          <div><span style={{ color: 'rgb(255, 87, 51)', fontWeight: 'bold' }}>●</span> Jackson Photos</div>
          <div><span style={{ color: 'rgb(75, 144, 226)', fontWeight: 'bold' }}>●</span> Hillers Photos</div>
        </div>
        
        {/* Territory Controls */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '5px' }}>
          <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Territory Visibility</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.navajo}
                onChange={() => toggleTerritory('navajo')}
                style={{ marginRight: '5px' }}
              />
              <span style={{ color: 'hsla(0, 99%, 61%, 0.83)' }}>Diné (Navajo)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.hopi}
                onChange={() => toggleTerritory('hopi')}
                style={{ marginRight: '5px' }}
              />
              <span style={{ color: 'hsla(294, 66%, 34%, 0.83)' }}>Hopi</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.zuni}
                onChange={() => toggleTerritory('zuni')}
                style={{ marginRight: '5px' }}
              />
              <span style={{ color: 'hsla(249, 70%, 59%, 0.83)' }}>Zuni</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.others}
                onChange={() => toggleTerritory('others')}
                style={{ marginRight: '5px' }}
              />
              <span style={{ color: 'hsla(156, 66%, 34%, 0.83)' }}>Other Territories</span>
            </label>
            
            <button 
              onClick={toggleAllTerritories} 
              style={{ 
                marginTop: '5px', 
                padding: '3px', 
                fontSize: '11px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {territoriesVisible.navajo && 
                territoriesVisible.hopi && 
                territoriesVisible.zuni && 
                territoriesVisible.others ? 'Hide All' : 'Show All'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 50, 
          left: 10, 
          zIndex: 10, 
          background: 'red', 
          color: 'white', 
          padding: '10px' 
        }}>
          Error: {error}
        </div>
      )}
      
      {/* Display selected photo info */}
      {selectedPhoto && (
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
          overflowY: 'auto',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: '0 0 5px 0' }}>{selectedPhoto.name}</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            Photographer: {selectedPhoto.photographer}, {selectedPhoto.year}
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
            {selectedPhoto.description}
          </p>
          
          {/* Photo adjustment controls */}
          <div style={{ marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Adjust Photo Overlay:</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontSize: '12px' }}>Position X:</label>
              <input 
                type="range" 
                min="-100" 
                max="100" 
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
                min="-100" 
                max="100" 
                value={offsetY} 
                onChange={(e) => setOffsetY(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{offsetY}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontSize: '12px' }}>Rot-Z (Yaw):</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotationZ} 
                onChange={(e) => setRotationZ(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{rotationZ}°</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontSize: '12px' }}>Rot-X (Pitch):</label>
              <input 
                type="range" 
                min="-90" 
                max="90" 
                value={rotationX} 
                onChange={(e) => setRotationX(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{rotationX}°</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontSize: '12px' }}>Rot-Y (Roll):</label>
              <input 
                type="range" 
                min="-90" 
                max="90" 
                value={rotationY} 
                onChange={(e) => setRotationY(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{rotationY}°</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ width: '80px', fontSize: '12px' }}>Scale:</label>
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1" 
                value={photoScale} 
                onChange={(e) => setPhotoScale(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ marginLeft: '5px', fontSize: '12px', width: '30px' }}>{photoScale.toFixed(1)}x</span>
            </div>
            
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => {
                    setOffsetX(0);
                    setOffsetY(0);
                    setRotationX(0);
                    setRotationY(0);
                    setRotationZ(0);
                    setPhotoScale(1.0);
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
                
                <button
                  onClick={() => captureCurrentSettings()}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Logs current settings to console for saving"
                >
                  Capture Settings
                </button>
                
                <button
                  onClick={() => setSelectedPhotoId(null)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    backgroundColor: '#4a90e2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
              
              {capturedSettings[selectedPhotoId] && (
                <div style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#f0f8ff', 
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#444'
                }}>
                  Settings saved for this photo!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Use the custom style */}
      <MapboxStyleLoader 
        styleUrl={CUSTOM_STYLE_URL}
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        territoriesVisible={territoriesVisible}
      />
    </div>
  );
}