import { useState, useEffect, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import Map from 'react-map-gl';
import { useViewState } from '../../hooks/deck/useViewState';
import { MAPBOX_TOKEN } from '../../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapboxStyleLoader({ 
  styleUrl, 
  children, 
  layers = [], 
  viewState: externalViewState, 
  onViewStateChange,
  territoriesVisible = {
    navajo: true,   // Default to showing Navajo (Diné) territory
    hopi: true,     // Default to showing Hopi territory
    zuni: true,     // Default to showing Zuni territory
    others: false   // Default to hiding other territories
  }
}) {
  const initialViewState = useViewState();
  const [internalViewState, setInternalViewState] = useState(initialViewState);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Use external viewState if provided, otherwise use internal state
  const effectiveViewState = externalViewState || internalViewState;
  
  // State to track viewState for logging
  const [lastLoggedViewState, setLastLoggedViewState] = useState(null);
  
  // Function to capture current viewState and format it for easy copying
  const captureViewState = useCallback(() => {
    const vs = effectiveViewState;
    console.log(`
// Camera data for historicalPhotoData.js
camera: {
  viewpoint: {
    latitude: ${vs.latitude.toFixed(6)},
    longitude: ${vs.longitude.toFixed(6)},
    elevation: 0 // Set appropriate elevation
  },
  bearing: ${vs.bearing.toFixed(2)},
  pitch: ${vs.pitch.toFixed(2)},
  zoom: ${vs.zoom.toFixed(2)},
  fov: 60 // Standard field of view
}
`);
  }, [effectiveViewState]);

  // Add a keyboard listener for capturing viewState (press 'c' key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'c' || e.key === 'C') {
        captureViewState();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [captureViewState]);
  
  // Update territory visibility using direct Mapbox visibility property
  useEffect(() => {
    if (mapInstance) {
      try {
        // Define which layers we're controlling
        const territoryLayers = ['native-land-territories', 'native-land-labels'];
        
        // Set visibility for each territory type
        const setVisibility = (slug, isVisible) => {
          if (isVisible) {
            // If visible, set filter to only show this territory type
            const filter = ["==", ["get", "Slug"], slug];
            
            // Create a new layer ID specific to this territory
            const layerId = `territory-${slug}`;
            
            // Check if layer already exists
            if (!mapInstance.getLayer(layerId)) {
              // Clone the layer with a new ID and filter for just this territory
              if (mapInstance.getLayer('native-land-territories')) {
                const originalLayerProps = mapInstance.getLayer('native-land-territories');
                
                // Add a new layer for this territory
                mapInstance.addLayer({
                  id: layerId,
                  type: 'fill',
                  source: 'native-land',
                  'source-layer': '4pgB_next_nld_terr_prod_source_layer',
                  filter: filter,
                  paint: {
                    "fill-color": slug === 'navajo' ? "hsla(0, 99%, 61%, 0.5)" :
                                  slug === 'hopi' ? "hsla(294, 66%, 34%, 0.5)" :
                                  slug === 'zuni' ? "hsla(249, 70%, 59%, 0.5)" :
                                  "hsla(156, 66%, 34%, 0.3)",
                    "fill-outline-color": slug === 'navajo' ? "hsl(0, 99%, 41%)" :
                                         slug === 'hopi' ? "hsl(294, 66%, 24%)" :
                                         slug === 'zuni' ? "hsl(249, 70%, 39%)" :
                                         "hsl(156, 66%, 24%)"
                  }
                });
              }
            } else {
              // If layer exists, make sure it's visible
              mapInstance.setLayoutProperty(layerId, 'visibility', 'visible');
            }
          } else {
            // If not visible, hide the layer if it exists
            const layerId = `territory-${slug}`;
            if (mapInstance.getLayer(layerId)) {
              mapInstance.setLayoutProperty(layerId, 'visibility', 'none');
            }
          }
        };
        
        // Hide the original territories layer completely
        territoryLayers.forEach(layer => {
          if (mapInstance.getLayer(layer)) {
            mapInstance.setLayoutProperty(layer, 'visibility', 'none');
          }
        });
        
        // Apply visibility settings for each specific territory
        setVisibility('navajo', territoriesVisible.navajo);
        setVisibility('hopi', territoriesVisible.hopi);
        setVisibility('zuni', territoriesVisible.zuni);
        
        // Handle "other" territories specially
        if (territoriesVisible.others) {
          const othersLayerId = 'territory-others';
          
          // Add a layer for other territories if it doesn't exist
          if (!mapInstance.getLayer(othersLayerId)) {
            // Add a new layer with a filter for other territories
            mapInstance.addLayer({
              id: othersLayerId,
              type: 'fill',
              source: 'native-land',
              'source-layer': '4pgB_next_nld_terr_prod_source_layer',
              filter: [
                "all",
                ["!=", ["get", "Slug"], "navajo"],
                ["!=", ["get", "Slug"], "hopi"],
                ["!=", ["get", "Slug"], "zuni"]
              ],
              paint: {
                "fill-color": "hsla(156, 66%, 34%, 0.3)",
                "fill-outline-color": "hsl(156, 66%, 24%)"
              }
            });
          } else {
            // Make sure the layer is visible
            mapInstance.setLayoutProperty(othersLayerId, 'visibility', 'visible');
          }
        } else {
          // Hide the "others" layer if it exists
          const othersLayerId = 'territory-others';
          if (mapInstance.getLayer(othersLayerId)) {
            mapInstance.setLayoutProperty(othersLayerId, 'visibility', 'none');
          }
        }
        
        console.log("Updated territory visibility");
      } catch (error) {
        console.log("Error updating territory visibility:", error.message);
      }
    }
  }, [mapInstance, territoriesVisible]);
  
  // Only log when externalViewState changes significantly
  if (externalViewState && 
      (!lastLoggedViewState || 
       Math.abs(externalViewState.zoom - (lastLoggedViewState?.zoom || 0)) > 0.1 ||
       Math.abs(externalViewState.pitch - (lastLoggedViewState?.pitch || 0)) > 1 ||
       Math.abs(externalViewState.bearing - (lastLoggedViewState?.bearing || 0)) > 1)) {
    console.log("MapboxStyleLoader received external viewState:", externalViewState);
    setLastLoggedViewState(externalViewState);
  }

  // Create a filtered version of the territory layers based on visibility settings
  const filterTerritoryLayers = (baseStyle) => {
    // Create a deep copy of the style
    const style = JSON.parse(JSON.stringify(baseStyle));
    
    // Get visibility settings
    const showNavajo = territoriesVisible.navajo;
    const showHopi = territoriesVisible.hopi;
    const showZuni = territoriesVisible.zuni;
    const showOthers = territoriesVisible.others;
    
    // If all territories are disabled, remove the layers from the style
    if (!showNavajo && !showHopi && !showZuni && !showOthers) {
      style.layers = style.layers.filter(layer => 
        layer.id !== 'native-land-territories' && 
        layer.id !== 'native-land-labels'
      );
      return style;
    }
    
    // Filter the territory layers
    style.layers = style.layers.map(layer => {
      if (layer.id === 'native-land-territories' || layer.id === 'native-land-labels') {
        // Create a filter expression for the visible territories
        const territoryFilter = ["any"];
        
        if (showNavajo) {
          territoryFilter.push(["==", ["get", "Slug"], "navajo"]);
        }
        
        if (showHopi) {
          territoryFilter.push(["==", ["get", "Slug"], "hopi"]);
        }
        
        if (showZuni) {
          territoryFilter.push(["==", ["get", "Slug"], "zuni"]);
        }
        
        if (showOthers) {
          territoryFilter.push([
            "all",
            ["!=", ["get", "Slug"], "navajo"],
            ["!=", ["get", "Slug"], "hopi"],
            ["!=", ["get", "Slug"], "zuni"]
          ]);
        }
        
        // Create a new layer object with the filter
        return {
          ...layer,
          filter: territoryFilter
        };
      }
      
      return layer;
    });
    
    return style;
  };

  // Create a custom map style that includes the Native Land tileset
  const baseMapStyle = {
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


  // Apply territory filters to create the final style
  const customMapStyle = filterTerritoryLayers(baseMapStyle);
  
  // Log the style when territory visibility changes
  useEffect(() => {
    console.log("Territory visibility updated:", territoriesVisible);
  }, [territoriesVisible]);
  
  // Add a transition progress indicator
  const [transitionProgress, setTransitionProgress] = useState(null);
  
  // Track transition state
  useEffect(() => {
    // If we receive a new viewState with a transition duration, track progress
    if (externalViewState?.transitionDuration) {
      // Start transition progress tracking
      setTransitionProgress(0);
      
      const duration = externalViewState.transitionDuration;
      const startTime = Date.now();
      
      // Update progress at regular intervals
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Apply easing to the progress for a more accurate visual representation
        let visualProgress = progress;
        if (externalViewState.transitionEasing && typeof externalViewState.transitionEasing === 'function') {
          try {
            visualProgress = externalViewState.transitionEasing(progress);
          } catch (e) {
            // Fall back to linear if there's an error
            console.log("Error with easing function:", e);
          }
        }
        
        setTransitionProgress(visualProgress);
        
        // Clear interval when done
        if (progress >= 1) {
          // Add a small delay before hiding the progress bar
          setTimeout(() => {
            setTransitionProgress(null);
          }, 500);
          clearInterval(intervalId);
        }
      }, 50); // Update more frequently for smoother progress bar
      
      return () => clearInterval(intervalId);
    }
  }, [externalViewState]);
  
  // Force redraw when transition progress changes
  useEffect(() => {
    if (mapInstance && transitionProgress !== null) {
      mapInstance.triggerRepaint();
    }
  }, [mapInstance, transitionProgress]);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'white', padding: '5px' }}>
        Indigenous Territory Map - Navajo Nation
      </div>
      
      {/* Small info text about capturing position */}
      <div style={{ 
        position: 'absolute', 
        bottom: 30, 
        right: 10, 
        zIndex: 10, 
        background: 'rgba(255,255,255,0.7)', 
        padding: '5px', 
        fontSize: '12px',
        borderRadius: '4px'
      }}>
        Press C to capture camera position
      </div>
      
      {/* Transition progress indicator */}
      {transitionProgress !== null && (
        <div style={{
          position: 'absolute',
          bottom: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 16px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '100px',
            height: '5px',
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${transitionProgress * 100}%`,
              background: 'white',
              transition: 'width 0.1s ease'
            }} />
          </div>
          <span>Loading view... {Math.round(transitionProgress * 100)}%</span>
        </div>
      )}
      
      <DeckGL
        initialViewState={initialViewState}
        viewState={effectiveViewState}
        onViewStateChange={({ viewState }) => {
          // Only log significant changes to reduce console spam
          if (Math.abs(viewState.zoom - effectiveViewState.zoom) > 0.5 ||
              Math.abs(viewState.pitch - effectiveViewState.pitch) > 5 ||
              Math.abs(viewState.bearing - effectiveViewState.bearing) > 5) {
            console.log("DeckGL significant viewState change:", viewState);
          }
          
          // Create a new viewState object rather than modifying the original
          const updatedViewState = { ...viewState };
          
          // Keep the viewState close to target values if external viewState is provided
          if (externalViewState) {
            // Limit drift from target values - gentle constraints
            const zoomDiff = Math.abs(updatedViewState.zoom - externalViewState.zoom);
            if (zoomDiff > 2) {
              // If zoom drifts too far, nudge it back toward target
              updatedViewState.zoom = updatedViewState.zoom > externalViewState.zoom 
                ? externalViewState.zoom + 2 
                : externalViewState.zoom - 2;
            }
          }
          
          // We no longer hide territories based on zoom level
          // This is now controlled by the territory visibility checkboxes
          
          setInternalViewState(updatedViewState);
          if (onViewStateChange) {
            onViewStateChange({ viewState: updatedViewState });
          }
        }}
        controller={{
          doubleClickZoom: false, // Disable default double-click zoom
          // If viewState has specific zoom values, use them as constraints
          minZoom: externalViewState?.zoom ? Math.max(2, externalViewState.zoom - 2) : 2,
          maxZoom: externalViewState?.zoom ? Math.min(20, externalViewState.zoom + 2) : 20,
          minPitch: externalViewState?.pitch ? Math.max(0, externalViewState.pitch - 5) : 0,
          maxPitch: externalViewState?.pitch ? Math.min(85, externalViewState.pitch + 5) : 85,
          keyboard: true, // Enable keyboard controls
          inertia: true, // Enable inertia for smoother transitions
          dragPan: true, // Allow panning
          dragRotate: true, // Allow rotation
          scrollZoom: true // Allow zoom with scroll
        }}
        layers={layers}
        onError={(e) => console.error("DeckGL error:", e)}
      >
        <Map 
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={customMapStyle}
          onLoad={(event) => {
            console.log('Map loaded successfully');
            setMapLoaded(true);
            setMapInstance(event.target);
          }}
        />
        {mapLoaded && children}
      </DeckGL>
    </div>
  );
}