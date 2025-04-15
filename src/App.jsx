import { useState, useCallback, useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import MapboxStyleLoader from './components/DeckGL/MapboxStyleLoader';
import createPhotoMarkersLayer from './components/Layers/PhotoMarkersLayer';
import { createPhotoOverlayLayerSync } from './components/Layers/PhotoOverlayLayer';
import { getPhotoById, getAllPhotos } from './data/historicalPhotoData';
import { useViewState } from './hooks/deck/useViewState';

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
  
  // Handler for when a photo marker is clicked
  const handlePhotoSelect = useCallback((id) => {
    try {
      const photo = getPhotoById(id);
      if (photo) {
        console.log("Selected photo:", photo.name);
        console.log("Camera data:", photo.camera);
        setSelectedPhotoId(id);
        
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
          const photoOverlay = createPhotoOverlayLayerSync(
            photoData, 
            0.8  // 80% opacity for better visibility
          );
          
          console.log("Created photo overlay for:", photoData.name);
          
          if (photoOverlay) {
            layerList.push(photoOverlay);
          }
        } catch (err) {
          console.error("Error creating photo overlay:", err);
        }
      }
    }
    
    return layerList;
  }, [selectedPhotoId, handlePhotoSelect]);
  
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
          boxShadow: '0 0 10px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: '0 0 5px 0' }}>{selectedPhoto.name}</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
            Photographer: {selectedPhoto.photographer}, {selectedPhoto.year}
          </p>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>
            {selectedPhoto.description}
          </p>
          <button
            onClick={() => setSelectedPhotoId(null)}
            style={{
              padding: '5px 10px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
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