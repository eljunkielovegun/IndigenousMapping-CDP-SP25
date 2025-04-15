import { useState, useCallback, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { MapView } from '@deck.gl/core';
import { BitmapLayer, IconLayer } from '@deck.gl/layers';
// import { TerrainLayer } from '@deck.gl/geo-layers';
import { TerrainLayer as DeckTerrainLayer } from '@deck.gl/geo-layers';

import Map from 'react-map-gl';
import { MAPBOX_TOKEN } from '../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set mapbox token globally
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Mystic Lake data
const mysticLake = {
  id: "mystic-lake",
  name: "Mystic Lake, Montana",
  coordinates: {
    latitude: 45.5453506,
    longitude: -110.9193637
  },
  camera: {
    viewpoint: {
      latitude: 45.5461,
      longitude: -110.9215,
      elevation: 6420
    },
    bearing: 135,
    pitch: 45,
    zoom: 14.2
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-110.9240, 45.5440],  // Southwest corner
      [-110.9170, 45.5480]   // Northeast corner
    ]
  }
};

// Initial view state (zoomed out to see the marker)
const INITIAL_VIEW_STATE = {
  longitude: -110.9193637,
  latitude: 45.5453506,
  zoom: 8,
  pitch: 40,
  bearing: 0,
  maxPitch: 85,
  minZoom: 2,
  maxZoom: 20
};

function flyToValley() {
  setViewState({
    latitude: 45.5453,
    longitude: -110.9194,
    zoom: 15.5,
    pitch: 80,        // Almost horizontal view
    bearing: 180,     // Facing "up" the valley
    transitionDuration: 3000
  });
}

export default function () {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState(false);
  const [error, setError] = useState(null);
  const [layers, setLayers] = useState([]);

  // Create and update layers
  useEffect(() => {
    const newLayers = [];
    
    // Create terrain layer for elevation
    const terrainLayer = new DeckTerrainLayer({

      id: 'terrain',
      elevationData: `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`,
      texture: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
      minZoom: 0,
      maxZoom: 23,
      elevationDecoder: {
        rScaler: 256,
        gScaler: 1,
        bScaler: 1/256,
        offset: -32768
      },
      elevationScale: 10,
      // Use Mapbox terrain tileset
      

      wireframe: false,
      material: {
        ambient: 0.6,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [255, 255, 255]
      },
      meshMaxError: 4.0
    });
    newLayers.push(terrainLayer);

    // Create a marker layer
    const markerLayer = new IconLayer({
      id: 'marker-layer',
      data: [
        {
          position: [mysticLake.coordinates.longitude, mysticLake.coordinates.latitude],
          icon: 'marker',
          size: 40,
          color: [255, 0, 0]
        }
      ],
      pickable: true,
      iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      iconMapping: {
        marker: {
          x: 0, 
          y: 0,
          width: 128, 
          height: 128, 
          anchorY: 128, 
          mask: true
        }
      },
      getPosition: d => d.position,
      getIcon: d => d.icon,
      getSize: d => d.size,
      getColor: d => d.color,
      onClick: () => zoomToLocation()
    });
    newLayers.push(markerLayer);

    // Add photo overlay if showing
    if (showPhotoOverlay) {
      // Create a colored rectangle for the overlay
      const photoLayer = new BitmapLayer({
        id: 'photo-overlay',
        bounds: mysticLake.overlay.bounds,
        image: new Uint8Array([255, 165, 0, 150]), // Semi-transparent orange
        imageWidth: 1,
        imageHeight: 1,
        opacity: 0.7
      });
      newLayers.push(photoLayer);
    }

    setLayers(newLayers);
  }, [showPhotoOverlay]);

  // Function to zoom to the photo location
  const zoomToLocation = useCallback(() => {
    setViewState({
      longitude: mysticLake.camera.viewpoint.longitude,
      latitude: mysticLake.camera.viewpoint.latitude,
      zoom: mysticLake.camera.zoom,
      pitch: mysticLake.camera.pitch,
      bearing: mysticLake.camera.bearing,
      transitionDuration: 2000
    });
    
    // Show photo overlay with slight delay to wait for zoom transition
    setTimeout(() => {
      setShowPhotoOverlay(true);
    }, 1000);
  }, []);

  // Function to reset view
  const resetView = useCallback(() => {
    setViewState({
      ...INITIAL_VIEW_STATE,
      transitionDuration: 1000
    });
    setShowPhotoOverlay(false);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          zIndex: 10, 
          background: 'red', 
          color: 'white', 
          padding: '5px' 
        }}>
          {error}
        </div>
      )}
      
      {/* Simple controls */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 10, 
        background: 'white', 
        padding: '10px',
        borderRadius: '4px' 
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Mystic Lake Photo Overlay</h3>
        <p style={{ fontSize: '12px', margin: '0 0 8px 0' }}>
          Click on the red marker to zoom to Mystic Lake
        </p>
        
        {showPhotoOverlay && (
          <button 
            onClick={resetView}
            style={{
              padding: '5px 10px',
              background: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset View
          </button>
        )}
      </div>
      
      {/* DeckGL Map */}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        onViewStateChange={({viewState}) => setViewState(viewState)}
        controller={{
              maxPitch: 85,     // Allow very steep camera angle
              minPitch: 0,
              inertia: true
            }}
        layers={layers}
        views={new MapView({ 
              repeat: true,
              nearZMultiplier: 0.01,  // Get really close to terrain
              farZMultiplier: 10000   // See distant terrain
            })}
        onError={(err) => {
          console.error("DeckGL Error:", err);
          setError(`DeckGL error: ${err.message}`);
        }}
        getTooltip={({object}) => object && 'Click to zoom to Mystic Lake'}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/outdoors-v11"
          reuseMaps
        />
      </DeckGL>
    </div>
  );
}