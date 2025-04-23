import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GeoJsonLayer, LineLayer } from '@deck.gl/layers';
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
  const [showMapboxMarkers, setShowMapboxMarkers] = useState(false); // Always start with Mapbox markers hidden
  const [showInfoPanel, setShowInfoPanel] = useState(true); // Control visibility of info panel
  const [infoPanelOpacity, setInfoPanelOpacity] = useState(1); // Control the opacity for fade effect
  const [showLabels, setShowLabels] = useState(false); // Control visibility of photo labels (hidden by default)
  const [labelColumns, setLabelColumns] = useState(2); // Number of columns for label display (default: 2 columns)
  const [groupLabelsByPhotographer, setGroupLabelsByPhotographer] = useState(true); // Group labels by photographer (enabled by default)
  const [showLabelConnectors, setShowLabelConnectors] = useState(false); // Show connector lines from labels to markers (disabled by default)
  
  // Photo adjustment controls
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);
  
  // Photo labels data for external HTML rendering
  const [labelData, setLabelData] = useState([]);
  
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
  
  // Update global deckInstance for access in other components
  useEffect(() => {
    if (deckRef.current) {
      window.deckInstance = deckRef.current;
    }
  }, []);
  
  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Track previous zoom level to detect changes
  const prevZoomRef = useRef(effectiveViewState.zoom);
  
  // Effect to monitor distance from marker for panel visibility
  useEffect(() => {
    if (selectedPhotoId) {
      const photo = getPhotoById(selectedPhotoId);
      if (photo && photo.coordinates) {
        // Get current view center
        const centerLat = effectiveViewState.latitude;
        const centerLon = effectiveViewState.longitude;
        
        // Calculate distance to marker in km
        const distance = calculateDistance(
          centerLat, 
          centerLon, 
          photo.coordinates.latitude, 
          photo.coordinates.longitude
        );
        
        // Show panel if close to marker (100km) and zoomed in
        const shouldShowPanel = distance < 100 && effectiveViewState.zoom >= 7.5;
        
        if (shouldShowPanel && !showInfoPanel) {
          setShowInfoPanel(true);
          setInfoPanelOpacity(1);
        } else if (!shouldShowPanel && showInfoPanel) {
          setInfoPanelOpacity(0);
          setTimeout(() => setShowInfoPanel(false), 300);
        }
      }
    }
    
    // Handle zoom threshold crossing for general info panel
    const zoomCrossedThreshold = 
      (prevZoomRef.current < 7.5 && effectiveViewState.zoom >= 7.5) || 
      (prevZoomRef.current >= 7.5 && effectiveViewState.zoom < 7.5);
      
    if (zoomCrossedThreshold) {
      if (effectiveViewState.zoom >= 7.5) {
        // Hide general info when zooming in past threshold
        setInfoPanelOpacity(0);
        setTimeout(() => setShowInfoPanel(false), 300);
      } else if (!selectedPhotoId) {
        // Show general info when zooming out past threshold
        setShowInfoPanel(true);
        setTimeout(() => setInfoPanelOpacity(1), 100);
      }
    }
    
    // Update previous zoom level
    prevZoomRef.current = effectiveViewState.zoom;
  }, [effectiveViewState.latitude, effectiveViewState.longitude, effectiveViewState.zoom, selectedPhotoId]);
  
  // Note: We've removed the debug tracking of viewState changes to avoid potential issues
  
  // Set up gesture handlers for navigation, including the "go home" feature
  const { gestureBindings, goToHomeView } = useGestureHandlers(
    setViewState, 
    setSelectedPhotoId,
    setShowInfoPanel,
    setInfoPanelOpacity
  );
  
  // We've removed the manual keyboard controls since we re-enabled the DeckGL controller
  
  // Reference to the main container for gesture binding
  const containerRef = useRef(null);
  
  // Reference to the DeckGL component
  const deckRef = useRef(null);
  
  // Handler for when a photo marker is clicked
  const handlePhotoSelect = useCallback((id) => {
    try {
      // Step 1: Get photo data
      const photo = getPhotoById(id);
      
      if (!photo) {
        console.error('❌ No photo data found for id:', id);
        return;
      }
      
      // Set up timing constants
      const transitionDuration = 3000;
      const fadeInDuration = 500;
      
      // Start showing the panel slightly before the transition completes
      // This ensures the fade-in finishes right when the transition does
      setTimeout(() => {
        // Step 2: Update UI state slightly before transition completes
        setSelectedPhotoId(id);
        
        // Reset adjustments
        setOffsetX(0);
        setOffsetY(0);
        setRotation(0);
        setScale(1.0);
      }, transitionDuration - fadeInDuration); // Start fade-in early so they finish together
      
      // Hide territories
      setTerritoriesVisible({
        navajo: false,
        hopi: false,
        zuni: false,
        others: false
      });
      
      // Only hide the info panel when zoomed out below 7.5
      if (effectiveViewState.zoom < 7.5) {
        // Start the fade-out effect for the info panel
        setInfoPanelOpacity(0);
        
        // After fade completes, then hide the panel
        setTimeout(() => {
          setShowInfoPanel(false);
        }, 300); // 300ms fade-out transition
      }
      
      // Step 3: Extract camera viewpoint
      const viewpoint = photo.camera?.viewpoint;
      
      if (!viewpoint) {
        console.error('❌ Missing viewpoint data for photo:', id);
        return;
      }
      
      // Step 4: Prepare view state
      // Ensure pitch is within valid range (0-85)
      let pitch = photo.camera.pitch || 60;
      if (pitch < 0) pitch = 0;
      if (pitch > 85) pitch = 85;
      
      // Step 5: Visual feedback - flash background
      document.body.style.backgroundColor = 'rgba(0,255,0,0.1)';
      setTimeout(() => document.body.style.backgroundColor = '', 100);
      
      // Create enhanced viewstate with better transitions
      const newViewState = {
        longitude: viewpoint.longitude,
        latitude: viewpoint.latitude,
        zoom: photo.camera.zoom || 15,
        pitch: pitch,
        bearing: photo.camera.bearing || 0,
        transitionDuration: transitionDuration,
        transitionInterpolator: new FlyToInterpolator({
          speed: 1.2,
          curve: 1.5,
          screenSpeed: 15,
          maxDuration: transitionDuration
        }),
        transitionEasing: t => {
          return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
      };
      
      // Step 6: Apply the new view state
      setViewState(newViewState);
      
    } catch (err) {
      console.error('❌ Error selecting photo:', err);
      setError(`Failed to select photo: ${err.message}`);
    }
  }, []);

  // Callback handler for label data from PhotoMarkersLayer
  const handleLabelDataUpdate = useCallback((data) => {
    setLabelData(data);
  }, []);
  
  // Split label data into multiple columns for display
  const getColumnizedLabelData = useCallback(() => {
    if (!labelData || labelData.length === 0) return [];
    
    // First, organize data based on grouping preference
    let organizedData = [...labelData];
    
    if (groupLabelsByPhotographer) {
      // Sort by photographer first, then by latitude
      organizedData.sort((a, b) => {
        // First by photographer
        if (a.photographer !== b.photographer) {
          return a.photographer.localeCompare(b.photographer);
        }
        // Then by latitude (north to south)
        return b.markerPosition[1] - a.markerPosition[1];
      });
    }
    
    // Create a multidimensional array with the number of columns
    const result = [];
    const itemsPerColumn = Math.ceil(organizedData.length / labelColumns);
    
    // For grouped display, we want to keep photographers together in columns if possible
    if (groupLabelsByPhotographer) {
      // Create column data with photographer headers
      let currentColumn = [];
      let currentPhotographer = null;
      let columnIndex = 0;
      
      organizedData.forEach((item, index) => {
        // Add a new column when we've reached the items per column limit
        // But try to keep items with the same photographer in the same column if possible
        if (currentColumn.length >= itemsPerColumn && 
            (item.photographer !== currentPhotographer || 
             index === organizedData.length - 1 || 
             organizedData[index + 1]?.photographer !== item.photographer)) {
          
          result.push(currentColumn);
          currentColumn = [];
          columnIndex++;
          
          // Stop adding columns if we've reached the maximum
          if (columnIndex >= labelColumns) {
            columnIndex = labelColumns - 1;
          }
        }
        
        // Track the current photographer for grouping
        currentPhotographer = item.photographer;
        
        // Add the item to the current column
        currentColumn.push({
          ...item,
          isPhotographerHeader: currentColumn.length === 0 || 
                               (currentColumn.length > 0 && 
                                currentColumn[currentColumn.length - 1].photographer !== item.photographer)
        });
      });
      
      // Add the last column if it has items
      if (currentColumn.length > 0) {
        result.push(currentColumn);
      }
      
      // If we ended up with fewer columns than requested, redistribute
      while (result.length < labelColumns && result.some(col => col.length > itemsPerColumn)) {
        // Find the longest column
        const longestIndex = result.findIndex(col => 
          col.length === Math.max(...result.map(c => c.length))
        );
        
        if (longestIndex === -1 || result[longestIndex].length <= itemsPerColumn) {
          break;
        }
        
        // Create a new column with items from the end of the longest one
        const newColumn = result[longestIndex].splice(
          Math.ceil(result[longestIndex].length / 2)
        );
        
        if (newColumn.length > 0) {
          // Make the first item a photographer header if needed
          if (newColumn[0]) {
            newColumn[0] = {
              ...newColumn[0],
              isPhotographerHeader: true
            };
          }
          
          result.push(newColumn);
        }
      }
    } else {
      // Simple distribution without grouping
      for (let i = 0; i < labelColumns; i++) {
        const columnData = organizedData.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn);
        result.push(columnData);
      }
    }
    
    return result;
  }, [labelData, labelColumns, groupLabelsByPhotographer]);

  // Connector lines feature (disabled)
  // This function has been preserved for future development
  const createConnectorLayer = (labelData) => {
    // Return null to disable connector lines
    return null;
  };
  
  // Create the photo markers layer and photo overlay if a photo is selected
  const layers = useMemo(() => {
    // Get the base markers layer
    const markersLayer = createPhotoMarkersLayer({
      onPhotoSelect: handlePhotoSelect,
      selectedPhotoId: selectedPhotoId,
      onLabelDataUpdate: handleLabelDataUpdate,
      showLabelConnectors: showLabelConnectors,
      showLabels: showLabels,
      zoomLevel: effectiveViewState.zoom
    });
    
    // Initialize our layer list with the markers layer
    const layerList = [markersLayer];
    
    // Connector lines feature disabled
    // Note: We attempted to implement connector lines, but are currently bypassing this feature
    
    // Photo overlay temporarily disabled
    // if (selectedPhotoId) {
    //   // Code for photo overlay disabled
    // }
    
    return layerList;
  }, [selectedPhotoId, handlePhotoSelect, offsetX, offsetY, rotation, scale, handleLabelDataUpdate, showLabelConnectors, labelData, labelColumns]);
  
  // Render selected photo info if a photo is selected
  const selectedPhoto = selectedPhotoId ? getPhotoById(selectedPhotoId) : null;
  
  // State for visual rotation indicator
  const [rotationIndicator, setRotationIndicator] = useState({
    visible: false,
    x: 0,
    y: 0
  });
  
  // No longer need state for marker/label positions - handled by DeckGL
  
  // Add JavaScript to handle marker rotation effects
  useEffect(() => {
    // Function to handle photo selection
    const handlePhotoMarkerClick = (e) => {
      // Try to find deck.gl canvas and get click position
      const canvas = document.querySelector('.deck-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        
        // Show rotation indicator at click position
        setRotationIndicator({
          visible: true,
          x,
          y
        });
        
        // Hide after animation
        setTimeout(() => {
          setRotationIndicator({
            visible: false,
            x,
            y
          });
        }, 800);
      }
    };
    
    // Add event listener
    document.addEventListener('click', handlePhotoMarkerClick);
    
    return () => {
      document.removeEventListener('click', handlePhotoMarkerClick);
    };
  }, []);
  
  // We no longer need these effects - connector lines are handled by DeckGL directly

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative',
        touchAction: 'none' 
      }}
      {...gestureBindings()}
    >
      {/* Add CSS for marker rotation animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin360 {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.5); }
          to { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .rotation-indicator {
          position: absolute;
          width: 50px;
          height: 50px;
          border: 3px solid white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          transform-origin: center;
          animation: spin360 0.8s ease-out, fadeOut 0.8s ease-out;
        }
      `}} />
      
      {/* Rotation indicator element */}
      {rotationIndicator.visible && (
        <div 
          className="rotation-indicator"
          style={{
            left: `${rotationIndicator.x - 25}px`,
            top: `${rotationIndicator.y - 25}px`
          }}
        />
      )}
      
      {/* Connector lines now handled by DeckGL layers */}
      {/* HTML container for photo labels */}
      {showLabels && (
        <>
          {/* Side panel labels (shown when zoomed out) */}
          {effectiveViewState.zoom < 7.5 && (
            <div 
              className="photo-labels-container"
              style={{
                position: 'absolute',
                top: '15vh', // Start below the title
                right: 0,
                bottom: '15vh', // Give space at bottom
                width: labelColumns === 1 ? '300px' : labelColumns === 2 ? '460px' : '600px', // Width based on columns
                paddingRight: '5px',
                zIndex: 10,
                pointerEvents: 'none',
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'row', // Changed to row to support columns
                justifyContent: 'flex-start',
                background: 'transparent',
                border: 'none',
                maxHeight: '70vh', // Limit height to avoid overlapping with other UI
                padding: '0',
                margin: '0'
              }}
            >
              {getColumnizedLabelData().map((columnData, columnIndex) => (
                <div 
                  key={`column-${columnIndex}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: labelColumns === 1 ? '100%' : labelColumns === 2 ? '50%' : '33.33%',
                    paddingRight: columnIndex < labelColumns - 1 ? '5px' : '0'
                  }}
                >
                  {columnData.map((label, index) => (
                    <React.Fragment key={label.id}>
                      {/* Photographer header when grouping is enabled */}
                      {groupLabelsByPhotographer && label.isPhotographerHeader && (
                        <div 
                          className="photographer-header"
                          style={{
                            margin: '5px 0 2px 0',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
                            color: label.photographer === 'Jackson' ? 'rgb(255, 155, 132)' : 'rgb(132, 190, 255)',
                            padding: '2px 5px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            width: '100%',
                            textAlign: 'left',
                            pointerEvents: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderLeft: label.photographer === 'Jackson' ? 
                              '3px solid rgb(255, 87, 51)' : 
                              '3px solid rgb(75, 144, 226)',
                            textShadow: '0px 0px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          {label.photographer}
                        </div>
                      )}
                      
                      {/* Photo label */}
                      <div 
                        className="photo-label"
                        data-photographer={label.photographer} // Store photographer data for styling
                        style={{
                          margin: '0',
                          backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
                          color: 'white',
                          borderRadius: '0', // No radius
                          padding: '0', // No padding
                          fontSize: '12px', // Keep smaller font
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          width: '100%',
                          transition: 'all 0.2s ease-out',
                          opacity: selectedPhotoId === label.id ? 1 : 0.8,
                          transform: 'scale(1)', // No scaling
                          boxShadow: 'none', // No shadow
                          textAlign: 'left',
                          height: '24px', // Height for the container
                          display: 'flex', // Flexbox
                          alignItems: 'center', // Vertical centering
                          justifyContent: 'flex-start', // Align to left
                          paddingLeft: groupLabelsByPhotographer ? '10px' : '5px', // More indent when grouped
                          borderLeft: selectedPhotoId === label.id ? 
                            (label.photographer === 'Jackson' ? '3px solid rgb(255, 87, 51)' : '3px solid rgb(75, 144, 226)') : 
                            '3px solid transparent', // Keep same space but make invisible
                          textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 1px #000' // Stronger text shadow for white text
                        }}
                        onClick={() => handlePhotoSelect(label.id)}
                      >
                        {label.label}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          )}
          
          {/* Marker labels are now handled directly by DeckGL TextLayer:
              - When zoom level is between 7.5 and 12, labels shown with larger offset
              - When zoom level is >= 12, labels shown right next to markers
          */}
        </>
      )}
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
      
      {/* Title - only visible when zoomed out */}
      {effectiveViewState.zoom < 7.5 && (
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
      )}
      
      {showInfoPanel && effectiveViewState.zoom < 7.5 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '5vw', 
          left: '5vw', 
          zIndex: 10, 
          background: 'white', 
          padding: '10px', 
          borderRadius: '4px', 
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          opacity: infoPanelOpacity,
          transition: 'opacity 300ms ease-in-out',
          pointerEvents: infoPanelOpacity === 0 ? 'none' : 'auto'
        }}>
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
                <h4 className="aldine-bold" style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Display Options</h4>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}>
                  <input 
                    type="checkbox"
                    checked={showLabels}
                    onChange={() => setShowLabels(!showLabels)}
                    style={{ marginRight: '5px' }}
                  />
                  <span className="aldine-regular">Show Photo Labels</span>
                </label>
                
                {/* Label column controls - only show when labels are visible */}
                {showLabels && (
                  <div style={{ marginLeft: '15px', marginTop: '5px' }}>
                    <div className="aldine-regular" style={{ fontSize: '11px', marginBottom: '5px' }}>Label Display:</div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px', marginBottom: '5px' }}>
                      <input 
                        type="checkbox"
                        checked={groupLabelsByPhotographer}
                        onChange={() => setGroupLabelsByPhotographer(!groupLabelsByPhotographer)}
                        style={{ marginRight: '2px' }}
                      />
                      <span>Group by Photographer</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px', marginBottom: '5px' }}>
                      <input 
                        type="checkbox"
                        checked={showLabelConnectors}
                        onChange={() => setShowLabelConnectors(!showLabelConnectors)}
                        style={{ marginRight: '2px' }}
                      />
                      <span>Show Connector Lines</span>
                    </label>
                    
                    <div className="aldine-regular" style={{ fontSize: '11px', marginBottom: '5px' }}>Columns:</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px' }}>
                        <input 
                          type="radio"
                          name="labelColumns"
                          checked={labelColumns === 1}
                          onChange={() => setLabelColumns(1)}
                          style={{ marginRight: '2px' }}
                        />
                        <span>1</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px' }}>
                        <input 
                          type="radio"
                          name="labelColumns"
                          checked={labelColumns === 2}
                          onChange={() => setLabelColumns(2)}
                          style={{ marginRight: '2px' }}
                        />
                        <span>2</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '11px' }}>
                        <input 
                          type="radio"
                          name="labelColumns"
                          checked={labelColumns === 3}
                          onChange={() => setLabelColumns(3)}
                          style={{ marginRight: '2px' }}
                        />
                        <span>3</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Display selected photo info - visible based on proximity and zoom level */}
      {selectedPhoto && showInfoPanel && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 10, 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '12px', 
          borderRadius: '6px',
          width: '450px', // Increased fixed width
          boxShadow: '0 2px 15px rgba(0,0,0,0.4)',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeIn 500ms ease-in-out forwards'
        }}>
          {/* Close button */}
          <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
            <button
              onClick={() => setSelectedPhotoId(null)}
              style={{
                padding: '3px 6px',
                background: 'rgba(0,0,0,0.15)',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
          
          {/* Photo preview - much larger now */}
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            overflow: 'hidden',
            maxHeight: '500px', // Doubled height
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#f5f5f5',
            margin: '0 0 10px 0'
          }}>
            <img 
              src={selectedPhoto.image_url.startsWith('http') 
                ? selectedPhoto.image_url
                : getAssetPath(selectedPhoto.image_url.replace(/^\//,''))} 
              alt={selectedPhoto.name}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '500px', // Doubled height
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* More efficient text layout - title and info side by side */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ flex: '1' }}>
              <h3 className="aldine-bold" style={{ margin: '0 0 2px 0', fontSize: '18px' }}>{selectedPhoto.name}</h3>
              <p className="aldine-text" style={{ margin: '0', fontSize: '14px', color: selectedPhoto.photographer === 'Jackson' ? '#c43e1c' : '#2761ac' }}>
                {selectedPhoto.photographer}, {selectedPhoto.year}
              </p>
            </div>
            <div style={{ flex: '1', textAlign: 'right', fontSize: '12px', color: '#555' }}>
              <p style={{ margin: '0' }}>
                {selectedPhoto.photographer === 'Jackson' ? 'Western US Geological Survey' : 'Bureau of American Ethnology'}
              </p>
              <p style={{ margin: '0', fontStyle: 'italic' }}>
                {selectedPhoto.photographer === 'Jackson' ? '1875-1876' : '1879'}
              </p>
            </div>
          </div>
          
          {/* Description */}
          <p className="aldine-text" style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.4' }}>
            {selectedPhoto.description}
          </p>
          
          {/* Location context in smaller text */}
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '8px', 
            padding: '6px', 
            background: 'rgba(0,0,0,0.03)', 
            borderRadius: '4px' 
          }}>
            <p style={{ margin: '0', fontStyle: 'italic' }}>
              Indigenous territories documentary photography - 
              {selectedPhoto.photographer === 'Jackson' 
                ? ' Part of early extensive photographic expeditions documenting the Southwest.' 
                : ' Some of the earliest photographic record of traditional Pueblo life.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Use the custom style */}
      <MapboxStyleLoader 
        styleUrl={CUSTOM_STYLE_URL}
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }) => {
          // Simple handler now that MapboxStyleLoader blocks updates during transitions
          setViewState(newViewState);
        }}
        territoriesVisible={territoriesVisible}
        showMapboxMarkers={showMapboxMarkers}
        deckRef={deckRef}
      />
    </div>
  );
}