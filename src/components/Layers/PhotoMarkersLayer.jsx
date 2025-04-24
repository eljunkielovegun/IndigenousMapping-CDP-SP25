// src/components/Layers/PhotoMarkersLayer.jsx
import { IconLayer, TextLayer, LineLayer } from '@deck.gl/layers';
import { CompositeLayer } from '@deck.gl/core';
import { getAllPhotos } from '../../data/historicalPhotoData';
import { forceSimulation, forceCollide, forceManyBody, forceCenter, forceRadial } from 'd3-force';

// Custom CompositeLayer for markers with outlines
class PhotoMarkersCompositeLayer extends CompositeLayer {
  // Initialize state for label positions
  initializeState() {
    super.initializeState();
    this.state = {
      labelPositions: [],
      labelLines: [],
      hoveredMarkerId: null,
      clickedMarkerId: null
    };
  }
  
  // Update the label positions using force simulation
  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    
    // Check if we need to recalculate label positions
    const needsUpdate = 
      changeFlags.dataChanged || 
      changeFlags.viewportChanged ||
      props.selectedPhotoId !== oldProps.selectedPhotoId ||
      !this.state.labelLines || 
      this.state.labelLines.length === 0;
    
    // Recalculate positions if needed
    if (needsUpdate) {
      const { data } = props;
      this.calculateLabelPositions(data);
    }
  }
  
  // Place labels outside native territory boundaries
  calculateLabelPositions(data) {
    // Skip if no data
    if (!data || data.length === 0) return;
    
    // Define territory polygon boundaries
    // Coordinates from useMapboxStyle.js
    const territoryPolygons = {
      navajo: [
        [-111.12, 37.00], // Northern border
        [-111.12, 35.70], // Western edge
        [-110.86, 35.57], // Southwest 
        [-110.35, 35.23], // South boundary
        [-109.90, 35.17], // Southeast corner
        [-109.05, 35.63], // East boundary
        [-109.05, 37.00], // Northeast corner
        [-111.12, 37.00]  // Close polygon
      ],
      hopi: [
        [-110.66, 36.15], // Northwest corner
        [-110.63, 35.79], // Southwest
        [-110.01, 35.82], // Southeast  
        [-110.06, 36.17], // Northeast
        [-110.66, 36.15]  // Close polygon
      ]
    };
    
    // Define bounding boxes for simpler containment checks
    const boundingBoxes = {
      navajo: {
        minLon: -111.12, maxLon: -109.05,
        minLat: 35.17, maxLat: 37.00
      },
      hopi: {
        minLon: -110.66, maxLon: -110.01,
        minLat: 35.79, maxLat: 36.17
      }
    };
    
    // Define a center exclusion zone to prevent labels in the center
    // Calculate center based on navajo territory (approximate viewport center)
    const centerLon = (boundingBoxes.navajo.minLon + boundingBoxes.navajo.maxLon) / 2;
    const centerLat = (boundingBoxes.navajo.minLat + boundingBoxes.navajo.maxLat) / 2;
    
    // Exclusion zone radius (adjusted based on territory size)
    const lonSpan = boundingBoxes.navajo.maxLon - boundingBoxes.navajo.minLon;
    const latSpan = boundingBoxes.navajo.maxLat - boundingBoxes.navajo.minLat;
    const CENTER_EXCLUSION_RADIUS = Math.min(lonSpan, latSpan) * 0.35; // 35% of the smaller dimension
    
    // Center exclusion bounding box for quick checks
    const centerExclusionBox = {
      minLon: centerLon - CENTER_EXCLUSION_RADIUS,
      maxLon: centerLon + CENTER_EXCLUSION_RADIUS,
      minLat: centerLat - CENTER_EXCLUSION_RADIUS,
      maxLat: centerLat + CENTER_EXCLUSION_RADIUS
    };
    
    // Center exclusion zone defined for territory-aware label placement
    
    // Helper function to check if a point is inside a bounding box
    const isInBoundingBox = (point, bbox) => {
      return (
        point[0] >= bbox.minLon && point[0] <= bbox.maxLon &&
        point[1] >= bbox.minLat && point[1] <= bbox.maxLat
      );
    };
    
    // Function to get distance to nearest edge of a territory
    const getDistanceToEdge = (point, territory) => {
      // Simplified approach: measure distance to each edge of bounding box
      const bbox = boundingBoxes[territory];
      
      // If point is outside bounding box, return 0 (already outside)
      if (!isInBoundingBox(point, bbox)) {
        return 0;
      }
      
      // Calculate distance to each edge of the bounding box
      const distToWest = point[0] - bbox.minLon;
      const distToEast = bbox.maxLon - point[0];
      const distToSouth = point[1] - bbox.minLat;
      const distToNorth = bbox.maxLat - point[1];
      
      // Return minimum distance to any edge
      return Math.min(distToWest, distToEast, distToSouth, distToNorth);
    };
    
    // Function to check if a point is in the center exclusion zone
    const isInCenterExclusion = (point) => {
      // First quick check with bounding box
      if (!isInBoundingBox(point, centerExclusionBox)) {
        return false;
      }
      
      // More precise check with actual distance to center
      const dx = point[0] - centerLon;
      const dy = point[1] - centerLat;
      const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
      
      return distanceToCenter < CENTER_EXCLUSION_RADIUS;
    };
    
    // Function to get distance from center (for pushing labels out of center)
    const getDistanceFromCenter = (point) => {
      const dx = point[0] - centerLon;
      const dy = point[1] - centerLat;
      const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
      
      // If already outside exclusion zone, return 0
      if (distanceToCenter >= CENTER_EXCLUSION_RADIUS) {
        return 0;
      }
      
      // Otherwise, return distance needed to reach edge
      return CENTER_EXCLUSION_RADIUS - distanceToCenter;
    };
    
    // No longer using map coordinates for labels - we'll render them in a separate HTML container
    // This function now just provides the sorted data for rendering elsewhere
    const createSortedLabelData = (data) => {
      if (!data || data.length === 0) return [];
      
      // Sort data by marker latitude (north to south)
      const sortedData = [...data].sort((a, b) => 
        // Reverse sort - higher latitude (north) at the top
        b.coordinates.latitude - a.coordinates.latitude
      );
      
      // Sort by latitude for consistent ordering
      
      return sortedData.map((d, i) => {
        return {
          id: d.id,
          index: i,
          // Still include marker position for potential hover highlighting
          markerPosition: [d.coordinates.longitude, d.coordinates.latitude],
          label: d.name,
          photographer: d.photographer,
          originalIndex: data.indexOf(d), // Keep track of original order
          useExternalRendering: true // Flag to indicate this should be rendered in HTML
        };
      });
    };
    
    // Get sorted label data for external rendering
    const labelData = createSortedLabelData(data);
    // We'll store this data, but won't use deck.gl's text layer to render it
    const labelPositions = [];
    
    // Calculate line connections for the markers
    // Note: Line generation is now handled directly in App.jsx
    
    // Store the sorted label data for use in external HTML rendering
    this._sortedLabelData = labelData;
    
    // Save to state
    this.setState({
      labelPositions,
      labelLines: [],
      sortedLabelData: labelData // Add sorted label data for external rendering
    });
  }
  
  // Handle click events at the CompositeLayer level
  onClick(info) {
    // Safety check for info
    if (!info || !info.object) return false;
    
    const { onPhotoSelect } = this.props;
    
    // Check if we have a callback
    if (onPhotoSelect) {
      // Visual feedback - quick flash
      document.body.style.backgroundColor = 'rgba(255,255,0,0.1)';
      setTimeout(() => document.body.style.backgroundColor = '', 100);
      
      // Handle both marker clicks and label clicks
      let id = null;
      
      if (info.object.id) {
        // Direct click on a marker
        id = info.object.id;
        
        // Set this ID as clicked for animation
        this.setState({ 
          hoveredMarkerId: id,  // Use the hover state for animation
          clickedMarkerId: id   // Track it separately for potential future use
        }, () => {
          // Force update to trigger animation immediately
          this.setNeedsUpdate();
          // Reset after animation
          setTimeout(() => {
            // Only reset if this is still the active marker
            if (this.state.clickedMarkerId === id) {
              this.setState({ 
                clickedMarkerId: null,
                // Don't reset hoveredMarkerId if we're still hovering
              }, () => this.setNeedsUpdate());
            }
          }, 500); // Match animation duration
        });
      } else if (info.layer && info.layer.id === 'marker-labels' && this.state.labelPositions) {
        // Click on a label - find the corresponding marker
        const index = info.index;
        if (index !== undefined && this.state.labelPositions[index]) {
          id = this.state.labelPositions[index].id;
        }
      }
      
      if (id) {
        onPhotoSelect(id);
        return true; // Indicate that the event was handled
      }
    }
    
    return false;
  }

  // Handle tap events at the CompositeLayer level (for touch devices)
  onTap(info) {
    // Safety check for info
    if (!info || !info.object) return false;
    
    const { onPhotoSelect } = this.props;
    
    // Check if we have a callback
    if (onPhotoSelect) {
      // Flash the document body briefly to show tap registered
      document.body.style.backgroundColor = 'rgba(0,255,255,0.1)';
      setTimeout(() => document.body.style.backgroundColor = '', 100);
      
      // Handle both marker taps and label taps
      let id = null;
      
      if (info.object.id) {
        // Direct tap on a marker
        id = info.object.id;
        
        // Set this ID as tapped for animation
        this.setState({ 
          hoveredMarkerId: id,  // Use the hover state for animation
          clickedMarkerId: id   // Track it separately for potential future use
        }, () => {
          // Force update to trigger animation immediately
          this.setNeedsUpdate();
          // Reset after animation
          setTimeout(() => {
            // Only reset if this is still the active marker
            if (this.state.clickedMarkerId === id) {
              this.setState({ 
                clickedMarkerId: null,
                hoveredMarkerId: null // Clear hover state too on tap
              }, () => this.setNeedsUpdate());
            }
          }, 500); // Match animation duration
        });
      } else if (info.layer && info.layer.id === 'marker-labels' && this.state.labelPositions) {
        // Tap on a label - find the corresponding marker
        const index = info.index;
        if (index !== undefined && this.state.labelPositions[index]) {
          id = this.state.labelPositions[index].id;
        }
      }
      
      if (id) {
        onPhotoSelect(id);
        return true; // Indicate that the event was handled
      }
    }
    
    return false;
  }

  // Handle hover events at the CompositeLayer level
  onHover(info) {
    // Add safety check to make sure target is available
    if (!info || !info.target || !info.target.getCanvas) {
      return;
    }
    
    const currentHoverId = this.state.hoveredMarkerId;
    let newHoverId = null;
    
    if (info.object) {
      // Show pointer cursor for both markers and labels
      info.target.getCanvas().style.cursor = 'pointer';
      
      // Get the hovered marker ID
      newHoverId = info.object.id;
    } else {
      info.target.getCanvas().style.cursor = 'grab';
    }
    
    // Only update state if the hover state actually changed
    if (currentHoverId !== newHoverId) {
      this.setState({ hoveredMarkerId: newHoverId }, () => {
        // Force a re-render to trigger the animation
        this.setNeedsUpdate();
        
        // Marker hover state will trigger rotation animation
      });
    }
  }

  renderLayers() {
    const { data, iconAtlas, iconMapping, sizeScale, selectedPhotoId, onLabelDataUpdate, zoomLevel } = this.props;
    const { labelPositions, labelLines, sortedLabelData } = this.state;
    
    // If we have label data and a callback, provide the sorted label data for external rendering
    if (sortedLabelData && sortedLabelData.length > 0 && onLabelDataUpdate) {
      onLabelDataUpdate(sortedLabelData);
    }

    // White outline layer
    const outlineLayer = new IconLayer(this.getSubLayerProps({
      id: 'marker-outlines',
      data,
      iconAtlas,
      iconMapping,
      getIcon: d => 'marker',
      getPosition: d => [d.coordinates.longitude, d.coordinates.latitude],
      getSize: d => selectedPhotoId === d.id ? 4 : 3, // Smaller size
      getColor: [255, 255, 255], // White outline
      sizeScale: 10,             // Smaller scale
      sizeUnits: 'pixels',
      sizeMinPixels: 40,         // Smaller minimum size
      sizeMaxPixels: 80,         // Smaller maximum size
      billboard: true,
      pickable: true,
      parameters: {
        depthTest: false
      }
    }));
    
    // Main marker layer
    const iconLayer = new IconLayer(this.getSubLayerProps({
      id: 'marker-icons',
      data: data.map(d => ({
        ...d,
        // Add animation state directly to data objects
        _isSelected: selectedPhotoId === d.id,
        _isHovered: this.state.hoveredMarkerId === d.id,
        // Add connector line endpoints
        _startPosition: [d.coordinates.longitude, d.coordinates.latitude], 
        _endPosition: [d.coordinates.longitude + 2.0, d.coordinates.latitude]  // End 2 degrees to the right
      })),
      iconAtlas,
      iconMapping,
      getIcon: d => 'marker',
      getPosition: d => [d.coordinates.longitude, d.coordinates.latitude],
      getSize: d => d._isSelected ? 3.5 : 2.5, // Smaller size
      getColor: d => {
        if (d.photographer === "landmark") return [255, 255, 0]; // Yellow for landmark photographer
        if (d.photographer === "Jackson") return [255, 87, 51]; // Red for Jackson
        if (d.photographer === "Hillers") return [75, 144, 226]; // Blue for Hillers
        return [148, 0, 211]; // Purple for all others
      },
      sizeScale: 10,             // Smaller scale
      sizeUnits: 'pixels',
      sizeMinPixels: 35,         // Smaller minimum size
      sizeMaxPixels: 70,         // Smaller maximum size
      billboard: true,
      pickable: true,
      parameters: {
        depthTest: false // Make sure markers are always drawn on top
      },
      // Enable connector lines between icons or icon-to-position
      drawConnector: d => this.props.showLabelConnectors && (selectedPhotoId === d.id || this.state.hoveredMarkerId === d.id || this.state.clickedMarkerId === d.id),  // Only draw connector for active photo if connectors are enabled
      getConnectorSourcePosition: d => d._startPosition,
      getConnectorTargetPosition: d => d._endPosition,
      connectorProps: {
        dashEnabled: true,
        dashGapLength: 2,
        dashLength: 2, 
        type: 'circle',
        stroke: '#fff',
        strokeWidth: 1,
        targetColor: d => d.photographer === "Jackson" ? [255, 87, 51, 200] : [75, 144, 226, 200],
        sourceColor: d => d.photographer === "Jackson" ? [255, 87, 51, 200] : [75, 144, 226, 200]
      },
      getTooltip: ({object}) => object && 
        `${object.name} (${object.year || 'unknown'})\nPhotographer: ${object.photographer}`,
      getAngle: d => {
        // Trigger rotation if marker is selected, hovered, or clicked
        const isActive = d._isSelected || 
                         d._isHovered || 
                         this.state.clickedMarkerId === d.id;
        
        return isActive ? 360 : 0;
      },
      onClick: this.onClick.bind(this),
      onTap: this.onTap.bind(this),  // Explicitly enable tap events for mobile
      onHover: this.onHover.bind(this)
    }));
    
    // Label text layer - only show when zoom level is high enough
    // When zoom >= 12, place labels directly next to markers
    let textLayer = null;
    if (zoomLevel >= 7.5) {
      textLayer = new TextLayer(this.getSubLayerProps({
        id: 'marker-text-labels',
        data,
        pickable: true,
        // Adjust position based on zoom level - closer to marker when highly zoomed in
        getPosition: d => {
          // At high zoom (≥12), place labels right next to markers
          if (zoomLevel >= 12) {
            return [d.coordinates.longitude, d.coordinates.latitude];
          }
          // At medium zoom, place labels with a small offset
          return [d.coordinates.longitude + 0.03, d.coordinates.latitude];
        },
        getText: d => d.name,
        getSize: 12,
        getAngle: 0,
        getTextAnchor: 'start',
        getAlignmentBaseline: 'center',
        // Adjust pixel offset based on zoom level
        getPixelOffset: d => zoomLevel >= 12 ? [45, 0] : [25, 0], // 10px offset when zoomed in
        getColor: d => {
          if (d.photographer === "landmark") return [255, 255, 150, 255]; // Yellow tint for landmark
          if (d.photographer === "Jackson") return [255, 155, 132, 255]; // Red tint for Jackson
          if (d.photographer === "Hillers") return [132, 190, 255, 255]; // Blue tint for Hillers
          return [200, 150, 230, 255]; // Purple tint for others
        },
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontWeight: 'bold',
        background: true,
        getBorderColor: [0, 0, 0, 200],
        getBorderWidth: 3,
        backgroundPadding: [3, 3, 3, 3],
        getBackgroundColor: [0, 0, 0, 180], // Semi-transparent black background
        wordBreak: 'break-word',
        billboard: true,
        maxWidth: 200,
        parameters: {
          depthTest: false
        },
        onClick: this.onClick.bind(this),
        onHover: this.onHover.bind(this)
      }));
    }
    
    // Connector lines now handled directly by IconLayer
    
    // Return all layers
    return textLayer ? [outlineLayer, iconLayer, textLayer] : [outlineLayer, iconLayer];
  }
}

// Filter data to include only photos with valid coordinates
function filterValidPhotos(photos) {
  return photos.filter(photo => {
    if (!photo.coordinates) {
      return false;
    }
    
    const { longitude, latitude } = photo.coordinates;
    
    // Check for null or invalid values
    if (longitude == null || latitude == null || 
        longitude === "null" || latitude === "null" ||
        isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))) {
      return false;
    }
    
    // Additional check for reasonable coordinate ranges
    if (Math.abs(longitude) > 180 || Math.abs(latitude) > 90) {
      return false;
    }
    
    // If we reach here, the coordinates are valid
    return true;
  });
}

// Note: Line generation has been moved to App.jsx for simpler implementation

export default function createPhotoMarkersLayer({ 
  onPhotoSelect = () => {}, 
  selectedPhotoId = null,
  onLabelDataUpdate = null, // Callback for external label rendering
  showLabelConnectors = true, // Whether to show connector lines
  showLabels = false, // Whether to show labels
  zoomLevel = 0, // Current zoom level
  filterPhotographer = null // Filter photos by photographer
} = {})  {
  
  // Get all photos and filter to only those with valid coordinates
  const allPhotos = getAllPhotos();
  let validPhotos = filterValidPhotos(allPhotos);
  
  // Apply photographer filter if specified
  if (filterPhotographer) {
    validPhotos = validPhotos.filter(photo => photo.photographer === filterPhotographer);
  }
  
  // Fix up the valid photos with necessary camera data if missing
  validPhotos.forEach(photo => {
    if (!photo.camera || !photo.camera.viewpoint) {
      // Add default camera data if missing
      photo.camera = photo.camera || {};
      photo.camera.viewpoint = photo.camera.viewpoint || {
        longitude: photo.coordinates.longitude,
        latitude: photo.coordinates.latitude,
        elevation: 1000
      };
      photo.camera.bearing = photo.camera.bearing || 0;
      photo.camera.pitch = photo.camera.pitch || 60;
      photo.camera.zoom = photo.camera.zoom || 14; // Slightly closer zoom by default
      photo.camera.fov = photo.camera.fov || 60;
    }
  });
  
  return new PhotoMarkersCompositeLayer({
    id: 'photo-markers-composite',
    data: validPhotos,
    // Using the mapbox hosted icon atlas for simplicity and consistency
    iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping: {
      marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
    },
    sizeScale: 10, // Smaller scale for less visual dominance
    sizeUnits: 'pixels',
    selectedPhotoId,
    onPhotoSelect,
    onLabelDataUpdate, // Pass the callback for external label rendering
    showLabelConnectors, // Pass through the connector visibility setting
    showLabels, // Pass through whether to show labels
    zoomLevel, // Pass the current zoom level
    pickable: true, // This is critical for click/touch events to work
    autoHighlight: true, // Visual feedback on hover
    parameters: {
      depthTest: false // Ensure markers are shown on top of terrain
    },
    // Improved highlighting for better user feedback
    highlightColor: [255, 255, 255, 150],
    transitions: {
      getSize: 200, // Smooth size transition when marker is selected (200ms)
      getColor: 200, // Smooth color transition when hovering
      getAngle: {
        duration: 500, // Half second for full rotation (faster)
        easing: t => t // Linear easing
      }
    },
    // Explicitly enable touch events
    onClick: true,
    onTap: true
  });
}