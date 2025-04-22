// historicalPhotoData.js
/**
 * Historical photography locations with camera parameters for overlay positioning
 */
import { getAssetPath } from '../utils/assetUtils';

export const historicalPhotos = {
  "omaha-nebraska": {
    id: "omaha-nebraska",
    name: "Omaha, Nebraska",
    photographer: "Jackson",
    year: "1867-1869",
    catalog_ref: "null",
    description: "null",
    coordinates: {
      latitude: 41.2565,
      longitude: -95.9345
    },
    elevation_feet: "null",
    elevation_meters: "nul",
    image_url: "null"
  },

  "mystic-lake": {
    id: "mystic-lake",
    name: "Mystic Lake, Montana",
    photographer: "Jackson",
    year: "1871-1878",
    catalog_ref: "P.48.1.7",
    description: "Mystic Lake, Montana Territory",
    coordinates: {
      latitude: 45.5453506,
      longitude: -110.9193637
    },
    elevation_feet: 6398,
    elevation_meters: 1950,
    camera: {
      viewpoint: {
        latitude: 45.543261,
        longitude: -110.920025,
        elevation: 0
      },
      bearing: 3.66,
      pitch: 84.73,
      zoom: 17.65,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.9240, 45.5440],  // Southwest corner
        [-110.9170, 45.5480]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.7.jpg"
  },
  
  "gallatin-headwaters": {
    id: "gallatin-headwaters",
    name: "Headwaters of the Gallatin Mountains",
    photographer: "Jackson",
    year: "1871-1878",
    catalog_ref: "P.48.1.16",
    description: "Headwaters of the Gallatin Mountains",
    coordinates: {
      latitude: 44.9632,
      longitude: -111.0573
    },
    elevation_feet: 8500,
    elevation_meters: 2591,
    camera: {
      viewpoint: {
        latitude: 44.9630,
        longitude: -111.0580,
        elevation: 8520
      },
      bearing: 95,     // Slightly east-facing view
      pitch: -10,      // Looking slightly downward at the waterfall
      zoom: 16.5,      // Close-up view of the waterfall
      fov: 50         // Narrower field of view for the close-up
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-111.0590, 44.9625],  // Southwest corner
        [-111.0565, 44.9640]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.16.jpg"
  },
  
  "mammoth-hot-springs": {
    id: "mammoth-hot-springs",
    name: "Mammoth Hot Springs",
    photographer: "Jackson",
    year: "1871-1878",
    catalog_ref: "P.48.1.8",
    description: "Mammoth Hot-Springs Gardiners River [Wyoming]",
    coordinates: {
      latitude: 44.9772,
      longitude: -110.7028
    },
    elevation_feet: 6200,
    elevation_meters: 1889,
    camera: {
      viewpoint: {
        latitude: 44.966179,
        longitude: -110.709840,
        elevation: 0
      },
      bearing: -162.95,
      pitch: 85.00,
      zoom: 17.26,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.7070, 44.9750],  // Southwest corner
        [-110.6980, 44.9790]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.8.jpg"
  },
  
  "yellowstone-falls": {
    id: "yellowstone-falls",
    name: "Great Falls of the Yellowstone",
    photographer: "Jackson",
    year: "1871",
    catalog_ref: "P.48.1.9",
    description: "Great Falls of the Yellowstone",
    coordinates: {
      latitude: 44.7181,
      longitude: -110.4961
    },
    elevation_feet: 7500,
    elevation_meters: 2286,
    camera: {
      viewpoint: {
        latitude: 44.717836,
        longitude: -110.495424,
        elevation: 0
      },
      bearing: -101.29,
      pitch: 84.07,
      zoom: 16.28,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.5000, 44.7150],  // Southwest corner
        [-110.4920, 44.7210]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.9.jpg"
  },
  
  "holy-cross": {
    id: "holy-cross",
    name: "Mountain of the Holy-Cross",
    photographer: "Jackson",
    year: "1873",
    catalog_ref: "P.48.1.2",
    description: "Mountain of the Holy-Cross",
    coordinates: {
      latitude: 39.4668,
      longitude: -106.4817
    },
    elevation_feet: 14009,
    elevation_meters: 4270,
    camera: {
      viewpoint: {
        latitude: 39.462634,
        longitude: -106.478730,
        elevation: 0
      },
      bearing: -126.63,
      pitch: 84.37,
      zoom: 14.07,
      fov: 60
    },
    overlay: {
      opacity: 0.8,
      bounds: [
        // Adjusted to appear properly in front of the mountain
        [-106.4785, 39.4635],  // Southwest corner (left, bottom)
        [-106.4765, 39.4655]   // Northeast corner (right, top)
      ],
      // Adjust size and appearance
      scale: 1.0,
      aspect: 1.33  // 4:3 aspect ratio
    },
    image_url: "/assets/img/P.48.1.2.jpg"
  },
  
  "mancos-canyon-1": {
    id: "mancos-canyon-1",
    name: "Ancient Ruins in the Canyon of the Mancos",
    photographer: "Jackson",
    year: "1874-1875",
    catalog_ref: "P.48.1.29",
    description: "Ancient Ruins in the Canyon of the Mancos",
    coordinates: {
      latitude: 37.1850,
      longitude: -108.4925
    },
    elevation_feet: 7200,
    elevation_meters: 2195,
    camera: {
      viewpoint: {
        latitude: 37.337382,
        longitude: -108.444995,
        elevation: 0
      },
      bearing: -84.32,
      pitch: 82.48,
      zoom: 18.37,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-108.4950, 37.1840],  // Southwest corner
        [-108.4910, 37.1860]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.29.jpg"
  },
  
  "mancos-canyon-2": {
    id: "mancos-canyon-2",
    name: "Ancient Ruins in the Canyon of the Mancos",
    photographer: "Jackson",
    year: "1874-1875",
    catalog_ref: "P.48.1.30",
    description: "Ancient Ruins in the Canyon of the Mancos",
    coordinates: {
      latitude: 37.0461,
      longitude: -108.6956
    },
    elevation_feet: 6700,
    elevation_meters: 2042,
    camera: {
      viewpoint: {
        latitude: 37.3350,
        longitude: -108.4350,
        elevation: 6750
      },
      bearing: 65,      // Northeast view looking at the cliff dwelling
      pitch: 0,         // Level view of the cliff structure
      zoom: 16.0,       // Close enough to see architectural details
      fov: 55          // Standard field of view for architectural documentation
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-108.6970, 37.0450],  // Southwest corner
        [-108.6940, 37.0470]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.30.jpg"
  },
  
  "walpi-pueblo-1": {
    id: "walpi-pueblo-1",
    name: "Walpi Pueblo - East Mesa",
    photographer: "Jackson",
    year: "1874-1875",
    catalog_ref: "P.48.1.28",
    description: "[The Pueblo of Walpi on the East Mesa opposite Tewa]",
    coordinates: {
      latitude: 35.8371,
      longitude: -110.3943
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 37.288492,
        longitude: -108.474738,
        elevation: 0
      },
      bearing: -125.22,
      pitch: 83.47,
      zoom: 17.15,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.3895, 35.8285],  // Southwest corner
        [-110.3880, 35.8295]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.28.jpg"
  },
  
  "walpi-pueblo-2": {
    id: "walpi-pueblo-2",
    name: "Walpi Pueblo - Terraced Houses",
    photographer: "Hillers",
    year: "1874-1875",
    catalog_ref: "P.48.1.20",
    description: "Terraced Houses at Wolpi [Walpi]",
    coordinates: {
      latitude: 35.8372,
      longitude: -110.3944
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 35.8295,
        longitude: -110.3890,
        elevation: 6240
      },
      bearing: 140,     // Southeast view of the pueblo structures
      pitch: -5,        // Slightly downward to capture the courtyard area
      zoom: 18.5,       // Very close view of the pueblo buildings
      fov: 45          // Narrower field of view for architectural details
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.3950, 35.8365],  // Southwest corner
        [-110.3935, 35.8380]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.20.jpg"
  },
  
  "walpi-pueblo-3": {
    id: "walpi-pueblo-3",
    name: "Walpi and Shechumavi - Tewa",
    photographer: "Hillers",
    year: "1874-1875",
    catalog_ref: "P.48.1.10",
    description: "Wolpi [Walpi] and Shechumavi [Sichomovi], from Tewa",
    coordinates: {
      latitude: 35.8371,
      longitude: -110.3943
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 35.8371,
        longitude: -110.3943,
        elevation: 6725
      },
      bearing: 180,      // General view orientation
      pitch: 0,         // Level view
      zoom: 15,         // General zoom level
      fov: 60          // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.3950, 35.8365],  // Southwest corner
        [-110.3935, 35.8380]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.10.jpg"
  },
  
  "walpi-pueblo-4": {
    id: "walpi-pueblo-4",
    name: "Walpi Pueblo - Dance Rock",
    photographer: "Hillers",
    year: "1874-1875",
    catalog_ref: "P.48.1.12",
    description: "Dance Rock. Wolpi [Walpi]",
    coordinates: {
      latitude: 35.8371,
      longitude: -110.3942
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 35.8371,
        longitude: -110.3942,
        elevation: 6725
      },
      bearing: 180,      // General view orientation
      pitch: 0,         // Level view
      zoom: 17,         // Closer view for detail
      fov: 60          // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.3950, 35.8365],  // Southwest corner
        [-110.3935, 35.8380]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.12.jpg"
  },
  
  "montezuma-canyon": {
    id: "montezuma-canyon",
    name: "Montezuma Canyon",
    photographer: "Jackson",
    year: "1874-1876",
    catalog_ref: "P.48.1.31",
    description: "Ruins in the Montezuma Canyon",
    coordinates: {
      latitude: 37.3870,
      longitude: -109.3062
    },
    elevation_feet: 5800,
    elevation_meters: 1768,
    camera: {
      viewpoint: {
        latitude: 37.385507,
        longitude: -109.305991,
        elevation: 0
      },
      bearing: 5.98,
      pitch: 80.86,
      zoom: 18.66,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-109.3080, 37.3860],  // Southwest corner
        [-109.3050, 37.3880]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.31.jpg"
  },
  
  "walpi-pueblo-5": {
    id: "walpi-pueblo-5",
    name: "Walpi Pueblo - Weaving",
    photographer: "Hillers",
    year: "1879",
    catalog_ref: "P.48.1.22",
    description: "A Moki [Hopi] Weaving [Walpi]",
    coordinates: {
      latitude: 35.8373,
      longitude: -110.3945
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 35.828917,
        longitude: -110.388440,
        elevation: 0
      },
      bearing: -42.22,
      pitch: 80.97,
      zoom: 19.81,
      fov: 60
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.3886, 35.8290],  // Southwest corner
        [-110.3882, 35.8293]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.22.jpg"
  },
  
  "grand-canyon": {
    id: "grand-canyon",
    name: "Grand Canyon [Arizona]",
    photographer: "Hillers",
    year: "1872",
    catalog_ref: "null",
    description: "Grand Canyon [Arizona]",
    coordinates: {
      latitude: 36.0544,
      longitude: -112.1129
    },
    elevation_feet: 10000,
    elevation_meters: 3000,
    camera: {
      viewpoint: {
        latitude: 36.0544,
        longitude: -112.1401,
        elevation: 7500
      },
      bearing: 180,     // South-facing view of the canyon
      pitch: -15,       // Looking down into the canyon
      zoom: 12,         // Wide view to capture the expanse
      fov: 70          // Wide field of view for panoramic vista
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-112.1430, 36.0530],  // Southwest corner
        [-112.1100, 36.0560]   // Northeast corner
      ]
    },
    image_url: "null"
  },
  
  "nevada": {
    id: "nevada",
    name: "Nevada",
    photographer: "Hillers",
    year: "1873",
    catalog_ref: "null",
    description: "Nevada",
    coordinates: {
      latitude: 39.773978,
      longitude: -116.618156
    },
    elevation_feet: 15000,
    elevation_meters: 4500,
    camera: {
      viewpoint: {
        latitude: 39.7739,
        longitude: -116.6181,
        elevation: 6000
      },
      bearing: 210,      // Southwest view of mountain range
      pitch: 5,          // Slightly upward to capture mountains
      zoom: 12,          // Wide enough for landscape
      fov: 65           // Wide field of view for landscape
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-116.6200, 39.7720],  // Southwest corner
        [-116.6160, 39.7760]   // Northeast corner
      ]
    },
    image_url: "null"
  },
  
  "arizona": {
    id: "arizona",
    name: "Arizona",
    photographer: "Hillers",
    year: "1873, 1881",
    catalog_ref: "null",
    description: "Arizona",
    coordinates: {
      latitude: 34.300692,
      longitude: -111.566677
    },
    elevation_feet: 10000,
    elevation_meters: 3000,
    camera: {
      viewpoint: {
        latitude: 34.3006,
        longitude: -111.5666,
        elevation: 5000
      },
      bearing: 150,      // Southeast view
      pitch: 0,          // Level view
      zoom: 13,          // General landscape view
      fov: 60           // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-111.5680, 34.2990],  // Southwest corner
        [-111.5650, 34.3020]   // Northeast corner
      ]
    },
    image_url: "null"
  },
  
  "utah": {
    id: "utah",
    name: "Utah",
    photographer: "Hillers",
    year: "1874",
    catalog_ref: "null",
    description: "Utah",
    coordinates: {
      latitude: 39.240763,
      longitude: -111.749840
    },
    elevation_feet: 12000,
    elevation_meters: 3600,
    camera: {
      viewpoint: {
        latitude: 39.2407,
        longitude: -111.7498,
        elevation: 6000
      },
      bearing: 180,      // South-facing view
      pitch: 0,          // Level view
      zoom: 13,          // General landscape view
      fov: 60           // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-111.7510, 39.2390],  // Southwest corner
        [-111.7480, 39.2420]   // Northeast corner
      ]
    },
    image_url: "null"
  },
  
  "southwestern-colorado": {
    id: "southwestern-colorado",
    name: "Southwestern Colorado",
    photographer: "Jackson",
    year: "1874-1875",
    catalog_ref: "null",
    description: "Southwestern Colorado",
    coordinates: {
      latitude: 38.068095, 
      longitude: -107.684383
    },
    elevation_feet: 7800,
    elevation_meters: 2375,
    camera: {
      viewpoint: {
        latitude: 38.0680,
        longitude: -107.6843,
        elevation: 7800
      },
      bearing: 180,      // South-facing view
      pitch: 0,          // Level view
      zoom: 13,          // General landscape view
      fov: 60           // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-107.6860, 38.0670],  // Southwest corner
        [-107.6830, 38.0690]   // Northeast corner
      ]
    },
    image_url: "null"
  },
  
  "oklahoma-territory": {
    id: "oklahoma-territory",
    name: "Oklahoma \"Indian Territory\"",
    photographer: "Hillers",
    year: "1875",
    catalog_ref: "null",
    description: "Oklahoma \"Indian Territory\"",
    coordinates: {
      latitude: 33.185, 
      longitude: -98.63
    },
    elevation_feet: 1050,
    elevation_meters: 320,
    camera: {
      viewpoint: {
        latitude: 33.1850,
        longitude: -98.6300,
        elevation: 1050
      },
      bearing: 180,      // South-facing view
      pitch: 0,          // Level view
      zoom: 13,          // General landscape view
      fov: 60           // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-98.6320, 33.1840],  // Southwest corner
        [-98.6280, 33.1860]   // Northeast corner
      ]
    },
    image_url: "null"
  },
  
  "zuni-eagle": {
    id: "zuni-eagle",
    name: "A Zuni Eagle Cage",
    photographer: "Hillers",
    year: "1879",
    catalog_ref: "P.48.1.3",
    description: "A Zuni Eagle Cage",
    coordinates: {
      latitude: 35.0695,
      longitude: -108.8484
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 35.0695,
        longitude: -108.8484,
        elevation: 6300
      },
      bearing: 0,        // North-facing view of the cage
      pitch: 0,          // Level view
      zoom: 19,          // Close-up of the cage structure
      fov: 50           // Narrow field for detail
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-108.8490, 35.0690],  // Southwest corner
        [-108.8480, 35.0700]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.3.jpg"
  },
  
  "navajo-joganda": {
    id: "navajo-joganda",
    name: "A Navajo Joganda",
    photographer: "Hillers",
    year: "null",
    catalog_ref: "P.48.1.11",
    description: "A Navajo Joganda, [Hogan]",
    coordinates: {
      latitude: 36.12,
      longitude: -111.23
    },
    elevation_feet: 6725,
    elevation_meters: 2050,
    camera: {
      viewpoint: {
        latitude: 36.1200,
        longitude: -111.2300,
        elevation: 6300
      },
      bearing: 150,      // Southeast view of the hogan
      pitch: 0,          // Level view
      zoom: 18,          // Close enough to see details
      fov: 55           // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-111.2310, 36.1190],  // Southwest corner
        [-111.2290, 36.1210]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.11.jpg"
  },
  
  "central-mexico": {
    id: "central-mexico",
    name: "Central Mexico",
    photographer: "Hillers",
    year: "1880-1907",
    catalog_ref: "null",
    description: "Central Mexico",
    coordinates: {
      latitude: 22.614328, 
      longitude: -101.672974
    },
    elevation_feet: 7800,
    elevation_meters: 2375,
    camera: {
      viewpoint: {
        latitude: 22.6143,
        longitude: -101.6729,
        elevation: 7800
      },
      bearing: 180,      // South-facing view
      pitch: 0,          // Level view
      zoom: 13,          // General landscape view
      fov: 60           // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-101.6740, 22.6130],  // Southwest corner
        [-101.6710, 22.6160]   // Northeast corner
      ]
    },
    image_url: "null"
  }
};

/**
 * Get a specific historical photo by ID
 */
export function getPhotoById(photoId) {
  return historicalPhotos[photoId] || null;
}

/**
 * Get all historical photos as an array
 */
export function getAllPhotos() {
  return Object.values(historicalPhotos);
}

/**
 * Get photos filtered by photographer
 */
export function getPhotosByPhotographer(photographerName) {
  return Object.values(historicalPhotos).filter(
    photo => photo.photographer.toLowerCase() === photographerName.toLowerCase()
  );
}

/**
 * Get photos within a bounding box
 */
export function getPhotosInBoundingBox(minLon, minLat, maxLon, maxLat) {
  return Object.values(historicalPhotos).filter(photo => {
    const lon = photo.coordinates.longitude;
    const lat = photo.coordinates.latitude;
    return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
  });
}