// DeckGLContainer.jsx
import { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import * as Mapbox from 'react-map-gl/mapbox'; // Import the entire module
import { MapView } from '@deck.gl/core';
import { MAPBOX_TOKEN } from '../../config/mapbox';
import { useViewState } from '../../hooks/deck/useViewState';
import createTerrainLayer from '../Layers/TerrainLayer';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set mapbox token globally
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function DeckGLContainer() {
  const [error, setError] = useState(null);
  const viewState = useViewState();
  const [terrainLayer, setTerrainLayer] = useState(null);
  
  useEffect(() => {
    try {
      const layer = createTerrainLayer();
      console.log("TerrainLayer created:", layer);
      setTerrainLayer(layer);
    } catch (err) {
      console.error("Error creating terrain layer:", err);
      setError(`Failed to create terrain layer: ${err.message}`);
    }
  }, []);

  // Use empty array if terrainLayer is null
  const layers = terrainLayer ? [terrainLayer] : [];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {error && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'red', color: 'white', padding: '5px' }}>
          {error}
        </div>
      )}
      <div style={{ position: 'absolute', top: error ? 40 : 10, left: 10, zIndex: 10, background: 'white', padding: '5px' }}>
        Navajo Nation 3D Terrain Map
      </div>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        views={new MapView({ repeat: true })}
        onError={(err) => {
          console.error("DeckGL Error:", err);
          setError(`DeckGL error: ${err.message}`);
        }}
        debug={true}
      >
        <Mapbox.Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          reuseMaps
          attributionControl={true}
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        />
      </DeckGL>
    </div>
  );
}