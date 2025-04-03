import { useState, useEffect } from 'react';
import { MAPBOX_TOKEN } from '../../config/mapbox';

export function useMapboxStyle(styleUrl = null) {
  const [mapStyle, setMapStyle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStyle() {
      try {
        setIsLoading(true);
        let styleData;

        if (styleUrl) {
          // Instead of trying to use our complex style with all its URLs that cause CORS issues,
          // let's just create a simpler style directly
          
          // Create a basic Mapbox style that works reliably
          styleData = {
            version: 8,
            name: "Indigenous Territories Map",
            center: [-109.55, 36.15],
            zoom: 7.5,
            bearing: 0,
            pitch: 45,
            sprite: "mapbox://sprites/mapbox/satellite-streets-v12",
            glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
            sources: {
              // Base satellite source
              mapbox: {
                type: "raster",
                url: "mapbox://mapbox.satellite",
                tileSize: 256
              },
              // Terrain source
              "mapbox-dem": {
                type: "raster-dem",
                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                tileSize: 512,
                maxzoom: 14
              },
                // Custom GeoJSON sources - More detailed territorial boundaries
                "navajo-geojson": {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {
                      name: "Navajo Nation"
                    },
                    geometry: {
                      type: "Polygon",
                      coordinates: [[
                        [-111.12, 37.00],  // Northern border
                        [-111.12, 35.70],  // Western edge
                        [-110.86, 35.57],  // Southwest 
                        [-110.35, 35.23],  // South boundary
                        [-109.90, 35.17],  // Southeast corner
                        [-109.05, 35.63],  // East boundary
                        [-109.05, 37.00],  // Northeast corner
                        [-111.12, 37.00]   // Close polygon
                      ]]
                    }
                  }
                },
                "hopi-geojson": {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {
                      name: "Hopi Reservation"
                    },
                    geometry: {
                      type: "Polygon",
                      coordinates: [[
                        [-110.66, 36.15],  // Northwest corner
                        [-110.63, 35.79],  // Southwest
                        [-110.01, 35.82],  // Southeast  
                        [-110.06, 36.17],  // Northeast
                        [-110.66, 36.15]   // Close polygon
                      ]]
                    }
                  }
                },
                "navajo-capital": {
                  type: "geojson",
                  data: {
                    type: "FeatureCollection",
                    features: [
                      {
                        type: "Feature",
                        properties: { name: "Window Rock (Navajo Capital)" },
                        geometry: {
                          type: "Point",
                          coordinates: [-109.0515, 35.6814]
                        }
                      }
                    ]
                  }
                },
                "hopi-capital": {
                  type: "geojson",
                  data: {
                    type: "FeatureCollection",
                    features: [
                      {
                        type: "Feature",
                        properties: { name: "Kykotsmovi (Hopi Tribal HQ)" },
                        geometry: {
                          type: "Point",
                          coordinates: [-110.6234, 35.8706]
                        }
                      }
                    ]
                  }
                },
                // Arizona state boundary - simplified public domain data
                "arizona-state": {
                  type: "geojson",
                  data: {
                    "type": "Feature",
                    "properties": {
                      "name": "Arizona"
                    },
                    "geometry": {
                      "type": "Polygon",
                      "coordinates": [[
                        [-114.81, 37.00],  // Northwest corner
                        [-114.81, 31.33],  // Southwest corner
                        [-109.04, 31.33],  // Southeast corner
                        [-109.04, 37.00],  // Northeast corner
                        [-114.81, 37.00]   // Close polygon
                      ]]
                    }
                  }
                }
              },
              sprite: "https://api.mapbox.com/sprites/v1/mapbox/satellite-streets-v12/sprite?access_token=" + MAPBOX_TOKEN,
              terrain: {
                source: "terrain",
                exaggeration: 1.5
              },
              layers: [
                // Base satellite layer
                {
                  id: "satellite",
                  type: "raster",
                  source: "mapbox",
                  minzoom: 0,
                  maxzoom: 22
                },
                // Arizona state outline for reference
                {
                  id: "arizona-state-outline",
                  type: "line",
                  source: "arizona-state",
                  layout: {},
                  paint: {
                    "line-color": "white",
                    "line-width": 1,
                    "line-opacity": 0.5
                  }
                },
                // Navajo territory using the named source
                {
                  id: "navajo-territory",
                  type: "fill",
                  source: "navajo-geojson",
                  paint: {
                    "fill-color": "hsla(0, 99%, 61%, 0.58)",
                    "fill-outline-color": "hsl(0, 99%, 41%)"
                  }
                },
                // Navajo territory outline
                {
                  id: "navajo-territory-outline",
                  type: "line",
                  source: "navajo-geojson",
                  paint: {
                    "line-color": "hsl(0, 99%, 41%)",
                    "line-width": 2
                  }
                },
                // Hopi territory using the named source
                {
                  id: "hopi-territory",
                  type: "fill",
                  source: "hopi-geojson",
                  paint: {
                    "fill-color": "hsla(294, 66%, 34%, 0.53)",
                    "fill-outline-color": "hsl(294, 66%, 24%)"
                  }
                },
                // Hopi territory outline
                {
                  id: "hopi-territory-outline",
                  type: "line",
                  source: "hopi-geojson",
                  paint: {
                    "line-color": "hsl(294, 66%, 24%)",
                    "line-width": 2
                  }
                },
                // Territory labels
                {
                  id: "territory-labels",
                  type: "symbol",
                  source: "navajo-geojson",
                  layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
                    "text-size": 16,
                    "text-offset": [0, 0],
                    "text-anchor": "center"
                  },
                  paint: {
                    "text-color": "white",
                    "text-halo-color": "rgba(0, 0, 0, 0.5)",
                    "text-halo-width": 1.5
                  }
                },
                {
                  id: "hopi-labels",
                  type: "symbol",
                  source: "hopi-geojson",
                  layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
                    "text-size": 14,
                    "text-offset": [0, 0],
                    "text-anchor": "center"
                  },
                  paint: {
                    "text-color": "white",
                    "text-halo-color": "rgba(0, 0, 0, 0.5)",
                    "text-halo-width": 1.5
                  }
                },
                // Navajo capital marker using the named source
                {
                  id: "navajo-capital-marker",
                  type: "circle",
                  source: "navajo-capital",
                  paint: {
                    "circle-radius": 6,
                    "circle-color": "hsla(0, 99%, 61%, 1)",
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "white"
                  }
                },
                // Hopi capital marker using the named source
                {
                  id: "hopi-capital-marker",
                  type: "circle",
                  source: "hopi-capital",
                  paint: {
                    "circle-radius": 6,
                    "circle-color": "hsla(294, 66%, 44%, 1)",
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "white"
                  }
                },
                // Label for Navajo capital
                {
                  id: "navajo-capital-label",
                  type: "symbol",
                  source: "navajo-capital",
                  layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
                    "text-offset": [0, 1.5],
                    "text-anchor": "top",
                    "text-size": 12
                  },
                  paint: {
                    "text-color": "white",
                    "text-halo-color": "rgba(0, 0, 0, 0.7)",
                    "text-halo-width": 1
                  }
                },
                // Label for Hopi capital
                {
                  id: "hopi-capital-label",
                  type: "symbol",
                  source: "hopi-capital",
                  layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
                    "text-offset": [0, 1.5],
                    "text-anchor": "top",
                    "text-size": 12
                  },
                  paint: {
                    "text-color": "white",
                    "text-halo-color": "rgba(0, 0, 0, 0.7)",
                    "text-halo-width": 1
                  }
                }
              ]
            };
            
            console.log("Created custom indigenous territories style");
        } else {
          // Use default Mapbox style
          return 'mapbox://styles/mapbox/satellite-v9';
        }

        // Use local sprites to avoid CORS issues
        if (styleData.sprite) {
          // Point to local sprite files
          styleData.sprite = '/assets/geojson/sprite_images/sprite';
          console.log('Using local sprite images:', styleData.sprite);
        }

        // Handle sources that might have CORS issues
        if (styleData.sources && styleData.sources.composite) {
          // Keep the style structure but modify how we handle the sources
          console.log('Modifying remote sources to avoid CORS');
          
          // Create a style structure that will work with standard Mapbox styles
          // but preserve our custom layer styling
          
          // Use satellite imagery as base
          styleData.sources.mapbox = {
            type: 'raster',
            url: 'mapbox://mapbox.satellite',
            tileSize: 256
          };
          
          // Add a background terrain source
          styleData.sources.terrain = {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 256
          };
          
          // Temporarily replace vector sources with placeholder
          // to maintain layer references without CORS errors
          styleData.sources.composite = {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-streets-v8',
            promoteId: {'original-source': 'id'}
          };
        }
        
        // Enable 3D terrain
        if (!styleData.terrain) {
          styleData.terrain = {
            source: 'terrain',
            exaggeration: 1.5
          };
        }

        console.log('Loaded map style:', styleData.name);
        setMapStyle(styleData);
        setError(null);
      } catch (err) {
        console.error('Error loading map style:', err);
        setError(err.message);
        setMapStyle(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadStyle();
  }, [styleUrl]);

  return { mapStyle, isLoading, error };
}