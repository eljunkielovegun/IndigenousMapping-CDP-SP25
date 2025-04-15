// PhotoOverlayLayer.jsx
import { BitmapLayer } from '@deck.gl/layers';
import { load } from '@loaders.gl/core';
import { ImageLoader } from '@loaders.gl/images';

/**
 * Creates a bitmap layer for overlaying historical photos on the map
 * 
 * @param {Object} photoData - Metadata about the historical photo including position and bounds
 * @param {number} opacity - Transparency level (0-1)
 * @returns {Promise<BitmapLayer|null>} A promise that resolves to a BitmapLayer or null if loading fails
 */
export async function createPhotoOverlayLayer(photoData, opacity = 0.5) {
  if (!photoData || !photoData.image_url || !photoData.overlay.bounds) {
    console.error('Invalid photo data provided', photoData);
    return null;
  }

  try {
    // Load the image asynchronously
    const image = await load(photoData.image_url, ImageLoader);
    
    // Create and return the bitmap layer
    return new BitmapLayer({
      id: `photo-overlay-${photoData.id}`,
      image,
      bounds: photoData.overlay.bounds,
      opacity: opacity
    });
  } catch (error) {
    console.error('Failed to load historical photo:', error);
    return null;
  }
}

/**
 * Creates a bitmap layer synchronously with a placeholder until the image loads
 * 
 * @param {Object} photoData - Metadata about the historical photo
 * @param {number} opacity - Transparency level (0-1)
 * @param {Function} onImageLoaded - Callback when image is successfully loaded
 * @returns {BitmapLayer} A BitmapLayer instance
 */
export function createPhotoOverlayLayerSync(photoData, opacity = 0.5, onImageLoaded = null) {
  if (!photoData || !photoData.overlay.bounds) {
    console.error('Invalid photo data provided', photoData);
    return null;
  }
  
  // Create a simple solid color array as placeholder
  const placeholderData = new Uint8Array([255, 0, 0, 128]); // Red with 50% opacity
  
  // Convert bounds to proper format expected by BitmapLayer
  const bounds = [
    photoData.overlay.bounds[0][0], // left
    photoData.overlay.bounds[0][1], // bottom
    photoData.overlay.bounds[1][0], // right
    photoData.overlay.bounds[1][1]  // top
  ];
  
  console.log("Photo overlay bounds (flat):", bounds);
  
  // Get center point for positioning
  const centerLon = (bounds[0] + bounds[2]) / 2;
  const centerLat = (bounds[1] + bounds[3]) / 2;
  
  // Get photo aspect ratio and scale
  const desiredAspect = photoData.overlay.aspect || 1.5; // Default to 3:2 if not specified
  const scale = photoData.overlay.scale || 1.0;
  
  // Current width and height in degrees
  const width = Math.abs(bounds[2] - bounds[0]);
  const height = Math.abs(bounds[3] - bounds[1]);
  
  // Determine the limiting dimension based on aspect ratio
  let newWidth, newHeight;
  if (width / height > desiredAspect) {
    // Current shape is wider than desired, adjust width
    newWidth = height * desiredAspect;
    newHeight = height;
  } else {
    // Current shape is taller than desired, adjust height
    newWidth = width;
    newHeight = width / desiredAspect;
  }
  
  // Apply scale
  newWidth *= scale;
  newHeight *= scale;
  
  // Create adjusted bounds with proper aspect ratio
  const adjustedBounds = [
    centerLon - newWidth/2,  // left
    centerLat - newHeight/2, // bottom
    centerLon + newWidth/2,  // right
    centerLat + newHeight/2  // top
  ];
  
  console.log("Original bounds:", bounds);
  console.log("Adjusted bounds:", adjustedBounds);
  
  // Load and prepare the image first (synchronously)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  // This is important - set the src and force the browser to start loading
  img.src = photoData.image_url;
  
  // Create the bitmap layer with the image that's loading
  // The image doesn't need to be fully loaded for the layer to be created
  // DeckGL will handle the loading and display once the image is ready
  const bitmapLayer = new BitmapLayer({
    id: `photo-overlay-${photoData.id}`,
    bounds: adjustedBounds,
    image: img,
    opacity: opacity
  });
  
  // Log for debugging
  console.log(`Created bitmap layer for ${photoData.id}, image loading from ${photoData.image_url}`);
  
  return bitmapLayer;
}