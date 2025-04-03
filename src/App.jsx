import { useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import MapboxStyleLoader from './components/DeckGL/MapboxStyleLoader';

// Path to the custom Mapbox style
const CUSTOM_STYLE_URL = '/assets/geojson/mapBoxStyle.json';

export default function App() {
  const [error, setError] = useState(null);
  
  // We'll let the Mapbox style handle the territories and expedition routes
  const layers = [];

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'white', padding: '10px', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Indigenous Territories & Expeditions</h3>
        <div style={{ fontSize: '12px' }}>
          <div><span style={{ color: 'hsla(0, 99%, 61%, 0.83)', fontWeight: 'bold' }}>▬▬▬</span> Hillers Expedition</div>
          <div><span style={{ color: 'hsl(199, 100%, 43%)', fontWeight: 'bold' }}>▬▬▬</span> Jackson Expedition</div>
          <div><span style={{ color: 'hsla(54, 72%, 49%, 0.6)', fontWeight: 'bold' }}>▬▬▬</span> Travel Routes</div>
          <div><span style={{ color: 'hsl(54, 100%, 50%)', fontWeight: 'bold' }}>●</span> Major Cities</div>
          <div><span style={{ color: 'hsl(30, 100%, 50%)', fontWeight: 'bold' }}>●</span> Photo Locations</div>
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
      
      {/* Use the custom style */}
      <MapboxStyleLoader 
        styleUrl={CUSTOM_STYLE_URL}
        layers={layers}
      />
    </div>
  );
}