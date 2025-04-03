// SimpleDeck.jsx
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '../../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set the token globally
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function SimpleDeck() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapError, setMapError] = useState(null);
  
  useEffect(() => {
    // Skip if map is already initialized
    if (map.current) return;
    
    try {
      console.log("Initializing map with token:", MAPBOX_TOKEN);
      
      // Initialize map with a standard style string
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.4, 37.8], // San Francisco
        zoom: 9
      });
      
      // Add load handler
      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapError(null);
        
        // Add a simple marker to verify rendering
        new mapboxgl.Marker()
          .setLngLat([-122.4, 37.8])
          .addTo(map.current);
      });
      
      // Add error handler
      map.current.on('error', (e) => {
        console.error("Mapbox error:", e);
        setMapError(e.error?.message || "Unknown map error");
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(error.message);
    }
    
    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'white', padding: '5px' }}>
        Simple Mapbox Map
      </div>
      {mapError && (
        <div style={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 10, 
          zIndex: 10, 
          background: 'rgba(255,0,0,0.8)', 
          color: 'white',
          padding: '10px', 
          borderRadius: '4px',
          maxWidth: '80%'
        }}>
          <strong>Map Error:</strong> {mapError}
        </div>
      )}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}