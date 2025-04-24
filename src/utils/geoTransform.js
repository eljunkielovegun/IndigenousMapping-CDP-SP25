/**
 * Utility functions for geographic coordinate transformations
 */

/**
 * Parses a coordinate string in various formats to extract latitude and longitude
 * Handles formats like:
 * - "41.2565°N, 95.9345°W"
 * - "44°58'34.79\"N, 110°42'03.37\"W"
 * - "btwn 33.37°N & 37°N, 94.26°W & 103°W" (takes the midpoint)
 * 
 * @param {string} coordString The coordinate string to parse
 * @returns {Object|null} Object with latitude and longitude in decimal degrees, or null if parsing fails
 */
export function parseCoordinates(coordString) {
  if (!coordString || typeof coordString !== 'string') {
    return null;
  }

  // Try to detect the format and extract coordinates
  try {
    // Format with decimal degrees and direction symbols: "41.2565°N, 95.9345°W"
    const decimalDegPattern = /([0-9.]+)°([NS]),\s*([0-9.]+)°([EW])/i;
    const decimalMatch = coordString.match(decimalDegPattern);
    
    if (decimalMatch) {
      let lat = parseFloat(decimalMatch[1]);
      let lon = parseFloat(decimalMatch[3]);
      
      // Adjust for direction
      if (decimalMatch[2].toUpperCase() === 'S') lat = -lat;
      if (decimalMatch[4].toUpperCase() === 'W') lon = -lon;
      
      return { latitude: lat, longitude: lon };
    }
    
    // Format with degrees, minutes, seconds: "44°58'34.79\"N, 110°42'03.37\"W"
    const dmsPattern = /([0-9]+)°([0-9]+)'([0-9.]+)"([NS]),\s*([0-9]+)°([0-9]+)'([0-9.]+)"([EW])/i;
    const dmsMatch = coordString.match(dmsPattern);
    
    if (dmsMatch) {
      // Convert DMS to decimal degrees
      let lat = parseFloat(dmsMatch[1]) + parseFloat(dmsMatch[2])/60 + parseFloat(dmsMatch[3])/3600;
      let lon = parseFloat(dmsMatch[5]) + parseFloat(dmsMatch[6])/60 + parseFloat(dmsMatch[7])/3600;
      
      // Adjust for direction
      if (dmsMatch[4].toUpperCase() === 'S') lat = -lat;
      if (dmsMatch[8].toUpperCase() === 'W') lon = -lon;
      
      return { latitude: lat, longitude: lon };
    }
    
    // Format with range: "btwn 33.37°N & 37°N, 94.26°W & 103°W"
    const rangePattern = /btwn\s+([0-9.]+)°([NS])\s*&\s*([0-9.]+)°([NS]),\s*([0-9.]+)°([EW])\s*&\s*([0-9.]+)°([EW])/i;
    const rangeMatch = coordString.match(rangePattern);
    
    if (rangeMatch) {
      // Extract the range values
      let lat1 = parseFloat(rangeMatch[1]);
      let lat2 = parseFloat(rangeMatch[3]);
      let lon1 = parseFloat(rangeMatch[5]);
      let lon2 = parseFloat(rangeMatch[7]);
      
      // Adjust for direction
      if (rangeMatch[2].toUpperCase() === 'S') lat1 = -lat1;
      if (rangeMatch[4].toUpperCase() === 'S') lat2 = -lat2;
      if (rangeMatch[6].toUpperCase() === 'W') lon1 = -lon1;
      if (rangeMatch[8].toUpperCase() === 'W') lon2 = -lon2;
      
      // Take the midpoint of the range
      const lat = (lat1 + lat2) / 2;
      const lon = (lon1 + lon2) / 2;
      
      return { latitude: lat, longitude: lon };
    }
    
    // Last resort: Try to extract any numbers that might be coordinates
    const numbersPattern = /(-?[0-9.]+)/g;
    const numbersMatch = coordString.match(numbersPattern);
    
    if (numbersMatch && numbersMatch.length >= 2) {
      // Assume first is lat, second is lon - might not always be correct but it's a fallback
      const lat = parseFloat(numbersMatch[0]);
      const lon = parseFloat(numbersMatch[1]);
      
      // Simple validation of extracted coordinates
      if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return { latitude: lat, longitude: lon };
      }
    }
    
    // Could not parse the coordinate string
    return null;
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return null;
  }
}

/**
 * Converts a latitude/longitude pair to Web Mercator coordinates
 * 
 * @param {number} lon Longitude in decimal degrees
 * @param {number} lat Latitude in decimal degrees
 * @returns {Array} [x, y] Web Mercator coordinates
 */
export function lonLatToWebMercator(lon, lat) {
  const x = lon * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return [x, y];
}

/**
 * Calculates the distance between two coordinates in kilometers
 * 
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}