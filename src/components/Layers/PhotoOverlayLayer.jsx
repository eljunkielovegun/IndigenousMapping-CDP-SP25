// PhotoOverlayLayer.jsx
import { BitmapLayer } from '@deck.gl/layers';
import { load } from '@loaders.gl/core';
import { ImageLoader } from '@loaders.gl/images';
import { Matrix4 } from '@math.gl/core';
import { getAssetPath } from '../../utils/assetUtils';

/**
 * Creates a bitmap layer for overlaying historical photos on the map
 * 
 * @param {Object} photoData - Metadata about the historical photo including position and bounds
 * @param {number} opacity - Transparency level (0-1)
 * @returns {Promise<BitmapLayer|null>} A promise that resolves to a BitmapLayer or null if loading fails
 */
export async function createPhotoOverlayLayer(photoData, opacity = 0.5) {
  if (!photoData || !photoData.overlay.bounds) {
    console.error('Invalid photo data provided', photoData);
    return null;
  }
  
  // Check if there's a valid image URL
  if (!photoData.image_url || photoData.image_url === "null") {
    console.warn(`No valid image URL for photo ${photoData.id}`);
    return null;
  }

  try {
    // Process the image URL to handle relative paths
    const imgUrl = photoData.image_url.startsWith('http') 
      ? photoData.image_url 
      : getAssetPath(photoData.image_url.replace(/^\//, ''));
    
    // Load the image asynchronously
    const image = await load(imgUrl, ImageLoader);
    
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
  
  // Check if there's a valid image URL
  if (!photoData.image_url || photoData.image_url === "null") {
    console.warn(`No valid image URL for photo ${photoData.id}`);
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
  
  // Apply custom offsets if provided (in degrees)
  const pixelToDegree = 0.0001; // Rough approximation
  const offsetX = photoData.overlay.customOffsetX ? photoData.overlay.customOffsetX * pixelToDegree : 0;
  const offsetY = photoData.overlay.customOffsetY ? photoData.overlay.customOffsetY * pixelToDegree : 0;
  
  // Apply offset to all bounds coordinates
  const offsetBounds = [
    bounds[0] + offsetX,
    bounds[1] + offsetY,
    bounds[2] + offsetX,
    bounds[3] + offsetY
  ];
  
  // Get center point for positioning (with offsets applied)
  const centerLon = (offsetBounds[0] + offsetBounds[2]) / 2;
  const centerLat = (offsetBounds[1] + offsetBounds[3]) / 2;
  
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
  
  // Get camera angles for 3D rotation
  const bearing = photoData.camera?.bearing || 0;
  const pitch = photoData.camera?.pitch || 0;
  const roll = photoData.overlay?.customRotationY || 0;
  
  // Create adjusted bounds with proper aspect ratio
  // Note: These bounds don't include rotation - that will be handled with layer transform
  const adjustedBounds = [
    centerLon - newWidth/2,  // left
    centerLat - newHeight/2, // bottom
    centerLon + newWidth/2,  // right
    centerLat + newHeight/2  // top
  ];
  
  // Load and prepare the image first (synchronously)
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  // This is important - set the src and force the browser to start loading
  // Make sure to handle relative paths correctly with assetUtils
  const imgUrl = photoData.image_url.startsWith('http') 
    ? photoData.image_url 
    : getAssetPath(photoData.image_url.replace(/^\//, ''));
  
  img.src = imgUrl;
  
  // Debug image loading - only log on error
  img.onload = () => {};
  
  img.onerror = (err) => {
    console.error(`❌ Failed to load image for ${photoData.id}:`, err);
  };

  // Create the bitmap layer with rotation to stand upright
  // Create a transformation matrix to make the image stand upright
  let modelMatrix = null;
  
  // Always create a model matrix for standing upright
  try {
    // Create matrix and translate to center for rotation operations
    modelMatrix = new Matrix4();
    modelMatrix.translate([centerLon, centerLat, 0]);
    
    // CRITICAL: Apply a 90-degree X rotation to make it stand upright (facing the camera)
    // This converts from "lying flat" to "standing upright"
    modelMatrix.rotateX(Math.PI/2);
    
    // Order of rotations is important:
    // 1. First apply Z rotation (bearing/yaw) - changes which direction it faces
    // 2. Then apply Y rotation (roll) - tilts it side to side
    // 3. Then apply any additional X rotation (pitch) - tilts it forward/backward
    
    // Apply bearing (yaw) first - rotates around vertical axis
    if (bearing !== 0) modelMatrix.rotateZ(bearing * Math.PI / 180);
    
    // Apply roll (side tilt) second
    if (roll !== 0) modelMatrix.rotateY(roll * Math.PI / 180);
    
    // Apply any additional pitch adjustment third (on top of the 90° base rotation)
    // This can tilt the photo to face slightly up or down
    if (pitch !== 0) modelMatrix.rotateX(pitch * Math.PI / 180);
    
    // Translate back to original position
    modelMatrix.translate([-centerLon, -centerLat, 0]);
    
    // Matrix created successfully
  } catch (err) {
    console.error("Failed to create model matrix:", err);
  }
  
  const bitmapLayer = new BitmapLayer({
    id: `photo-overlay-${photoData.id}`,
    bounds: adjustedBounds,
    image: imgUrl, // Use the processed URL from above
    opacity: opacity,
    modelMatrix: modelMatrix, // Apply the upright transformation
    parameters: {
      depthTest: false // Ensure photo renders on top of terrain
    }
  });
  
  return bitmapLayer;
}

/**
 * Creates a 4x4 transformation matrix for rotating an overlay in 3D space
 * 
 * @param {number} centerLon - Longitude of the center point 
 * @param {number} centerLat - Latitude of the center point
 * @param {number} bearingDegrees - Yaw (Z-axis rotation) in degrees
 * @param {number} pitchDegrees - Pitch (X-axis rotation) in degrees
 * @param {number} rollDegrees - Roll (Y-axis rotation) in degrees
 * @returns {number[]} 4x4 transformation matrix in column-major order for WebGL
 */
function get3DRotationMatrix(centerLon, centerLat, bearingDegrees, pitchDegrees, rollDegrees) {
  // Convert angles to radians
  const bearingRad = (bearingDegrees * Math.PI) / 180;
  const pitchRad = (pitchDegrees * Math.PI) / 180;
  const rollRad = (rollDegrees * Math.PI) / 180;
  
  // Calculate trigonometric values for all three angles
  const cosBearing = Math.cos(bearingRad);
  const sinBearing = Math.sin(bearingRad);
  const cosPitch = Math.cos(pitchRad);
  const sinPitch = Math.sin(pitchRad);
  const cosRoll = Math.cos(rollRad);
  const sinRoll = Math.sin(rollRad);
  
  // Create a 3D rotation matrix that combines all three rotations
  // This uses the standard 3D rotation matrices for each axis,
  // combined in the order: Z (bearing) -> X (pitch) -> Y (roll)
  
  // Rotation around Z-axis (bearing/yaw)
  const rotZ = [
    cosBearing, sinBearing, 0, 0,
    -sinBearing, cosBearing, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
  
  // Rotation around X-axis (pitch)
  const rotX = [
    1, 0, 0, 0,
    0, cosPitch, sinPitch, 0,
    0, -sinPitch, cosPitch, 0,
    0, 0, 0, 1
  ];
  
  // Rotation around Y-axis (roll)
  const rotY = [
    cosRoll, 0, -sinRoll, 0,
    0, 1, 0, 0,
    sinRoll, 0, cosRoll, 0,
    0, 0, 0, 1
  ];
  
  // Helper function to multiply two 4x4 matrices
  function multiplyMatrices(a, b) {
    const result = new Array(16).fill(0);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        for (let i = 0; i < 4; i++) {
          result[col * 4 + row] += a[i * 4 + row] * b[col * 4 + i];
        }
      }
    }
    return result;
  }
  
  // Combine rotations: Z * X * Y (apply bearing, then pitch, then roll)
  let combinedRotation = multiplyMatrices(rotZ, rotX);
  combinedRotation = multiplyMatrices(combinedRotation, rotY);
  
  // Now add translation to rotate around the center point
  // For this simplified case, we'll just modify the translation components
  // More accurate implementations would use proper map projections
  combinedRotation[12] = centerLon * (1 - combinedRotation[0]) - centerLat * combinedRotation[1];
  combinedRotation[13] = centerLat * (1 - combinedRotation[5]) - centerLon * combinedRotation[4];
  
  return combinedRotation;
}

/**
 * Simple single-axis rotation matrix (legacy function)
 */
function getRotationMatrix(centerLon, centerLat, angleDegrees) {
  return get3DRotationMatrix(centerLon, centerLat, angleDegrees, 0, 0);
}