// src/components/Layers/PhotoMarkersLayer.jsx
import { IconLayer, TextLayer } from '@deck.gl/layers';
import { CompositeLayer } from '@deck.gl/core';
import { getAllPhotos } from '../../data/historicalPhotoData';

// Custom CompositeLayer for markers with outlines
class PhotoMarkersCompositeLayer extends CompositeLayer {
  // Handle click events at the CompositeLayer level
  onClick(info) {
    // Safety check for info
    if (!info) return false;
    
    const { onPhotoSelect } = this.props;
    
    // Check if we have an object and callback
    if (info.object && onPhotoSelect) {
      // Visual feedback - quick flash
      document.body.style.backgroundColor = 'rgba(255,255,0,0.1)';
      setTimeout(() => document.body.style.backgroundColor = '', 100);
      
      onPhotoSelect(info.object.id);
      return true; // Indicate that the event was handled
    }
    
    return false;
  }

  // Handle tap events at the CompositeLayer level (for touch devices)
  onTap(info) {
    // Safety check for info
    if (!info) return false;
    
    const { onPhotoSelect } = this.props;
    
    // Check if we have an object and callback
    if (info.object && onPhotoSelect) {
      // Flash the document body briefly to show tap registered
      document.body.style.backgroundColor = 'rgba(0,255,255,0.1)';
      setTimeout(() => document.body.style.backgroundColor = '', 100);
      
      onPhotoSelect(info.object.id);
      return true; // Indicate that the event was handled
    }
    
    return false;
  }

  // Handle hover events at the CompositeLayer level
  onHover(info) {
    // Add safety check to make sure target is available
    if (!info || !info.target || !info.target.getCanvas) {
      return;
    }
    
    if (info.object) {
      info.target.getCanvas().style.cursor = 'pointer';
    } else {
      info.target.getCanvas().style.cursor = 'grab';
    }
  }

  renderLayers() {
    const { data, iconAtlas, iconMapping, sizeScale, selectedPhotoId } = this.props;

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
      data,
      iconAtlas,
      iconMapping,
      getIcon: d => 'marker',
      getPosition: d => [d.coordinates.longitude, d.coordinates.latitude],
      getSize: d => selectedPhotoId === d.id ? 3.5 : 2.5, // Smaller size
      getColor: d => d.photographer === "Jackson" ? [255, 87, 51] : [75, 144, 226],
      sizeScale: 10,             // Smaller scale
      sizeUnits: 'pixels',
      sizeMinPixels: 35,         // Smaller minimum size
      sizeMaxPixels: 70,         // Smaller maximum size
      billboard: true,
      pickable: true,
      parameters: {
        depthTest: false // Make sure markers are always drawn on top
      },
      getTooltip: ({object}) => object && 
        `${object.name} (${object.year || 'unknown'})\nPhotographer: ${object.photographer}`
    }));
    
    // Label layer for photo markers
    const textLayer = new TextLayer(this.getSubLayerProps({
      id: 'marker-labels',
      data,
      getPosition: d => [d.coordinates.longitude, d.coordinates.latitude],
      getText: d => d.name,
      getSize: 10, // Small text size
      getColor: [255, 255, 255, 230], // White text with slight transparency
      getBackgroundColor: [0, 0, 0, 160], // Semi-transparent black background
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontWeight: 'normal',
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: [0, 18], // Position below the marker
      backgroundPadding: [2, 1], // Small padding around text
      billboard: true,
      pickable: false, // Not clickable
      parameters: {
        depthTest: false // Always on top
      }
    }));

    return [outlineLayer, iconLayer, textLayer];
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

export default function createPhotoMarkersLayer({ onPhotoSelect = () => {}, selectedPhotoId = null } = {})  {
  
  // Get all photos and filter to only those with valid coordinates
  const allPhotos = getAllPhotos();
  const validPhotos = filterValidPhotos(allPhotos);
  
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
    pickable: true, // This is critical for click/touch events to work
    autoHighlight: true, // Visual feedback on hover
    parameters: {
      depthTest: false // Ensure markers are shown on top of terrain
    },
    // Improved highlighting for better user feedback
    highlightColor: [255, 255, 255, 150],
    transitions: {
      getSize: 200, // Smooth size transition when marker is selected (200ms)
      getColor: 200 // Smooth color transition when hovering
    }
  });
}