import { useState, useCallback, useMemo, useRef } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import MapboxStyleLoader from './components/DeckGL/MapboxStyleLoader';
import createPhotoMarkersLayer from './components/Layers/PhotoMarkersLayer';
import { createPhotoOverlayLayerSync } from './components/Layers/PhotoOverlayLayer';
import { getPhotoById, getAllPhotos } from './data/historicalPhotoData';
import { useViewState } from './hooks/deck/useViewState';
import { useGestureHandlers } from './hooks/useGestureHandlers';
import { MAPBOX_TOKEN } from './config/mapbox';

import { getAssetPath } from './utils/assetUtils';

// Path to the custom Mapbox style
const CUSTOM_STYLE_URL = getAssetPath('assets/geojson/mapBoxStyle.json');

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
  const [showMapboxMarkers, setShowMapboxMarkers] = useState(false);
  
  // Photo adjustment controls
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);
  
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
  
  // Set up gesture handlers for navigation, including the "go home" feature
  const { gestureBindings, goToHomeView } = useGestureHandlers(setViewState, setSelectedPhotoId);
  
  // Reference to the main container for gesture binding
  const containerRef = useRef(null);
  
  // Handler for when a photo marker is clicked
  const handlePhotoSelect = useCallback((id) => {
    try {
      const photo = getPhotoById(id);
      if (photo) {
        setSelectedPhotoId(id);
        
        // Reset photo adjustments when selecting a new photo
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
        setScale(1.0);
        
        // Turn off territory overlays when selecting a photo
        setTerritoriesVisible({
          navajo: false,
          hopi: false,
          zuni: false,
          others: false
        });
        
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
        
        // For Holy Cross Mountain, ensure we can zoom in very close
        let flightSpeed = 1.2;
        let flightCurve = 1.5;
        
        // Special handling for Holy Cross Mountain - it needs a closer view
        if (id === 'holy-cross') {
          // Use exact zoom from photo data - don't clamp it
          flightSpeed = 1.0; // Slower speed for precision
          flightCurve = 1.2; // Less curved path for more control
        }
        
        // Set up to use the built-in FlyToInterpolator from deck.gl
        const newViewState = {
          longitude: destLng,
          latitude: destLat,
          zoom: destZoom,
          pitch: destPitch, 
          bearing: destBearing,
          transitionDuration: 3000, // 3 seconds total
          transitionInterpolator: new FlyToInterpolator({
            speed: flightSpeed,
            curve: flightCurve,
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
        
        // Set the new view state
        setViewState(newViewState);
      }
    } catch (err) {
      console.error("Error selecting photo:", err);
      setError(`Failed to select photo: ${err.message}`);
    }
  }, [effectiveViewState, initialViewState]);

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
        // Add custom adjustment properties to photo data
        const adjustedPhotoData = {
          ...photoData,
          overlay: {
            ...photoData.overlay,
            customOffsetX: offsetX,
            customOffsetY: offsetY,
            customRotationY: rotation,
            scale: photoData.overlay.scale ? photoData.overlay.scale * scale : scale
          }
        };
        
        // Create an overlay layer for the selected photo
        try {
          const photoOverlay = createPhotoOverlayLayerSync(
            adjustedPhotoData, 
            0.8  // 80% opacity for better visibility
          );
          
          // Successfully created overlay
          
          if (photoOverlay) {
            layerList.push(photoOverlay);
          }
        } catch (err) {
          console.error("Error creating photo overlay:", err);
        }
      }
    }
    
    return layerList;
  }, [selectedPhotoId, handlePhotoSelect, offsetX, offsetY, rotation, scale]);
  
  // Render selected photo info if a photo is selected
  const selectedPhoto = selectedPhotoId ? getPhotoById(selectedPhotoId) : null;

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
      {...gestureBindings()}
    >
      {/* Flat Mini-map for returning to the initial view */}
      <div
        onClick={goToHomeView}
        style={{
          position: 'absolute',
          bottom: '5vw',
          right: '5vw',
          zIndex: 15,
          background: 'transparent',
          border: 'none',
          borderRadius: '8px',
          width: '128px',
          height: '128px',
          overflow: 'visible',
          cursor: 'pointer'
        }}
        title="Return to home view (you can also swipe left with three fingers or long drag left)"
      >
        {/* Mini-map content with indigenous territories overlay */}
        <div style={{ 
          width: '120px', 
          height: '120px',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px',
          position: 'absolute',
          top: '4px',
          left: '4px',
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}>
        
        {/* Outer white border ring */}
        <div style={{
          position: 'absolute',
          top: -4,
          left: -4,
          width: 'calc(100% + 8px)',
          height: 'calc(100% + 8px)',
          borderRadius: '8px',
          border: '4px solid rgb(255, 255, 255)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          zIndex: 2
        }}></div>
          {/* Base layer with Mapbox satellite */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-110.2,36.5,4.5,0/120x120@2x?attribution=false&logo=false&access_token=${MAPBOX_TOKEN})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1.0
          }}></div>
          
          {/* Native Land territories (using SVG approach since map is static) */}
          <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
            {/* Navajo (Diné) Territory */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{position: 'absolute', top: 0, left: 0}}>
              <path d="M22 42 C38 30 50 33 60 33 C75 33 90 42 105 48 C102 60 97 72 90 82 C75 90 60 87 38 75 C22 60 22 42 22 42 Z" 
                    fill="hsla(0, 99%, 61%, 0.5)" 
                    strokeWidth="1.5" 
                    stroke="hsl(0, 99%, 41%)" />
            </svg>
            
            {/* Hopi Territory */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{position: 'absolute', top: 0, left: 0}}>
              <circle cx="60" cy="57" r="12" 
                    fill="hsla(294, 66%, 34%, 0.5)" 
                    strokeWidth="1.5" 
                    stroke="hsl(294, 66%, 24%)" />
            </svg>
            
            {/* Zuni Territory */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{position: 'absolute', top: 0, left: 0}}>
              <path d="M38 72 L57 82 L68 72 L53 60 Z" 
                    fill="hsla(249, 70%, 59%, 0.5)" 
                    strokeWidth="1.5" 
                    stroke="hsl(249, 70%, 39%)" />
            </svg>
          </div>
          
          {/* Simple overlay for flat map */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
            pointerEvents: 'none'
          }}></div>
          
          {/* Current view indicator - white dot */}
          <div style={{
            position: 'absolute',
            border: '1px solid rgba(0, 0, 0, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 1)', // Solid white
            borderRadius: '50%',
            width: '10px',
            height: '10px',
            transform: 'translate(-50%, -50%)',
            // Calculate position on the mini-map based on longitude/latitude
            // Adjusted for Southwest focus with territories
            left: `${Math.min(Math.max(((effectiveViewState.longitude + 118) / 16 * 100), 0), 100)}%`,
            top: `${Math.min(Math.max(((45 - effectiveViewState.latitude) / 15 * 100), 0), 100)}%`,
            pointerEvents: 'none',
            transition: 'all 0.3s ease-out',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}></div>
          
          {/* No home icon - clean minimalist design */}
        </div>
      </div>
      
      <div style={{ position: 'absolute', top: '2vw', left: '2vw', zIndex: 10 }}>
        <h1 className="geographica-hand" style={{ 
          margin: 0,
          padding: 0,
          color: 'white',
          fontSize: '6rem',
          letterSpacing: '0em',
          textShadow: '3px 3px 6px rgba(0,0,0,0.6)',
          lineHeight: '1.1'
        }}>
          Tied To The Land
        </h1>
        
        <h2 className="aldine-regular" style={{ 
          margin: '0.5rem 0 0 0',
          padding: 0,
          color: 'white',
          fontSize: '2.5rem',
          maxWidth: '45vw',
          textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
          lineHeight: '1.2'
        }}>
          Explore the Jackson-Hillers photographs situated in original Indigenous territories and their history.
        </h2>
      </div>
      
      <div style={{ position: 'absolute', bottom: '5vw', left: '5vw', zIndex: 10, background: 'white', padding: '10px', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
        <h3 className="aldine-bold" style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Indigenous Territories & Expeditions</h3>
        
        {/* Legend */}
        <div className="aldine-text" style={{ fontSize: '12px', marginBottom: '15px' }}>
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
          <h4 className="aldine-bold" style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Territory Visibility</h4>
          
          <div className="aldine-text" style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.navajo}
                onChange={() => toggleTerritory('navajo')}
                style={{ marginRight: '5px' }}
              />
              <span className="aldine-regular" style={{ color: 'hsla(0, 99%, 61%, 0.83)' }}>Diné (Navajo)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.hopi}
                onChange={() => toggleTerritory('hopi')}
                style={{ marginRight: '5px' }}
              />
              <span className="aldine-regular" style={{ color: 'hsla(294, 66%, 34%, 0.83)' }}>Hopi</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.zuni}
                onChange={() => toggleTerritory('zuni')}
                style={{ marginRight: '5px' }}
              />
              <span className="aldine-regular" style={{ color: 'hsla(249, 70%, 59%, 0.83)' }}>Zuni</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={territoriesVisible.others}
                onChange={() => toggleTerritory('others')}
                style={{ marginRight: '5px' }}
              />
              <span className="aldine-regular" style={{ color: 'hsla(156, 66%, 34%, 0.83)' }}>Other Territories</span>
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
            
            <div style={{ borderTop: '1px solid #ddd', marginTop: '10px', paddingTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={showMapboxMarkers}
                  onChange={() => setShowMapboxMarkers(!showMapboxMarkers)}
                  style={{ marginRight: '5px' }}
                />
                <span className="aldine-regular">Show Mapbox Expedition Markers</span>
              </label>
            </div>
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
      
      {/* Display selected photo info and adjustment controls */}
      {selectedPhoto && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 10, 
          background: 'rgba(255, 255, 255, 0.9)', 
          padding: '10px', 
          borderRadius: '4px',
          maxWidth: '320px',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h3 className="aldine-bold" style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{selectedPhoto.name}</h3>
          <p className="aldine-text" style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            Photographer: {selectedPhoto.photographer}, {selectedPhoto.year}
          </p>
          
          {/* Photo preview */}
          <div style={{ 
            margin: '10px 0', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            overflow: 'hidden',
            maxHeight: '250px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f5f5f5'
          }}>
            <img 
              src={selectedPhoto.image_url.startsWith('http') 
                ? selectedPhoto.image_url
                : getAssetPath(selectedPhoto.image_url.replace(/^\//,''))} 
              alt={selectedPhoto.name}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '250px',
                objectFit: 'contain'
              }}
            />
          </div>
          
          <p className="aldine-text" style={{ margin: '5px 0', fontSize: '12px' }}>
            {selectedPhoto.description}
          </p>
          
          {/* Camera position info */}
          <div className="aldine-text" style={{ fontSize: '11px', color: '#666', margin: '5px 0' }}>
            <div>Location: {selectedPhoto.coordinates.latitude.toFixed(4)}, {selectedPhoto.coordinates.longitude.toFixed(4)}</div>
            <div>Elevation: {selectedPhoto.elevation_feet}ft ({selectedPhoto.elevation_meters}m)</div>
            <div>Camera Zoom: {selectedPhoto.camera.zoom}</div>
          </div>
          
          {/* Photo adjustment controls */}
          <div style={{ marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
            <h4 className="aldine-bold" style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Adjust Photo Position:</h4>
            
            <div className="aldine-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
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
            
            <div className="aldine-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
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
            
            <div className="aldine-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
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
            
            <div className="aldine-text" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
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
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setOffsetX(0);
                  setOffsetY(0);
                  setRotation(0);
                  setScale(1.0);
                }}
                style={{
                  padding: '5px 10px',
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Reset Adjustments
              </button>
              
              <button
                onClick={() => {
                  setTerritoriesVisible({
                    navajo: true,
                    hopi: true,
                    zuni: true,
                    others: false
                  });
                }}
                style={{
                  padding: '5px 10px',
                  background: '#f8c96d',
                  border: '1px solid #dda33a',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Show Territories
              </button>
              
              <button
                onClick={() => setSelectedPhotoId(null)}
                style={{
                  padding: '5px 10px',
                  background: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Close
              </button>
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
        showMapboxMarkers={showMapboxMarkers}
      />
    </div>
  );
}