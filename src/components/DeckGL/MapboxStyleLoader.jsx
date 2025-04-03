import { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/mapbox';
import { useViewState } from '../../hooks/deck/useViewState';
import { MAPBOX_TOKEN } from '../../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxStyleLoader({ styleUrl, children, layers = [] }) {
  const initialViewState = useViewState();
  const [viewState, setViewState] = useState(initialViewState);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Create a custom map style that includes the Native Land tileset
  const customMapStyle = {
    version: 8,
    name: "Indigenous Territories Map",
    sources: {
      // Base satellite source
      'mapbox-satellite': {
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
      // Native Land tileset source
      "native-land": {
        type: "vector",
        url: "mapbox://nativeland.4pgB_next_nld_terr_prod_layer"
      },
      // Expedition routes and points sources
      "jackson-expedition-route": {
        type: "geojson",
        data: {
          "type": "Feature",
          "properties": {
            "name": "Jackson Expedition Route"
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [-111.65, 35.19], // Starting point near Flagstaff
              [-110.87, 35.60], // Through Canyon de Chelly area
              [-110.45, 35.73], // Into Hopi region
              [-110.17, 36.31], // North to Monument Valley
              [-109.87, 36.99]  // Ending near Four Corners
            ]
          }
        }
      },
      "hillers-expedition-route": {
        type: "geojson",
        data: {
          "type": "Feature",
          "properties": {
            "name": "Hillers Expedition Route"
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [-110.67, 36.92], // Starting in the north
              [-110.50, 36.54], // Through Black Mesa
              [-110.09, 36.11], // East through Hopi lands
              [-109.87, 35.83], // South toward Gallup
              [-109.54, 35.52]  // Ending point
            ]
          }
        }
      },
      "expedition-points": {
        type: "geojson",
        data: {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {
                "name": "Canyon de Chelly",
                "expedition": "Jackson",
                "description": "Major photography site"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-109.47, 36.13]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Walpi",
                "expedition": "Hillers",
                "description": "Hopi village photography"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-110.39, 35.87]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Monument Valley",
                "expedition": "Jackson",
                "description": "Iconic landscape photography"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-110.11, 36.98]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Window Rock",
                "expedition": "Hillers",
                "description": "Cultural documentation"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-109.05, 35.68]
              }
            }
          ]
        }
      },
      "chicago-route": {
        type: "geojson",
        data: {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [-87.63, 41.88],   // Chicago
              [-111.89, 40.76],  // Salt Lake City
              [-110.55, 36.15]   // Navajo Nation center
            ]
          }
        }
      },
      "origin-destination-points": {
        type: "geojson",
        data: {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {
                "name": "Chicago",
                "type": "origin",
                "description": "Starting point for expeditions"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-87.63, 41.88]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Washington D.C.",
                "type": "destination",
                "description": "Smithsonian Institution"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-77.03, 38.90]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Salt Lake City",
                "type": "waypoint",
                "description": "Supply point for expeditions"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-111.89, 40.76]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Mexico City",
                "type": "destination",
                "description": "Exhibition location"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-99.13, 19.43]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "New York",
                "type": "destination",
                "description": "Exhibition venue"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-73.94, 40.67]
              }
            }
          ]
        }
      },
      "general-image-locations": {
        type: "geojson",
        data: {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "properties": {
                "name": "Chaco Canyon",
                "type": "photo-site",
                "description": "Archaeological site photography"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-107.96, 36.06]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Grand Canyon",
                "type": "photo-site",
                "description": "Landscape photography"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-112.11, 36.10]
              }
            },
            {
              "type": "Feature",
              "properties": {
                "name": "Yellowstone",
                "type": "photo-site",
                "description": "National park documentation"
              },
              "geometry": {
                "type": "Point",
                "coordinates": [-110.58, 44.42]
              }
            }
          ]
        }
      }
    },
    sprite: "mapbox://sprites/mapbox/satellite-streets-v12",
    glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    terrain: {
      source: "mapbox-dem",
      exaggeration: 1.5
    },
    layers: [
      // Base satellite layer
      {
        id: "satellite",
        type: "raster",
        source: "mapbox-satellite",
        minzoom: 0,
        maxzoom: 22
      },
      // Native Land territories layer
      {
        id: "native-land-territories",
        type: "fill",
        source: "native-land",
        "source-layer": "4pgB_next_nld_terr_prod_source_layer",
        paint: {
          "fill-color": [
            "match",
            ["get", "Slug"],
            ["navajo"], "hsla(0, 99%, 61%, 0.5)",
            ["hopi"], "hsla(294, 66%, 34%, 0.5)",
            ["zuni"], "hsla(249, 70%, 59%, 0.5)",
            "hsla(156, 66%, 34%, 0.3)"
          ],
          "fill-outline-color": [
            "match",
            ["get", "Slug"],
            ["navajo"], "hsl(0, 99%, 41%)",
            ["hopi"], "hsl(294, 66%, 24%)",
            ["zuni"], "hsl(249, 70%, 39%)",
            "hsl(156, 66%, 24%)"
          ]
        }
      },
      // Labels for Native Land territories
      {
        id: "native-land-labels",
        type: "symbol",
        source: "native-land",
        "source-layer": "4pgB_next_nld_terr_prod_source_layer",
        layout: {
          "text-field": ["get", "Name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": 12,
          "text-max-width": 10,
          "text-variable-anchor": ["center"],
          "text-justify": "center",
          "text-radial-offset": 0.5
        },
        paint: {
          "text-color": "white",
          "text-halo-color": "rgba(0, 0, 0, 0.7)",
          "text-halo-width": 1.5
        }
      },
      
      // Jackson Expedition Route
      {
        id: "jackson-expedition-route-line",
        type: "line",
        source: "jackson-expedition-route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "hsl(199, 100%, 43%)",
          "line-width": 6,
          "line-dasharray": [0, 2, 1],
          "line-blur": 1
        }
      },
      
      // Hillers Expedition Route
      {
        id: "hillers-expedition-route-line",
        type: "line",
        source: "hillers-expedition-route",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "hsla(0, 100%, 61%, 0.83)",
          "line-width": 6,
          "line-dasharray": [0, 2, 1],
          "line-blur": 1
        }
      },
      
      // Expedition Points
      {
        id: "expedition-points",
        type: "circle",
        source: "expedition-points",
        paint: {
          "circle-radius": 10,
          "circle-color": [
            "match",
            ["get", "expedition"],
            "Jackson", "hsl(199, 100%, 43%)",
            "Hillers", "hsla(0, 100%, 61%, 0.83)",
            "lightgray"
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "white",
          "circle-blur": 0.3
        }
      },
      
      // Expedition Point Labels
      {
        id: "expedition-point-labels",
        type: "symbol",
        source: "expedition-points",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": 14,
          "text-offset": [0, -2.0],
          "text-anchor": "bottom",
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "white",
          "text-halo-color": "rgba(0, 0, 0, 0.9)",
          "text-halo-width": 2
        }
      },
      
      // Origin-Destination Points (Chicago, Mexico, etc.)
      {
        id: "origin-destination-markers",
        type: "circle",
        source: "origin-destination-points",
        paint: {
          "circle-radius": 12,
          "circle-color": [
            "match",
            ["get", "type"],
            "origin", "hsl(54, 100%, 50%)",
            "destination", "hsl(54, 100%, 50%)",
            "waypoint", "hsl(54, 100%, 40%)",
            "hsl(54, 100%, 50%)"
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "white",
          "circle-blur": 0.3
        }
      },
      
      // Origin-Destination Labels
      {
        id: "origin-destination-labels",
        type: "symbol",
        source: "origin-destination-points",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 16,
          "text-offset": [0, -2.0],
          "text-anchor": "bottom",
          "text-allow-overlap": true,
          "text-justify": "center",
          "text-max-width": 10
        },
        paint: {
          "text-color": "white",
          "text-halo-color": "rgba(0, 0, 0, 0.9)",
          "text-halo-width": 2
        }
      },
      
      // General Photo Locations
      {
        id: "general-photo-markers",
        type: "circle",
        source: "general-image-locations",
        paint: {
          "circle-radius": 10,
          "circle-color": "hsl(30, 100%, 50%)",
          "circle-stroke-width": 3,
          "circle-stroke-color": "white",
          "circle-blur": 0.2
        }
      },
      
      // General Photo Location Labels
      {
        id: "general-photo-labels",
        type: "symbol",
        source: "general-image-locations",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": 14,
          "text-offset": [0, -2.0],
          "text-anchor": "bottom",
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "white",
          "text-halo-color": "rgba(0, 0, 0, 0.9)",
          "text-halo-width": 2
        }
      },
      
      // Connection line from Chicago to Arizona
      {
        id: "chicago-to-arizona-line",
        type: "line",
        source: "chicago-route", // Use the dedicated source we created
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "hsla(54, 72%, 49%, 0.8)",
          "line-width": 5,
          "line-dasharray": [2, 1],
          "line-blur": 1
        }
      }
    ]
  };


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'white', padding: '5px' }}>
        Indigenous Territory Map - Navajo Nation
      </div>
      
      <DeckGL
        initialViewState={initialViewState}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={layers}
        onError={(e) => console.error("DeckGL error:", e)}
      >
        <Map 
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={customMapStyle}
          onLoad={() => {
            console.log('Map loaded successfully');
            setMapLoaded(true);
          }}
        />
        {mapLoaded && children}
      </DeckGL>
    </div>
  );
}