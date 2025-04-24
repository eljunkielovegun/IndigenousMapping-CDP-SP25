import { LineLayer } from '@deck.gl/layers';
import { getPhotosByPhotographer, getPhotoById } from '../../data/historicalPhotoData';
import { getPhotographerSet } from '../../data/expeditionsData';
import { parseCoordinates } from '../../utils/geoTransform';

/**
 * Creates a route layer that connects expedition points in chronological order
 * using the existing marker positions from historicalPhotoData
 * 
 * @param {Object} props - Component props
 * @param {string} props.photographer - 'jackson' or 'hillers' to select which expedition to show
 * @param {boolean} props.visible - Whether the layer should be visible
 * @param {Object} props.style - Optional styling customizations
 * @returns {Object} A deck.gl LineLayer instance
 */
function createExpeditionRouteLayer({
  photographer = 'jackson',
  visible = true,
  style = {}
}) {
  // Default styles with ability to override
  const defaultStyle = {
    getWidth: 5, // Increased width
    getColor: photographer.toLowerCase() === 'jackson' 
      ? [255, 87, 51, 200] // Orange-red for Jackson with higher opacity
      : [75, 144, 226, 200], // Blue for Hillers with higher opacity
    widthUnits: 'pixels',
    ...style
  };

  // Map the photographer name to match historicalPhotoData
  const photoName = photographer.toLowerCase() === 'jackson' ? 'Jackson' : 'Hillers';

  // Get photographer data from historicalPhotoData - this contains the actual marker positions
  const photoMarkers = getPhotosByPhotographer(photoName);
  
  // Get expedition data from expeditionsData - this contains the chronological order
  const expeditionPoints = getPhotographerSet(photographer.toLowerCase());
  
  // Create a map of locations to photo markers for easy lookup
  const locationToMarkerMap = {};
  photoMarkers.forEach(marker => {
    // Create simplified location key from name
    const locationKey = marker.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    locationToMarkerMap[locationKey] = marker;
    
    // Also add the location without "pueblo" to improve matching
    const altKey = locationKey.replace('pueblo-', '');
    if (altKey !== locationKey) {
      locationToMarkerMap[altKey] = marker;
    }
  });
  
  // Process expedition points to ensure we have coordinates for all of them
  let processedPoints = [];
  
  // First, let's make sure all photo markers are included
  // Create a set to track which markers have been used
  const usedMarkerIds = new Set();
  
  // Process all expedition points to get coordinates
  expeditionPoints.forEach(point => {
    if (!point.location || point.location === "") return;
    
    // Create a processed point with coordinates
    const processedPoint = { ...point };
    
    // Try to find matching marker first for best accuracy
    let matchedMarker = null;
    let bestMatchScore = 0;
    
    // Try to find the best match among all markers
    photoMarkers.forEach(marker => {
      if (!marker.coordinates) return; // Skip markers without coordinates
      
      // Check exact location match
      const pointLocation = point.location.toLowerCase();
      const markerName = marker.name.toLowerCase();
      
      let matchScore = 0;
      
      // Exact match gets highest score
      if (pointLocation === markerName) {
        matchScore = 100;
      } 
      // Contains match gets medium score
      else if (pointLocation.includes(markerName) || markerName.includes(pointLocation)) {
        matchScore = 50;
      }
      // Word match gets lower score
      else {
        const pointWords = pointLocation.split(/[^a-z0-9]+/);
        const markerWords = markerName.split(/[^a-z0-9]+/);
        
        for (const word of pointWords) {
          if (word.length > 3 && markerWords.includes(word)) {
            matchScore = 30;
            break;
          }
        }
      }
      
      // If better match found, update
      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore;
        matchedMarker = marker;
      }
    });
    
    // If we found a matching marker, use its coordinates
    if (matchedMarker) {
      processedPoint.coordinates = {
        longitude: matchedMarker.coordinates.longitude,
        latitude: matchedMarker.coordinates.latitude
      };
      processedPoint.name = matchedMarker.name;
      processedPoint.matchedMarker = true;
      processedPoint.markerId = matchedMarker.id;
      
      // Mark this marker as used
      usedMarkerIds.add(matchedMarker.id);
    } else if (point.coordinates && point.coordinates.trim() !== "") {
      // Otherwise parse coordinates from the expedition data
      const parsedCoords = parseCoordinates(point.coordinates);
      if (parsedCoords) {
        processedPoint.coordinates = parsedCoords;
        processedPoint.name = point.location;
        processedPoint.matchedMarker = false;
      } else {
        return; // Skip points without valid coordinates
      }
    } else {
      return; // Skip points without coordinates
    }
    
    processedPoints.push(processedPoint);
  });
  
  // Now add any markers that weren't matched to expedition points
  // Sort markers by year to insert them correctly
  const unusedMarkers = photoMarkers
    .filter(marker => !usedMarkerIds.has(marker.id) && marker.coordinates)
    .sort((a, b) => {
      const yearA = parseInt(a.year ? a.year.split('-')[0].split(',')[0].trim() : '9999') || 9999;
      const yearB = parseInt(b.year ? b.year.split('-')[0].split(',')[0].trim() : '9999') || 9999;
      return yearA - yearB;
    });
  
  // Add unused markers to processed points
  if (unusedMarkers.length > 0) {
    
    // Find appropriate positions to insert these points
    unusedMarkers.forEach(marker => {
      const markerYear = parseInt(marker.year ? marker.year.split('-')[0].split(',')[0].trim() : '9999') || 9999;
      
      // Find insertion point based on year
      let insertIndex = 0;
      while (insertIndex < processedPoints.length) {
        const pointYear = parseInt(processedPoints[insertIndex].year || '9999') || 9999;
        if (markerYear < pointYear) break;
        insertIndex++;
      }
      
      // Insert the marker
      processedPoints.splice(insertIndex, 0, {
        ...marker,
        coordinates: marker.coordinates,
        name: marker.name,
        matchedMarker: true,
        markerId: marker.id
      });
    });
  }
  
  // Just create regular path segments
  let pathSegments = [];
  
  // Define a bounding box for the United States (roughly)
  const US_BOUNDS = {
    minLon: -125, maxLon: -65,  // West to East (Pacific to Atlantic)
    minLat: 24,   maxLat: 50    // South to North (Gulf of Mexico to Canada)
  };
  
  // Define expanded expedition region bounds - including Oklahoma Territory and all western territories
  const EXPEDITION_BOUNDS = {
    minLon: -125, maxLon: -85,  // West to East (Pacific to Mississippi)
    minLat: 30,   maxLat: 50    // South to North (Mexico border to Canada)
  };
  
  // Special Hillers expedition area including Oklahoma Territory
  const HILLERS_BOUNDS = photographer.toLowerCase() === 'hillers' ? {
    minLon: -115, maxLon: -85,  // Include Oklahoma Territory to the east
    minLat: 30,   maxLat: 45    // South to North
  } : EXPEDITION_BOUNDS;
  
  // Special Jackson expedition area including Colorado, Wyoming, and Omaha
  const JACKSON_BOUNDS = photographer.toLowerCase() === 'jackson' ? {
    minLon: -125, maxLon: -85,  // Jackson went further west and to Omaha
    minLat: 30,   maxLat: 48    // Include Omaha (latitude 41.26) and further north
  } : EXPEDITION_BOUNDS;
  
  // Function to check if coordinates are within bounds
  const isWithinBounds = (lon, lat) => {
    return (
      lon >= US_BOUNDS.minLon && lon <= US_BOUNDS.maxLon &&
      lat >= US_BOUNDS.minLat && lat <= US_BOUNDS.maxLat
    );
  };
  
  // Function to check if coordinates are within our expedition area - specific to photographer
  const isWithinExpeditionArea = (lon, lat) => {
    const bounds = photographer.toLowerCase() === 'jackson' ? 
      JACKSON_BOUNDS : HILLERS_BOUNDS;
    
    return (
      lon >= bounds.minLon && lon <= bounds.maxLon &&
      lat >= bounds.minLat && lat <= bounds.maxLat
    );
  };
  
  // Get the special markers directly using getPhotoById for better reliability
  const omahaMarkerDirect = getPhotoById('omaha-nebraska');
  const oklahomaMarkerDirect = getPhotoById('indian-territory-oklahoma');
  
  // Only care about Omaha for Jackson
  if (photographer.toLowerCase() === 'jackson') {
    // Create a new array for Jackson's points
    let jacksonPoints = [];
    
    if (omahaMarkerDirect) {
      // Add Omaha as the definitive starting point
      jacksonPoints.push({
        ...omahaMarkerDirect,
        sortYear: 1867, // Jackson's earliest expedition
        isStart: true
      });
      
      // Add all other Jackson photos
      photoMarkers
        .filter(m => m.photographer === 'Jackson' && m.id !== 'omaha-nebraska')
        .forEach(marker => {
          // Extract year for sorting
          let sortYear = 1870;
          if (marker.year) {
            const yearMatch = marker.year.match(/(\d{4})/);
            if (yearMatch && yearMatch[1]) {
              sortYear = parseInt(yearMatch[1]);
            }
          }
          
          jacksonPoints.push({
            ...marker,
            sortYear
          });
        });
        
      // Replace processed points with jacksonPoints
      processedPoints = jacksonPoints;
    }
  }
  
  // If we're processing Hillers' routes, make sure Oklahoma is included
  if (photographer.toLowerCase() === 'hillers') {
    // Create new array for Hillers points
    let hillersPoints = [];
    
    // Add Oklahoma Territory with a specific year
    if (oklahomaMarkerDirect) {
      hillersPoints.push({
        ...oklahomaMarkerDirect,
        sortYear: 1875,
        isStart: true
      });
    }
    
    // Add all Hillers photos 
    photoMarkers
      .filter(m => m.photographer === 'Hillers')
      .forEach(marker => {
        // Extract year for sorting
        let sortYear = 1873;
        if (marker.year) {
          const yearMatch = marker.year.match(/(\d{4})/);
          if (yearMatch && yearMatch[1]) {
            sortYear = parseInt(yearMatch[1]);
          }
        }
        
        hillersPoints.push({
          ...marker,
          sortYear
        });
      });
      
    // Sort Hillers points by year
    hillersPoints.sort((a, b) => a.sortYear - b.sortYear);
    
    // Replace processed points with hillersPoints
    processedPoints = hillersPoints;
  }
  
  // We've already handled the sorting in the photographer-specific sections
  
  // Add expeditionOrder property for visualization
  processedPoints.forEach((point, index) => {
    point.expeditionOrder = index + 1;
  });
  
  
  // Add start/end indicators for visualization
  if (processedPoints.length > 0) {
    // For Jackson, Omaha is the starting point
    if (photographer.toLowerCase() === 'jackson') {
      const omahaIndex = processedPoints.findIndex(p => 
        p.id === 'omaha-nebraska' || 
        p.name?.toLowerCase().includes('omaha')
      );
      
      if (omahaIndex >= 0) {
        // Mark Omaha as the definitive starting point
        processedPoints.forEach(p => p.isStart = false);
        processedPoints[omahaIndex].isStart = true;
      } else {
        // Default to first point
        processedPoints[0].isStart = true;
      }
    } else {
      // For others, first point is the start
      processedPoints[0].isStart = true;
    }
    
    // Last point is always the end
    processedPoints[processedPoints.length - 1].isEnd = true;
  }
  
  // Connect consecutive points with valid coordinates
  for (let i = 0; i < processedPoints.length - 1; i++) {
    const source = processedPoints[i];
    const target = processedPoints[i+1];
    
    // Only add if both have valid coordinates
    if (source.coordinates && target.coordinates) {
      const sourceLon = source.coordinates.longitude;
      const sourceLat = source.coordinates.latitude;
      const targetLon = target.coordinates.longitude;
      const targetLat = target.coordinates.latitude;
      
      // Skip segments where either point is outside reasonable bounds
      if (!isWithinBounds(sourceLon, sourceLat) || !isWithinBounds(targetLon, targetLat)) {
          continue;
      }
      
      // Check special connections that should be included even if distant
      // Add Salt Lake City to our special locations
      const isSaltLakeCityConnection =
        (source.name?.toLowerCase().includes('salt lake') || 
         target.name?.toLowerCase().includes('salt lake') ||
         source.id === 'salt-lake-city-1875' ||
         target.id === 'salt-lake-city-1875');
      
      const isOklahomaConnection = 
        photographer.toLowerCase() === 'hillers' && 
        (source.name?.toLowerCase().includes('oklahoma') || 
         target.name?.toLowerCase().includes('oklahoma') || 
         source.id === 'indian-territory-oklahoma' ||
         target.id === 'indian-territory-oklahoma' ||
         source.location?.toLowerCase().includes('indian territory') || 
         target.location?.toLowerCase().includes('indian territory'));
         
      const isOmahaConnection =
        photographer.toLowerCase() === 'jackson' && 
        (source.name?.toLowerCase().includes('omaha') || 
         target.name?.toLowerCase().includes('omaha') ||
         source.id === 'omaha-nebraska' ||
         target.id === 'omaha-nebraska');
      
      // Check if the source or target is a manually added route point or part of a special connection
      const isSpecialRoutePoint = source.isStart || target.isStart || 
                                 source.isTransition || target.isTransition ||
                                 source.isSpecialConnection || target.isSpecialConnection;
      
      // Calculate direct distance
      const distance = Math.sqrt(
        Math.pow(targetLon - sourceLon, 2) + 
        Math.pow(targetLat - sourceLat, 2)
      );
      
      // Check if this segment involves special marker points directly
      const isOmahaPoint = source.id === 'omaha-nebraska' || target.id === 'omaha-nebraska';
      const isOklahomaPoint = source.id === 'indian-territory-oklahoma' || target.id === 'indian-territory-oklahoma';
      const isSaltLakeCityPoint = source.id === 'salt-lake-city-1875' || target.id === 'salt-lake-city-1875';
      const isSpecialPoint = isOmahaPoint || isOklahomaPoint || isSaltLakeCityPoint;
      
      // For special markers, use a very permissive distance limit to ensure connections work
      const maxDistance = isSpecialPoint || isSpecialRoutePoint ? 50 : // Allow very long special connections 
                         isOklahomaConnection || isOmahaConnection || isSaltLakeCityConnection ? 30 : 
                         photographer.toLowerCase() === 'hillers' ? 15 :
                         photographer.toLowerCase() === 'jackson' ? 10 : 5;
      
      // Skip if distance is too large (except for special cases)
      if (distance > maxDistance && 
          !isOklahomaConnection && !isOmahaConnection && 
          !isSaltLakeCityConnection && !isSpecialPoint && !isSpecialRoutePoint) {
        continue;
      }
      
      // Prioritize segments within our expedition area of interest
      const sourceInArea = isWithinExpeditionArea(sourceLon, sourceLat);
      const targetInArea = isWithinExpeditionArea(targetLon, targetLat);
      
      // If both points are outside our area of interest and there's more than 1 degree distance,
      // skip to avoid drawing long lines outside our main region
      // EXCEPT if it's a special case like Oklahoma Territory, Salt Lake City, or Omaha
      // Also allow any connection involving our special route points
      if (!sourceInArea && !targetInArea && distance > 1 && 
          !isOklahomaConnection && !isOmahaConnection && !isSaltLakeCityConnection &&
          !isOmahaPoint && !isOklahomaPoint && !isSaltLakeCityPoint && 
          !isSpecialRoutePoint) {
        continue;
      }
      
      pathSegments.push({
        sourcePosition: [sourceLon, sourceLat],
        targetPosition: [targetLon, targetLat],
        year: source.year,
        sourceLocation: source.name,
        targetLocation: target.name
      });
    }
  }

  // Simplify special connections
  
  // Now connect special markers to their respective photographer's specific points
  if (photographer.toLowerCase() === 'jackson' && omahaMarkerDirect) {
    // For Jackson, connect Omaha directly to Gallatin (Yellowstone area)
    const gallatinPhoto = photoMarkers.find(m => 
      m.id === 'gallatin-headwaters' || 
      (m.name && m.name.includes('Gallatin'))
    );
    
    if (gallatinPhoto) {
      pathSegments.push({
        sourcePosition: [omahaMarkerDirect.coordinates.longitude, omahaMarkerDirect.coordinates.latitude],
        targetPosition: [gallatinPhoto.coordinates.longitude, gallatinPhoto.coordinates.latitude],
        year: "1871",
        sourceLocation: omahaMarkerDirect.name,
        targetLocation: gallatinPhoto.name,
        isSpecialConnection: true
      });
    } else {
      // Fallback to getting Gallatin directly from the data if not found in filtered markers
      const gallatinMarker = getPhotoById('gallatin-headwaters');
      
      if (gallatinMarker) {
        pathSegments.push({
          sourcePosition: [omahaMarkerDirect.coordinates.longitude, omahaMarkerDirect.coordinates.latitude],
          targetPosition: [gallatinMarker.coordinates.longitude, gallatinMarker.coordinates.latitude],
          year: "1871",
          sourceLocation: omahaMarkerDirect.name,
          targetLocation: gallatinMarker.name,
          isSpecialConnection: true
        });
      } else {
      }
    }
  }
  
  if (photographer.toLowerCase() === 'hillers' && oklahomaMarkerDirect) {
    // For Hillers, just connect Oklahoma to the closest Hillers photo
    const hillersPhotos = photoMarkers.filter(m => m.photographer === 'Hillers');
    
    if (hillersPhotos.length > 0) {
      // Connect to the closest Hillers photo
      let closestDistance = Infinity;
      let closestPhoto = null;
      
      hillersPhotos.forEach(photo => {
        if (photo.coordinates && oklahomaMarkerDirect.coordinates) {
          const distance = Math.sqrt(
            Math.pow(photo.coordinates.longitude - oklahomaMarkerDirect.coordinates.longitude, 2) + 
            Math.pow(photo.coordinates.latitude - oklahomaMarkerDirect.coordinates.latitude, 2)
          );
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestPhoto = photo;
          }
        }
      });
      
      if (closestPhoto) {
          pathSegments.push({
          sourcePosition: [oklahomaMarkerDirect.coordinates.longitude, oklahomaMarkerDirect.coordinates.latitude],
          targetPosition: [closestPhoto.coordinates.longitude, closestPhoto.coordinates.latitude],
          year: "1875", // Year of Oklahoma Territory documentation
          sourceLocation: oklahomaMarkerDirect.name,
          targetLocation: closestPhoto.name,
          isSpecialConnection: true
        });
      }
    }
  }
  
  // For Jackson, keep only the connection from Omaha to Gallatin
  if (photographer.toLowerCase() === 'jackson') {
    pathSegments = pathSegments.filter(segment => {
      // If it involves Omaha as the target, remove it
      if (segment.targetLocation?.includes('Omaha')) {
        return false;
      }
      
      // If it involves Omaha as the source but not going to Gallatin, remove it
      if (segment.sourceLocation?.includes('Omaha') && !segment.targetLocation?.includes('Gallatin')) {
        return false;
      }
      
      return true;
    });
  }

  // If very few path segments were created (Jackson case) but we have multiple markers, connect them by year
  if ((pathSegments.length < Math.floor(photoMarkers.length / 2)) && photoMarkers.length > 1) {
    
    // Group markers by year or year range for better organization
    const markersByYear = {};
    
    photoMarkers.forEach(marker => {
      if (!marker.year || marker.year === "null") return;
      
      // Extract first year from various formats
      const yearMatch = marker.year.match(/(\d{4})/);
      if (!yearMatch) return;
      
      const year = yearMatch[1];
      if (!markersByYear[year]) {
        markersByYear[year] = [];
      }
      markersByYear[year].push(marker);
    });
    
    // Get the years in order
    const sortedYears = Object.keys(markersByYear).sort();
    
    // For each year, connect all markers within that year
    sortedYears.forEach(year => {
      const markers = markersByYear[year];
      if (markers.length <= 1) return;
      
      // Create path segments between markers of the same year
      for (let i = 0; i < markers.length - 1; i++) {
        for (let j = i + 1; j < markers.length; j++) {
          const source = markers[i];
          const target = markers[j];
          
          // Calculate distance to avoid extremely long connections
          const distance = Math.sqrt(
            Math.pow(target.coordinates.longitude - source.coordinates.longitude, 2) + 
            Math.pow(target.coordinates.latitude - source.coordinates.latitude, 2)
          );
          
          // Skip very long distances
          if (distance > 5) continue;
          
          // Only add path if we have valid coordinates
          if (source.coordinates && target.coordinates) {
            // Check if this path already exists in pathSegments
            const existingPath = pathSegments.find(p => 
              (p.sourcePosition[0] === source.coordinates.longitude && 
               p.sourcePosition[1] === source.coordinates.latitude &&
               p.targetPosition[0] === target.coordinates.longitude &&
               p.targetPosition[1] === target.coordinates.latitude) ||
              (p.sourcePosition[0] === target.coordinates.longitude && 
               p.sourcePosition[1] === target.coordinates.latitude &&
               p.targetPosition[0] === source.coordinates.longitude &&
               p.targetPosition[1] === source.coordinates.latitude)
            );
            
            if (!existingPath) {
              pathSegments.push({
                sourcePosition: [source.coordinates.longitude, source.coordinates.latitude],
                targetPosition: [target.coordinates.longitude, target.coordinates.latitude],
                year: source.year,
                sourceLocation: source.name,
                targetLocation: target.name
              });
            }
          }
        }
      }
    });
    
    // Also connect markers from one year to the next
    for (let i = 0; i < sortedYears.length - 1; i++) {
      const currentYearMarkers = markersByYear[sortedYears[i]];
      const nextYearMarkers = markersByYear[sortedYears[i+1]];
      
      if (currentYearMarkers.length === 0 || nextYearMarkers.length === 0) continue;
      
      // Connect the last marker of the current year to the first marker of the next year
      const source = currentYearMarkers[currentYearMarkers.length - 1];
      const target = nextYearMarkers[0];
      
      // Only add path if we have valid coordinates
      if (source.coordinates && target.coordinates) {
        // Check if this path already exists
        const existingPath = pathSegments.find(p => 
          (p.sourcePosition[0] === source.coordinates.longitude && 
           p.sourcePosition[1] === source.coordinates.latitude &&
           p.targetPosition[0] === target.coordinates.longitude &&
           p.targetPosition[1] === target.coordinates.latitude) ||
          (p.sourcePosition[0] === target.coordinates.longitude && 
           p.sourcePosition[1] === target.coordinates.latitude &&
           p.targetPosition[0] === source.coordinates.longitude &&
           p.targetPosition[1] === source.coordinates.latitude)
        );
        
        if (!existingPath) {
          // Calculate distance to avoid extremely long connections
          const distance = Math.sqrt(
            Math.pow(target.coordinates.longitude - source.coordinates.longitude, 2) + 
            Math.pow(target.coordinates.latitude - source.coordinates.latitude, 2)
          );
          
          // Allow longer distances between year transitions
          const maxDistance = photographer.toLowerCase() === 'jackson' ? 12 : 8;
          
          if (distance <= maxDistance) {
            pathSegments.push({
              sourcePosition: [source.coordinates.longitude, source.coordinates.latitude],
              targetPosition: [target.coordinates.longitude, target.coordinates.latitude],
              year: `${sortedYears[i]}-${sortedYears[i+1]}`,
              sourceLocation: source.name,
              targetLocation: target.name
            });
          }
        }
      }
    }
    
  }

  // Create special points for the start and end
  const startPoint = processedPoints.find(p => p.isStart);
  const endPoint = processedPoints.find(p => p.isEnd);
  
  // Colors for the expedition lines with higher opacity for better visibility
  const baseColor = photographer.toLowerCase() === 'jackson' 
    ? [255, 87, 51, 225]  // Red for Jackson
    : [75, 144, 226, 225]; // Blue for Hillers
    
  // Create directional effects - paths get thicker toward the end of the route
  pathSegments.forEach((segment, index) => {
    // Normalize the index to get a progress value from 0 to 1
    const progress = pathSegments.length > 1 ? index / (pathSegments.length - 1) : 0;
    segment.progress = progress;
    
    // Special connection has different styling
    if (segment.isSpecialConnection) {
      segment.color = photographer.toLowerCase() === 'jackson' 
        ? [255, 120, 50, 255]  // Brighter orange for Jackson special connections
        : [100, 180, 255, 255]; // Brighter blue for Hillers special connections
      segment.width = 7; // Thicker line for special connections
      segment.dashed = true; // Make special connections dashed
    }
  });
    
  return new LineLayer({
    id: `expedition-route-${photographer}`,
    data: pathSegments,
    pickable: true,
    getSourcePosition: d => d.sourcePosition,
    getTargetPosition: d => d.targetPosition,
    getWidth: d => {
      // Use custom width for special connections
      if (d.isSpecialConnection) {
        return d.width || 7;
      }
      
      // Make earlier segments thinner and later segments thicker
      // This creates a directional effect showing the expedition's progress
      const baseWidth = defaultStyle.getWidth || 4;
      const widthMultiplier = 0.8 + (d.progress * 0.5); // Width varies from 80% to 130% of base width
      return baseWidth * widthMultiplier;
    },
    getColor: d => {
      // Use custom color for special connections
      if (d.isSpecialConnection) {
        return d.color || baseColor;
      }
      return baseColor;
    },
    getDashArray: d => d.isSpecialConnection ? [12, 4] : [0, 0], // Make special connections dashed
    dashJustified: true,
    ...defaultStyle,
    visible,
    updateTriggers: {
      getColor: [photographer, pathSegments],
      getWidth: [style.getWidth, pathSegments],
      getDashArray: [pathSegments]
    },
    // Optional tooltip when hovering over path segments
    onHover: ({object, x, y}) => {
      if (object) {
        return {
          html: `<div>Route: ${object.sourceLocation} to ${object.targetLocation}</div>
                 <div>Year: ${object.year || 'Unknown'}</div>`,
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif'
          }
        };
      }
      return null;
    }
  });
}

export default createExpeditionRouteLayer;