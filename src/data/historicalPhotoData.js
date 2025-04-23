// enhancedHistoricalPhotoData.js
/**
 * Historical photography locations with camera parameters for overlay positioning
 * Enhanced with expedition details from Hillers' Diary of the Powell Expeditions 1871-1875
 */
import { getAssetPath } from '../utils/assetUtils';

export const historicalPhotos = {
 "omaha-nebraska": {
  id: "omaha-nebraska",
  name: "Omaha, Nebraska",
  photographer: "A. Ruger",
  year: "1868",
  catalog_ref: "Chicago Lithographing Co., 1868",
  description: "Bird's-eye view of the city of Omaha, Nebraska, from the east side of the Missouri River. Drawn and published by A. Ruger, this 1868 lithograph illustrates early urban development, rail activity, and steamboat commerce at the edge of the western frontier.",
  coordinates: {
    latitude: 41.2565,
    longitude: -95.9345
  },
  elevation_feet: 1060,
  elevation_meters: 323,
  camera: {
    viewpoint: {
      latitude: 41.254041,
      longitude: -95.925252,
      elevation: 0 // Set appropriate elevation
    },
    bearing: -77.22,
    pitch: 60.00,
    zoom: 15.71,
    fov: 60 // Standard field of view
  },
  
  overlay: {
    opacity: 0.5,
    bounds: [
      [-95.9450, 41.2500],  // Southwest corner
      [-95.9150, 41.2650]   // Northeast corner
    ]
  },
  image_url: "/assets/img/Omaha_1877.jpg",
  expedition: "Pre-Powell Surveys",
  expedition_notes: "Lithograph created during post-Civil War expansion and visual documentation of key railroad cities."
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
    image_url: "/assets/img/P.48.1.7.jpg",
    expedition: "Hayden Survey"
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
        latitude: 44.958707,
        longitude: -111.032414,
        elevation: 0 // Set appropriate elevation
      },
      bearing: 147.50,
      pitch: 86.13,
      zoom: 17.66,
      fov: 60 // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-111.0590, 44.9625],  // Southwest corner
        [-111.0565, 44.9640]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.16.jpg",
    expedition: "Hayden Survey"
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
        latitude: 44.970675,
        longitude: -110.704326,
        elevation: 0 // Set appropriate elevation
      },
      bearing: 174.64,
      pitch: 86.80,
      zoom: 17.26,
      fov: 60 // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-110.7070, 44.9750],  // Southwest corner
        [-110.6980, 44.9790]   // Northeast corner
      ]
    },
    image_url: "/assets/img/P.48.1.8.jpg",
    expedition: "Hayden Survey"
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
    image_url: "/assets/img/P.48.1.9.jpg",
    expedition: "Hayden Survey"
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
        latitude: 39.462081,
        longitude: -106.485924,
        elevation: 0 // Set appropriate elevation
      },
      bearing: -108.44,
      pitch: 85.79,
      zoom: 14.81,
      fov: 60 // Standard field of view
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
    image_url: "/assets/img/P.48.1.2.jpg",
    expedition: "Hayden Survey"
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
    image_url: "/assets/img/P.48.1.29.jpg",
    expedition: "Hayden Survey"
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
    image_url: "/assets/img/P.48.1.30.jpg",
    expedition: "Hayden Survey"
  },

"window-rock": {
  id: "window-rock",
  name: "Window Rock",
  photographer: "landmark",
  year: "null",
  catalog_ref: "null",
  description: "Natural sandstone arch and seat of government of the Navajo Nation in northeastern Arizona.",
  coordinates: {
    latitude: 35.68057,
    longitude: -109.05259
  },
  elevation_feet: 6830,
  elevation_meters: 2082,
  camera: {
    viewpoint: {
      latitude: 35.6815,
      longitude: -109.0537,
      elevation: 6900
    },
    bearing: 25,         // Looking northeast toward the arch
    pitch: -10,          // Slight downward tilt to capture the rock and base
    zoom: 16,            // Medium zoom to frame the arch within its context
    fov: 65              // Slightly narrower field for focus on geological detail
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-109.0550, 35.6785],  // Southwest corner
      [-109.0505, 35.6825]   // Northeast corner
    ]
  },
  image_url: "null",
  expedition: "landmark",
  expedition_notes: "null"
},

  "chaco-canyon": {
  id: "chaco-canyon",
  name: "Chaco Canyon",
  photographer: "landmark",
  year: "null",
  catalog_ref: "null",
  description: "Chaco Canyon",
  coordinates: {
    latitude: 36.060293,
    longitude: -107.967008
  },
  elevation_feet: 6106,
  elevation_meters: 1861,
  camera: {
    viewpoint: {
      latitude: 36.0636,
      longitude: -107.9701,
      elevation: 6270
    },
    bearing: 155,     // South-southeast view looking down at Pueblo Bonito
    pitch: -15,       // Downward angle to capture the canyon and structures
    zoom: 15.5,       // Wide enough to capture the context but close enough for detail
    fov: 70          // Wide field of view for landscape perspective
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-107.9750, 36.0550],  // Southwest corner
      [-107.9600, 36.0650]   // Northeast corner
    ]
  },
  image_url: "null",
  expedition: "null",
  expedition_notes: "null"
},

"monument-valley": {
  id: "monument-valley",
  name: "Monument Valley",
  photographer: "landmark",
  year: "null",
  catalog_ref: "null",
  description: "Monument Valley, a region of the Colorado Plateau characterized by a cluster of vast sandstone buttes, is a sacred site for the Navajo Nation.",
  coordinates: {
    latitude: 36.9980,
    longitude: -110.0984
  },
  elevation_feet: 5200,
  elevation_meters: 1585,
  camera: {
    viewpoint: {
      latitude: 36.978849,
      longitude: -110.101701,
      elevation: 0 // Set appropriate elevation
    },
    bearing: 166.95,
    pitch: 72.41,
    zoom: 13.87,
    fov: 60 // Standard field of view
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-110.1100, 36.9900],  // Southwest corner
      [-110.0850, 37.0050]   // Northeast corner
    ]
  },
  image_url: "null",
  expedition: "null",
  expedition_notes: "null"
},

"canyon-de-chelly": {
  "id": "canyon-de-chelly",
  "name": "Canyon de Chelly",
  "photographer": "landmark",
  "year": "null",
  "catalog_ref": "null",
  "description": "Canyon de Chelly National Monument, located within the Navajo Nation in northeastern Arizona, features dramatic sandstone cliffs and ancient dwellings. Spider Rock, a prominent 750-foot sandstone spire, stands at the junction of Canyon de Chelly and Monument Canyon.",
  "coordinates": {
    "latitude": 36.1400,
    "longitude": -109.4700
  },
  "elevation_feet": 5640,
  "elevation_meters": 1719,
  "camera": {
    viewpoint: {
      latitude: 36.133865,
      longitude: -109.482538,
      elevation: 0 // Set appropriate elevation
    },
    bearing: 116.25,
    pitch: 77.89,
    zoom: 15.50,
    fov: 60 // Standard field of view
  },
  "overlay": {
    "opacity": 0.5,
    "bounds": [
      [-109.4750, 36.1350],
      [-109.4600, 36.1450]
    ]
  },
  "image_url": "null",
  "expedition": "null",
  "expedition_notes": "null"
},


"salt-lake-city-1875": {
  "id": "salt-lake-city-1875",
  "name": "Salt Lake City (1875)",
  "photographer": "E.S. Glover",
  "year": "1875",
  "catalog_ref": "Library of Congress G4344.S3A3 1875 .G6",
  "description": "Bird's-eye view of Salt Lake City, Utah, 1875, oriented from the northwest looking southeast, with Temple Square at the center.",
  "coordinates": {
    "latitude": 40.7707,
    "longitude": -111.8925
  },
  "elevation_feet": 4300,
  "elevation_meters": 1311,
  
  camera: {
    viewpoint: {
      latitude: 40.692643,
      longitude: -111.903046,
      elevation: 0 // Set appropriate elevation
    },
    bearing: 54.75,
    pitch: 78.17,
    zoom: 14.95,
    fov: 60 // Standard field of view
  },
  "overlay": {
    "opacity": 0.5,
    "bounds": [
      [-111.9100, 40.7600],
      [-111.8750, 40.7800]
    ]
  },
  "image_url": "/assets/img/SLC_1875.jpg",
  "expedition": "null",
  "expedition_notes": "null"
},

  
 "walpi-pueblo-1": {
  id: "walpi-pueblo-1",
  name: "East Mesa",
  photographer: "Jackson",
  year: "1874-1875",
  catalog_ref: "P.48.1.28",
  description: "[The Pueblo of Walpi on the East Mesa opposite Tewa]",
  coordinates: {
    latitude: 37.288492,
    longitude: -108.474738,
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
  image_url: "/assets/img/P.48.1.28.jpg",
  expedition: "Hayden Survey"
},
  
  "walpi-pueblo-2": {
  id: "walpi-pueblo-2",
  name: "Walpi Pueblo - Terraced Houses",
  photographer: "Hillers",
  year: "1874-1875",
  catalog_ref: "P.48.1.20",
  description: "Terraced Houses at Wolpi [Walpi]",
  coordinates: {
    latitude: 35.829354,
    longitude: -110.3890,
  },
  elevation_feet: 6725,
  elevation_meters: 2050,
  camera: {
    viewpoint: {
      latitude: 35.829354,
      longitude: -110.388763,
      elevation: 0 // Set appropriate elevation
    },
    bearing: 124.91,
    pitch: 82.26,
    zoom: 20.00,
    fov: 60 // Standard field of view
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-110.3950, 35.8365],  // Southwest corner
      [-110.3935, 35.8380]   // Northeast corner
    ]
  },
  image_url: "/assets/img/P.48.1.20.jpg",
  expedition: "Powell Expedition - Arizona (Hopi)",
  expedition_notes: "Part of Powell's Bureau of American Ethnology (BAE) survey to collect 'tangible tokens' of Hopi culture for the 1876 Philadelphia Centennial Exposition (World's Fair)"
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
    bearing: 180,      // General view orientation (south-facing view from Tewa toward Walpi/Sichomovi)
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
  image_url: "/assets/img/P.48.1.10.jpg",
  expedition: "Powell Expedition - Arizona (Hopi)",
  expedition_notes: "Part of Powell's Bureau of American Ethnology (BAE) survey to collect 'tangible tokens' of Hopi culture for the 1876 Philadelphia Centennial Exposition (World's Fair)"
},
  
"walpi-pueblo-4": {
  id: "walpi-pueblo-4",
  name: "Walpi Pueblo - Dance Rock",
  photographer: "Hillers",
  year: "1874-1875",
  catalog_ref: "P.48.1.12",
  description: "Dance Rock. Wolpi [Walpi]",
  coordinates: {
    latitude: 35.8367,
    longitude: -110.3921
  },
  elevation_feet: 6725,
  elevation_meters: 2050,
  camera: {
    viewpoint: {
      latitude: 35.8367,
      longitude: -110.3921,
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
  image_url: "/assets/img/P.48.1.12.jpg",
  expedition: "Powell Expedition - Arizona (Hopi)",
  expedition_notes: "Part of Powell's Bureau of American Ethnology (BAE) survey to collect 'tangible tokens' of Hopi culture for the 1876 Philadelphia Centennial Exposition (World's Fair)"
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
    image_url: "/assets/img/P.48.1.31.jpg",
    expedition: "Hayden Survey"
  },
  
  "walpi-pueblo-5": {
    id: "walpi-pueblo-5",
    name: "Walpi Pueblo - Weaving",
    photographer: "Hillers",
    year: "1879",
    catalog_ref: "P.48.1.22",
    description: "A Moki [Hopi] Weaving [Walpi]",
    coordinates: {
      latitude: 35.828917,
      longitude: -110.388440,
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
    image_url: "/assets/img/P.48.1.22.jpg",
    expedition: "Powell Expedition - BAE Survey of Arizona/New Mexico",
    expedition_notes: "Part of Powell's first act as Bureau of American Ethnology director after its establishment. Hillers was sent with James Stevenson and Frank Hamilton Cushing to photograph Pueblo peoples."
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
        latitude: 36.119348,
        longitude: -112.052281,
        elevation: 0 // Set appropriate elevation
      },
      bearing: -62.72,
      pitch: 87.51,
      zoom: 12.00,
      fov: 60 // Standard field of view
    },
    overlay: {
      opacity: 0.5,
      bounds: [
        [-112.1430, 36.0530],  // Southwest corner
        [-112.1100, 36.0560]   // Northeast corner
      ]
    },
    image_url: "/assets/img/GC_tribes.webp",
    expedition: "Powell Expedition - Arizona and Utah (1872)",
    expedition_notes: "Part of Powell's exploration of the Grand Canyon region"
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
    image_url: "null",
    expedition: "Powell Expedition - Nevada (1873)",
    expedition_notes: "Part of Powell's survey of Nevada, Utah, and Arizona regions"
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
    image_url: "null",
    expedition: "Powell Expedition - Arizona (1873, 1881)",
    expedition_notes: "Initial survey in 1873 as part of Powell's expedition to Utah, Nevada, and Arizona; return visit in 1881 for additional documentation"
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
    image_url: "null",
    expedition: "Powell Expedition - Utah (1874)",
    expedition_notes: "Documentation of Utah landscapes as part of Powell's ongoing surveys"
  },
  
 "colorado-river-grand-junction": {
  id: "colorado-river-grand-junction",
  name: "Cañon of Grand River, Utah",
  photographer: "Jackson",
  year: "1874–1875",
  catalog_ref: "Hayden Survey, Colorado Plateau Series",
  description: "ALthough this photo is actually from 1890, Jackson collected photographic documentation of the Colorado River corridor near Grand Junction, Colorado during the Hayden Geological Survey, this area represents one of the key access points to the lower Colorado River system from southwestern Colorado.",
  coordinates: {
    latitude: 39.1260,
    longitude: -108.7880,
  },
  elevation_feet: 4600,
  elevation_meters: 1402,
  camera: {
    viewpoint: {
      latitude: 39.120591,
      longitude: -108.788740,
      elevation: 0 // Set appropriate elevation
    },
    bearing: -172.59,
    pitch: 86.77,
    zoom: 16.52,
    fov: 60 // Standard field of view
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-108.5710, 39.0630],  // Southwest corner
      [-108.5600, 39.0680]   // Northeast corner
    ]
  },
  image_url: "/assets/img/ColoradoRiver.jpeg",
  expedition: "Hayden Survey"
},

  
 "indian-territory-oklahoma": {
  id: "indian-territory-oklahoma",
  name: "Indian Territory (Oklahoma)",
  photographer: "example",
  year: "1875",
  catalog_ref: "Smithsonian Centennial Collection, 1876",
  description: "Photographs and ethnographic records collected by John K. Hillers under direction of John Wesley Powell, documenting Indigenous nations in Indian Territory for the Smithsonian Institution's 1876 Centennial Exposition in Philadelphia. The expedition aimed to gather visual and cultural artifacts from the region, including portraits, dwellings, and ceremonial practices.",
  coordinates: {
    latitude: 35.4676,
    longitude: -97.5164
  },
  elevation_feet: 1197,
  elevation_meters: 365,
  camera: {
    viewpoint: {
      latitude: 35.4700,
      longitude: -97.5100,
      elevation: 1220
    },
    bearing: 180,        // Looking southward, referencing cultural/geographic heartlands
    pitch: -5,           // Slight downward tilt to emulate large-format ground camera
    zoom: 14.8,
    fov: 60              // Narrower FOV typical of 19th-century survey photography
  },
  overlay: {
    opacity: 0.5,
    bounds: [
      [-97.5300, 35.4550],  // Southwest corner
      [-97.5000, 35.4800]   // Northeast corner
    ]
  },
  image_url: "/assets/img/Oklahoma.jpg",
  expedition: "Powell Survey, Smithsonian Commission",
  expedition_notes: "Images and artifacts collected for the U.S. Centennial Exposition (Philadelphia, 1876). Focused on Indigenous communities relocated to Indian Territory, including Cherokee, Choctaw, Chickasaw, Creek, and Seminole Nations."
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
    image_url: "/assets/img/P.48.1.3.jpg",
    expedition: "Powell Expedition - BAE Survey of Arizona/New Mexico (1879)",
    expedition_notes: "Part of Powell's first act as Bureau of American Ethnology director. Hillers was sent with James Stevenson and Frank Hamilton Cushing to Arizona and New Mexico to survey archaeological 'ruins' and photograph the Pueblo peoples."
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
    image_url: "/assets/img/P.48.1.11.jpg",
    expedition: "Unknown Powell Expedition",
    expedition_notes: "Exact expedition date unknown, likely part of Hillers' documentation of Native American structures and dwellings"
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
    image_url: "null",
    expedition: "Post-Powell Expeditions",
    expedition_notes: "Later work after the Powell expeditions, documenting regions in Central Mexico"
  }
};

/**
 * Hillers' Expedition Timeline
 * From Jack Hiller's Diary of the Powell Expeditions 1871-1875
 */
export const hillersExpeditionTimeline = {
  "1871": {
    year: "1871",
    location: "Colorado River",
    description: "Initial expedition along the Colorado River with the Powell Survey",
    sites: []
  },
  "1872": {
    year: "1872",
    location: "Utah, Arizona (Grand Canyon)",
    description: "Exploration and documentation of the Grand Canyon region",
    sites: ["grand-canyon"]
  },
  "1873": {
    year: "1873",
    location: "Utah, Nevada, and Arizona",
    description: "Surveys across multiple western territories",
    sites: ["nevada", "arizona"]
  },
  "1874": {
    year: "1874",
    location: "Utah and Arizona",
    description: "Documentation of Utah landscapes and initial work at Hopi villages",
    sites: ["utah", "walpi-pueblo-2", "walpi-pueblo-3", "walpi-pueblo-4"]
  },
  "1875": {
    year: "1875",
    location: "Oklahoma \"Indian Territory\"",
    description: "Documentation of Indigenous peoples and artifacts for the Smithsonian Institution exhibition at the 1876 Philadelphia Centennial Exposition",
    sites: ["oklahoma-territory"]
  },
  "1876": {
    year: "1876",
    location: "Arizona (Hopi)",
    description: "Bureau of American Ethnology (BAE) survey to collect 'tangible tokens' of Hopi culture for the World's Fair in Philadelphia",
    sites: []
  },
  "1879": {
    year: "1879",
    location: "New Mexico (Zuni), Arizona (Hopi)",
    description: "BAE survey with James Stevenson and Frank Hamilton Cushing to Arizona and New Mexico to survey archaeological 'ruins' and photograph the Pueblo peoples. Powell's first act as the BAE director after its establishment.",
    sites: ["zuni-eagle", "walpi-pueblo-5"]
  },
  "1881": {
    year: "1881",
    location: "Arizona",
    description: "Return visit to Arizona for additional documentation",
    sites: ["arizona"]
  },
  "1880-1907": {
    year: "1880-1907",
    location: "Central Mexico",
    description: "Later work after the Powell expeditions, documenting regions in Central Mexico",
    sites: ["central-mexico"]
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
 * Get photos by expedition year
 */
export function getPhotosByExpeditionYear(year) {
  return Object.values(historicalPhotos).filter(photo => {
    if (photo.year === year) return true;
    
    // Handle range years like "1874-1875"
    if (photo.year && photo.year.includes("-")) {
      const [startYear, endYear] = photo.year.split("-").map(Number);
      const targetYear = Number(year);
      return targetYear >= startYear && targetYear <= endYear;
    }
    
    // Handle multiple years like "1873, 1881"
    if (photo.year && photo.year.includes(",")) {
      const years = photo.year.split(",").map(y => y.trim());
      return years.includes(year);
    }
    
    return false;
  });
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

/**
 * Get Hillers expedition timeline
 */
export function getHillersExpedition() {
  return hillersExpeditionTimeline;
}

/**
 * Get photos by expedition
 */
export function getPhotosByExpedition(expeditionName) {
  return Object.values(historicalPhotos).filter(
    photo => photo.expedition && photo.expedition.toLowerCase().includes(expeditionName.toLowerCase())
  );
}

/**
 * Get all expedition names
 */
export function getAllExpeditions() {
  const expeditions = new Set();
  Object.values(historicalPhotos).forEach(photo => {
    if (photo.expedition) {
      expeditions.add(photo.expedition);
    }
  });
  return Array.from(expeditions);
}