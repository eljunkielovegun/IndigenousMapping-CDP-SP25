// TerrainLayer.jsx
import { TerrainLayer as DeckTerrainLayer } from '@deck.gl/geo-layers';
import { MAPBOX_TOKEN } from '../../config/mapbox';

// Set up base URLs for Mapbox services
const ELEVATION_URL = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${MAPBOX_TOKEN}`;
const TEXTURE_URL = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`;

export default function createTerrainLayer() {
  console.log("Creating terrain layer for Navajo Nation");
  
  try {
    return new DeckTerrainLayer({
      id: 'terrain',
      elevationDecoder: {
        rScaler: 256,
        gScaler: 1,
        bScaler: 1 / 256,
        offset: -32768
      },
      elevationData: ELEVATION_URL,
      texture: TEXTURE_URL,
      bounds: [-110.5, 35.5, -108.5, 37.0], // Navajo Nation approximate bounds
      opacity: 1,
      wireframe: false,
      material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [255, 255, 255]
      },
      meshMaxError: 2.0, // Better quality
      elevationScale: 1.5, // Enhanced elevation
      minZoom: 6,
      maxZoom: 15
    });
  } catch (error) {
    console.error("Error in createTerrainLayer:", error);
    throw error;
  }
}
