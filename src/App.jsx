import React, { useState, useCallback, useMemo, useRef, useEffect, createContext } from 'react';
import { GeoJsonLayer, LineLayer } from '@deck.gl/layers';
import { FlyToInterpolator } from '@deck.gl/core';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import MapboxStyleLoader from './components/DeckGL/MapboxStyleLoader';
import createPhotoMarkersLayer from './components/Layers/PhotoMarkersLayer';
import { createPhotoOverlayLayerSync } from './components/Layers/PhotoOverlayLayer';
import { getPhotoById, getAllPhotos } from './data/historicalPhotoData';
import { useViewState, HOME_VIEW_STATE } from './hooks/deck/useViewState';
import { useGestureHandlers } from './hooks/useGestureHandlers';
import { MAPBOX_TOKEN } from './config/mapbox';
import TribalInfoPanel from './components/UI/TribalInfoPanel';

import { getAssetPath } from './utils/assetUtils';

// Path to the custom Mapbox style
const CUSTOM_STYLE_URL = getAssetPath('assets/geojson/mapBoxStyle.json');

// Define app mode constants
const APP_MODES = {
  HOME: 'home',
  EXPLORE: 'explore',
  STORY: 'story'
};

// Define story types for different content categories
const STORY_TYPES = {
  // Indigenous peoples
  DINE: 'dine',
  HOPI: 'hopi',
  ZUNI: 'zuni',
  
  // Photographers
  HILLERS: 'hillers',
  JACKSON: 'jackson',
  
  // National Parks
  YELLOWSTONE: 'yellowstone',
  GRAND_CANYON: 'grand_canyon',
  CHACO_CULTURE: 'chaco_culture',
  
  // Bureau
  ETHNOGRAPHY: 'ethnography'
};

// Create a context to share app functions with other components
export const AppContext = createContext({
  handlePhotoSelect: () => {},
  returnToHomeView: () => {},
  enterExploreMode: () => {},
  enterStoryMode: () => {},
  exitStoryMode: () => {},
  appMode: APP_MODES.HOME,
  storyType: null,
  STORY_TYPES: {},
  APP_MODES: {}
});

export default function App() {
  const [error, setError] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [viewState, setViewState] = useState(null);
  const initialViewState = useViewState();
  const [appMode, setAppMode] = useState(APP_MODES.HOME); // Current application mode
  const [storyType, setStoryType] = useState(null); // Current story type (if in story mode)
  const [activeElement, setActiveElement] = useState(null); // Currently active UI element (for animations)
  const [territoriesVisible, setTerritoriesVisible] = useState({
    navajo: true,   // Navajo (Diné) Nation
    hopi: true,     // Hopi Nation
    zuni: true,     // Zuni Nation
    others: false   // All other territories
  });
  const [showMapboxMarkers, setShowMapboxMarkers] = useState(false); // Always start with Mapbox markers hidden
  const [showInfoPanel, setShowInfoPanel] = useState(true); // Control visibility of info panel
  const [infoPanelOpacity, setInfoPanelOpacity] = useState(1); // Control the opacity for fade effect
  const [showLabels, setShowLabels] = useState(false); // Hide labels by default (only show in specific views)
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
  
  // Effect to monitor distance from marker for panel visibility and handle app mode changes
  useEffect(() => {
    // Handle app mode changes based on view state
    const isAtHomeView = (
      Math.abs(effectiveViewState.longitude - HOME_VIEW_STATE.longitude) < 0.01 &&
      Math.abs(effectiveViewState.latitude - HOME_VIEW_STATE.latitude) < 0.01 &&
      Math.abs(effectiveViewState.zoom - HOME_VIEW_STATE.zoom) < 0.1
    );
    
    // Update app mode based on zoom and position
    if (isAtHomeView) {
      setAppMode(APP_MODES.HOME);
    } else if (effectiveViewState.zoom >= 7.5) {
      setAppMode(APP_MODES.EXPLORE);
    } else {
      // Between home and explore, but zoomed out
      if (appMode === APP_MODES.STORY) {
        // Keep story mode if we're in it
      } else {
        setAppMode(APP_MODES.HOME);
      }
    }
    
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
  }, [effectiveViewState.latitude, effectiveViewState.longitude, effectiveViewState.zoom, selectedPhotoId, appMode]);
  
  // Note: We've removed the debug tracking of viewState changes to avoid potential issues
  
  // Set up gesture handlers for navigation, including the "go home" feature
  const { gestureBindings, goToHomeView } = useGestureHandlers(
    setViewState, 
    setSelectedPhotoId,
    setShowInfoPanel,
    setInfoPanelOpacity
  );
  
  // Function to explicitly return to home view - can be called from anywhere
  const returnToHomeView = useCallback(() => {
    // Reset selected photo if any
    setSelectedPhotoId(null);
    
    // Clear any active story
    setStoryType(null);
    
    // Clear any active element
    setActiveElement(null);
    
    // Hide labels in home view
    setShowLabels(false);
    
    // Show territories
    setTerritoriesVisible({
      navajo: true,
      hopi: true,
      zuni: true,
      others: false
    });
    
    // Set app mode to HOME
    setAppMode(APP_MODES.HOME);
    
    // Use the goToHomeView function from gesture handlers
    goToHomeView();
  }, [goToHomeView]);
  
  // Function to enter Explore mode - free camera movement
  const enterExploreMode = useCallback((location = {}) => {
    // Set app mode to EXPLORE
    setAppMode(APP_MODES.EXPLORE);
    setStoryType(null); // Clear any active story
    
    // Default explore location (a bit zoomed in from home)
    const defaultExploreView = {
      ...HOME_VIEW_STATE,
      zoom: 8.5,
      pitch: 50,
      bearing: -15,
    };
    
    // Set view state with smooth transition
    setViewState({
      ...defaultExploreView,
      ...location, // Override with any provided location params
      transitionDuration: 2500,
      transitionInterpolator: new FlyToInterpolator({
        speed: 1.2,
        curve: 1.5,
        screenSpeed: 15
      })
    });
  }, []);
  
  // Function to enter Story mode - guided experience for a specific topic
  const enterStoryMode = useCallback((type, startingLocation = {}) => {
    if (!STORY_TYPES[type]) {
      console.error(`Invalid story type: ${type}`);
      return;
    }
    
    // CRITICAL: Immediately hide ALL UI elements EXCEPT the clicked one
    // Using direct style manipulation for instant effect before any React state changes
    
    // Force-hide main title immediately
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle) {
      mainTitle.style.opacity = '0';
      mainTitle.style.transition = 'none';
    }
    
    // Also hide the subtitle
    const subtitle = document.querySelector('.main-title + h2');
    if (subtitle) {
      subtitle.style.opacity = '0';
      subtitle.style.transition = 'none';
    }
    
    // Force-hide all category titles
    document.querySelectorAll('.category-title').forEach(el => {
      el.style.opacity = '0';
      el.style.transition = 'none';
    });
    
    // Force-hide all category items except the active one
    document.querySelectorAll('.category-item').forEach(el => {
      if (!el.classList.contains(`${type}-category`)) {
        el.style.opacity = '0';
        el.style.transition = 'none';
        el.style.pointerEvents = 'none';
      } else {
        // Prepare active element for animation
        el.style.transition = 'all 0.6s ease-out';
        
        // Determine direction based on element position
        const isRightSide = el.closest('div').style.right !== '';
        if (isRightSide) {
          el.style.transform = 'translateX(-2vw)'; 
        } else {
          el.style.transform = 'translateX(2vw)';
        }
        
        // Set appropriate size based on type
        if (type === 'ETHNOGRAPHY') {
          el.style.fontSize = '5rem';
        } else if (type === 'DINE' || type === 'HOPI' || type === 'ZUNI') {
          el.style.fontSize = '5rem';
        } else {
          el.style.fontSize = '3rem';
        }
      }
    });
    
    // Hide any extra elements (like the explore button)
    const exploreButton = document.querySelector('.explore-button');
    if (exploreButton) {
      exploreButton.style.opacity = '0';
      exploreButton.style.transition = 'none';
    }
    
    // Now set state (this happens after the above DOM manipulations)
    setAppMode(APP_MODES.STORY);
    setStoryType(STORY_TYPES[type]);
    setActiveElement(type);
    
    // Clear any selected photo
    setSelectedPhotoId(null);
    
    // For territory stories, show only relevant territory
    if (type === 'DINE') {
      setTerritoriesVisible({
        navajo: true,
        hopi: false,
        zuni: false,
        others: false
      });
    } else if (type === 'HOPI') {
      setTerritoriesVisible({
        navajo: false,
        hopi: true,
        zuni: false,
        others: false
      });
    } else if (type === 'ZUNI') {
      setTerritoriesVisible({
        navajo: false,
        hopi: false,
        zuni: true,
        others: false
      });
    }
    
    // Get default location for each story type (these could be customized per story)
    let storyLocation = {
      // Default for story mode is a slightly elevated view
      zoom: 7.5,
      pitch: 40,
      bearing: 0
    };
    
    // Custom locations for specific story types
    if (type === 'HILLERS') {
      storyLocation = {
        longitude: -109.948693,
        latitude: 35.332032,
        zoom: 8.74,
        pitch: 51.55,
        bearing: -19.10,
        fov: 60
      };
    }
    
    // Override with any provided location params
    storyLocation = {
      ...storyLocation,
      ...startingLocation
    };
    
    // Set view state with smooth transition
    setViewState({
      ...HOME_VIEW_STATE, // Start from home state
      ...storyLocation,   // Apply story-specific modifications
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator({
        speed: 1.0,
        curve: 1.5,
        screenSpeed: 10
      })
    });
  }, []);
  
  // Function to exit Story mode and return to home view
  const exitStoryMode = useCallback(() => {
    // Clear the active element
    setActiveElement(null);
    
    // Simply use the existing returnToHomeView function
    returnToHomeView();
  }, [returnToHomeView]);
  
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
      
      // Update app mode to EXPLORE when clicking a photo marker
      setAppMode(APP_MODES.EXPLORE);
      
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
  
  // Prepare label data for display
  const getColumnizedLabelData = useCallback(() => {
    if (!labelData || labelData.length === 0) return [];
    
    // First, organize data based on grouping preference
    let organizedData = [...labelData];
    
    // Filter by photographer if in photographer story mode
    if (activeElement === 'HILLERS') {
      organizedData = organizedData.filter(item => item.photographer === "Hillers");
    } else if (activeElement === 'JACKSON') {
      organizedData = organizedData.filter(item => item.photographer === "Jackson");
    }
    
    // Sort by latitude (north to south)
    organizedData.sort((a, b) => b.markerPosition[1] - a.markerPosition[1]);
    
    // For single column display, just return one column with all items
    // This is simplified for the minimal version
    return [organizedData.map(item => ({
      ...item,
      isPhotographerHeader: false // No headers in minimal version
    }))];
  }, [labelData, activeElement]);

  // Connector lines feature (disabled)
  // This function has been preserved for future development
  const createConnectorLayer = (labelData) => {
    // Return null to disable connector lines
    return null;
  };
  
  // Photo marker label positions are defined directly in the PhotoMarkersLayer component

  // Create the photo markers layer and photo overlay if a photo is selected
  const layers = useMemo(() => {
    // Get the base markers layer with photographer filtering
    const markersLayer = createPhotoMarkersLayer({
      onPhotoSelect: handlePhotoSelect,
      selectedPhotoId: selectedPhotoId,
      onLabelDataUpdate: handleLabelDataUpdate,
      showLabelConnectors: showLabelConnectors,
      showLabels: showLabels,
      zoomLevel: effectiveViewState.zoom,
      // Add photographer filtering
      // This controls which photographer's photos are shown in the story views
      filterPhotographer: activeElement === 'HILLERS' ? "Hillers" : 
                          activeElement === 'JACKSON' ? "Jackson" : null
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
  }, [selectedPhotoId, handlePhotoSelect, offsetX, offsetY, rotation, scale, handleLabelDataUpdate, showLabelConnectors, labelData, labelColumns, activeElement]);
  
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

  // Create a context value containing the app functions
  const appContextValue = useMemo(() => ({
    // Navigation functions
    handlePhotoSelect,
    returnToHomeView,
    enterExploreMode,
    enterStoryMode,
    exitStoryMode,
    
    // App state
    appMode,
    storyType,
    
    // Constants
    APP_MODES,
    STORY_TYPES
  }), [
    handlePhotoSelect, 
    returnToHomeView, 
    enterExploreMode, 
    enterStoryMode,
    exitStoryMode,
    appMode, 
    storyType
  ]);

  return (
    <AppContext.Provider value={appContextValue}>
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
      {/* HTML container for photo labels - now always shown */}
      {/* Side panel labels (shown only when in photographer story mode) */}
      {(activeElement === 'HILLERS' || activeElement === 'JACKSON') && (
          <div 
            className="photo-labels-container"
            style={{
                position: 'absolute',
                top: activeElement === 'HILLERS' ? 'calc(5vw + 4rem)' : activeElement === 'JACKSON' ? 'calc(6vw + 7rem)' : '15vh', // Position lower beneath the specific photographer name
                right: '20px',
                bottom: '15vh', // Give space at bottom
                width: '350px', // Fixed width for single column
                paddingRight: '10px',
                zIndex: 10,
                pointerEvents: 'none',
                overflowY: 'auto',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
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
                    width: '100%',
                    paddingTop: '15px' // Add some top padding to the list
                  }}
                >
                  {columnData.map((label, index) => (
                    <div 
                      key={label.id}
                      className="photo-label"
                      data-photographer={label.photographer}
                      style={{
                        margin: '0', // No margin for extremely tight spacing
                        backgroundColor: 'rgba(0, 0, 0, 0)', // Transparent background
                        color: 'white',
                        padding: '0', 
                        fontSize: '1.3rem', // Increased font size to 1.3rem
                        lineHeight: '1.1', // Tighter line height
                        fontWeight: '500',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        width: '100%',
                        transition: 'all 0.2s ease-out',
                        opacity: selectedPhotoId === label.id ? 1 : 0.8,
                        transform: 'scale(1)',
                        boxShadow: 'none',
                        textAlign: 'left',
                        height: '1.5rem', // Fixed smaller height for tighter spacing
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingLeft: '5px',
                        borderLeft: selectedPhotoId === label.id ? 
                          (label.photographer === 'Jackson' ? '3px solid rgb(255, 87, 51)' : '3px solid rgb(75, 144, 226)') : 
                          '3px solid transparent',
                        textShadow: '0px 0px 8px rgba(0,0,0,1), 0px 0px 4px #000, 0px 0px 2px #000' // Even darker drop shadow
                        }}
                        onClick={() => handlePhotoSelect(label.id)}
                      >
                        {label.label}
                      </div>
                      ))}
                    </div>
                    ))}
                  </div>
                  )}
      {(effectiveViewState.longitude !== HOME_VIEW_STATE.longitude || 
        effectiveViewState.latitude !== HOME_VIEW_STATE.latitude || 
        effectiveViewState.zoom !== HOME_VIEW_STATE.zoom) && (
        <div
          onClick={returnToHomeView}
          style={{
            position: 'absolute',
            bottom: '5vw',
            ...(activeElement === 'HILLERS' || activeElement === 'JACKSON' 
              ? {
                  // Center position for Hillers and Jackson story views
                  left: '50%',
                  transform: 'translateX(-50%)'
                } 
              : {
                  // Bottom right for home view
                  right: '5vw'
                }),
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
      )}
      
      {/* Title - only visible when zoomed out and not in story mode */}
      {effectiveViewState.zoom < 7.5 && !activeElement && (
        <div style={{ position: 'absolute', top: '2vw', left: '2vw', zIndex: 10 }}>
          <h1 className="geographica-hand main-title" style={{ 
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
      
      {/* People Section - only visible when zoomed out or when in respective story mode */}
      {(effectiveViewState.zoom < 7.5 || activeElement === 'DINE' || activeElement === 'HOPI' || activeElement === 'ZUNI') && (
        <div style={{
          position: 'absolute', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          left: '8vw', 
          zIndex: 10, 
          maxWidth: '30vw', 
          background: 'transparent', 
          opacity: 1, 
          transition: 'opacity 0.3s', 
          pointerEvents: 'auto'
        }}>
          <h2 className="geographica-hand category-title" style={{ 
            margin: 0, 
            padding: 0, 
            color: 'white', 
            fontSize: '4rem', 
            textShadow: 'rgba(0, 0, 0, 0.8) 3px 3px 8px', 
            lineHeight: 1.1, 
            textAlign: 'left', 
            cursor: 'pointer', 
            transition: appMode === APP_MODES.STORY ? 'none' : 'opacity 0.3s',
            opacity: activeElement && (activeElement === 'DINE' || activeElement === 'HOPI' || activeElement === 'ZUNI') ? 0 : 1, 
            pointerEvents: activeElement ? 'none' : 'auto'
          }}>
            The People
          </h2>
          <div className="aldine-regular" style={{ 
            margin: '0.5rem 0 0', 
            padding: 0, 
            color: 'white', 
            fontSize: '2rem', 
            textShadow: 'rgba(0, 0, 0, 0.6) 2px 2px 4px', 
            lineHeight: 1.4, 
            textAlign: 'left', 
            display: 'flex', 
            flexDirection: 'column'
          }}>
            <div style={{ transition: 'opacity 0.3s' }}>
              <div style={{ 
                marginTop: '0.5rem', 
                opacity: 1, 
                transition: 'opacity 0.3s, transform 0.5s ease-out', 
                pointerEvents: 'auto',
                position: 'relative'
              }}>
                <span className="geographica-hand category-item DINE-category" style={{ 
                  color: 'white', 
                  fontSize: activeElement === 'DINE' ? '5rem' : '3.5rem', 
                  textShadow: 'rgba(0, 0, 0, 0.8) 3px 3px 8px', 
                  lineHeight: 1.1, 
                  cursor: 'pointer', 
                  transition: appMode === APP_MODES.STORY ? 
                    (activeElement === 'DINE' ? 'all 0.6s ease-out' : 'none') : 
                    'all 0.6s ease-out', 
                  WebkitTapHighlightColor: 'transparent', 
                  userSelect: 'none',
                  opacity: activeElement && activeElement !== 'DINE' ? 0 : 1,
                  transform: activeElement === 'DINE' ? 'translateX(2vw)' : 'translateX(0)'
                }}
                onClick={() => enterStoryMode('DINE')}
                >
                  Diné
                </span>
              </div>
              <div style={{ 
                marginTop: '0.5rem', 
                opacity: 1, 
                transition: 'opacity 0.3s, transform 0.5s ease-out', 
                pointerEvents: 'auto',
                position: 'relative'
              }}>
                <span className="geographica-hand category-item HOPI-category" style={{ 
                  color: 'white', 
                  fontSize: activeElement === 'HOPI' ? '5rem' : '3.5rem', 
                  textShadow: 'rgba(0, 0, 0, 0.8) 3px 3px 8px', 
                  lineHeight: 1.1, 
                  cursor: 'pointer', 
                  transition: appMode === APP_MODES.STORY ? 
                    (activeElement === 'HOPI' ? 'all 0.6s ease-out' : 'none') : 
                    'all 0.6s ease-out', 
                  WebkitTapHighlightColor: 'transparent', 
                  userSelect: 'none',
                  opacity: activeElement && activeElement !== 'HOPI' ? 0 : 1,
                  transform: activeElement === 'HOPI' ? 'translateX(2vw)' : 'translateX(0)'
                }}
                onClick={() => enterStoryMode('HOPI')}
                >
                  Hopi
                </span>
              </div>
              <div style={{ 
                marginTop: '0.5rem', 
                opacity: 1, 
                transition: 'opacity 0.3s, transform 0.5s ease-out', 
                pointerEvents: 'auto',
                position: 'relative'
              }}>
                <span className="geographica-hand category-item ZUNI-category" style={{ 
                  color: 'white', 
                  fontSize: activeElement === 'ZUNI' ? '5rem' : '3.5rem', 
                  textShadow: 'rgba(0, 0, 0, 0.8) 3px 3px 8px', 
                  lineHeight: 1.1, 
                  cursor: 'pointer', 
                  transition: appMode === APP_MODES.STORY ? 
                    (activeElement === 'ZUNI' ? 'all 0.6s ease-out' : 'none') : 
                    'all 0.6s ease-out', 
                  WebkitTapHighlightColor: 'transparent', 
                  userSelect: 'none',
                  opacity: activeElement && activeElement !== 'ZUNI' ? 0 : 1,
                  transform: activeElement === 'ZUNI' ? 'translateX(2vw)' : 'translateX(0)'
                }}
                onClick={() => enterStoryMode('ZUNI')}
                >
                  Zuni
                </span>
              </div>
            </div>
            {/* SHOW_LABELS button removed from minimal version */}
          </div>
        </div>
      )}
      
      {/* Photographers Section - only visible when zoomed out or when in respective story mode */}
      {(effectiveViewState.zoom < 7.5 || activeElement === 'HILLERS' || activeElement === 'JACKSON') && (
        <div style={{
          position: 'absolute', 
          top: '2vw', 
          right: '2vw', 
          zIndex: 10, 
          maxWidth: '30vw', 
          background: 'transparent', 
          opacity: 1, 
          transition: 'opacity 0.3s, maxWidth 0.3s', 
          pointerEvents: 'auto'
        }}>
          <h2 className="geographica-hand category-title" style={{ 
            margin: 0, 
            padding: 0, 
            color: 'white', 
            fontSize: '4rem', 
            textShadow: 'rgba(0, 0, 0, 0.8) 3px 3px 8px', 
            lineHeight: 1.1, 
            textAlign: 'right', 
            cursor: 'pointer', 
            opacity: activeElement && (activeElement === 'HILLERS' || activeElement === 'JACKSON') ? 0 : 1, 
            transition: 'opacity 0.3s', 
            pointerEvents: activeElement ? 'none' : 'auto'
          }}>
            The Photographers
          </h2>
          <div className="aldine-regular" style={{ 
            margin: '0.5rem 0 0', 
            padding: 0, 
            color: 'white', 
            fontSize: '2rem', 
            textShadow: 'rgba(0, 0, 0, 0.8) 3px 3px 8px', 
            lineHeight: 1.4, 
            textAlign: 'right', 
            display: 'flex', 
            flexDirection: 'column'
          }}>
            <span className="category-item HILLERS-category" style={{ 
              cursor: 'pointer', 
              opacity: activeElement && activeElement !== 'HILLERS' ? 0 : 1, 
              transition: 'all 0.6s ease-out', 
              pointerEvents: 'auto', 
              fontSize: activeElement === 'HILLERS' ? '3rem' : '2rem', 
              WebkitTapHighlightColor: 'transparent', 
              userSelect: 'none', 
              position: 'relative', 
              zIndex: 'auto', 
              whiteSpace: 'nowrap',
              transform: activeElement === 'HILLERS' ? 'translateX(-2vw)' : 'translateX(0)'
            }}
            onClick={() => {
              // Toggle behavior - if already active, deactivate
              if (activeElement === 'HILLERS') {
                // Exit active state
                setActiveElement(null);
                // Hide labels
                setShowLabels(false);
                // Return to home view
                setViewState({
                  ...HOME_VIEW_STATE,
                  transitionDuration: 2000,
                  transitionInterpolator: new FlyToInterpolator({
                    speed: 1.2, curve: 1.5, screenSpeed: 15
                  })
                });
              } else {
                // Enter active state for Hillers
                setActiveElement('HILLERS');
                // Show labels
                setShowLabels(true);
                // Apply custom camera position
                setViewState({
                  longitude: -109.948693,
                  latitude: 35.332032,
                  zoom: 8.74,
                  pitch: 51.55,
                  bearing: -19.10,
                  fov: 60,
                  transitionDuration: 2500,
                  transitionInterpolator: new FlyToInterpolator({
                    speed: 1.2, curve: 1.5, screenSpeed: 15
                  })
                });
              }
              // Stay in home view mode
              setAppMode(APP_MODES.HOME);
            }}
            >
              John K. Hillers
            </span>
            <span className="category-item JACKSON-category" style={{ 
              cursor: 'pointer', 
              opacity: activeElement && activeElement !== 'JACKSON' ? 0 : 1, 
              transition: 'all 0.6s ease-out', 
              pointerEvents: 'auto', 
              fontSize: activeElement === 'JACKSON' ? '3rem' : '2rem', 
              WebkitTapHighlightColor: 'transparent', 
              userSelect: 'none', 
              position: 'relative', 
              zIndex: 'auto', 
              whiteSpace: 'nowrap',
              transform: activeElement === 'JACKSON' ? 'translateX(-2vw)' : 'translateX(0)'
            }}
            onClick={() => {
              // Toggle behavior - if already active, deactivate
              if (activeElement === 'JACKSON') {
                // Exit active state
                setActiveElement(null);
                // Hide labels
                setShowLabels(false);
                // Return to home view
                setViewState({
                  ...HOME_VIEW_STATE,
                  transitionDuration: 2000,
                  transitionInterpolator: new FlyToInterpolator({
                    speed: 1.2, curve: 1.5, screenSpeed: 15
                  })
                });
              } else {
                // Enter active state for Jackson
                setActiveElement('JACKSON');
                // Show labels
                setShowLabels(true);
                // Apply custom camera position for Jackson
                setViewState({
                  longitude: -107.888988,
                  latitude: 39.093789,
                  zoom: 7.66,
                  pitch: 64.22,
                  bearing: -26.51,
                  fov: 60,
                  transitionDuration: 2500,
                  transitionInterpolator: new FlyToInterpolator({
                    speed: 1.2, curve: 1.5, screenSpeed: 15
                  })
                });
              }
              // Stay in home view mode
              setAppMode(APP_MODES.HOME);
            }}
            >
              William Henry Jackson
            </span>
          </div>
        </div>
      )}
      
      {/* National Parks Section - HIDDEN FOR MINIMAL VERSION */}
      
      {/* Bureau of Ethnography Section - HIDDEN FOR MINIMAL VERSION */}
      
      {/* Close Button - only visible in story mode */}
      {appMode === APP_MODES.STORY && (
        <div 
          onClick={exitStoryMode}
          style={{
            position: 'absolute',
            top: '5vw',
            left: '5vw',
            zIndex: 20,
            cursor: 'pointer',
            padding: '15px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.2s ease-out',
            opacity: 0.8
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
          </svg>
        </div>
      )}
      
      {/* Explore Button - HIDDEN FOR MINIMAL VERSION */}
      
      {/* Info Panel is hidden, but code is kept for future use */}
      
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

      {/* Display tribal information when in story mode */}
      <TribalInfoPanel />
      </div>
    </AppContext.Provider>
  );
}