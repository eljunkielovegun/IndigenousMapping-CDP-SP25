/**
 * Utility to get the correct path for public assets in both development and production
 */

// Function to handle asset paths for both development and production
export function getAssetPath(path) {
  // If path already includes the base, don't modify it
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }

  // Remove any leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get the base URL from Vite
  // For GitHub Pages deployment, BASE_URL should be '/IndigenousMapping-CDP-SP25/'
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // For assets in the public folder, we need to construct the path correctly
  // Always make sure we have both base URL and clean path joined with exactly one slash
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  
  console.log(`Asset path: ${base + cleanPath} (base: ${baseUrl})`);
  return base + cleanPath;
}

/**
 * Camera information data with cleaned keys (no quotes)
 * This converts the JSON data to a JavaScript object with unquoted keys
 */
export const cameraInfo = {
  locations: [
    {
      id: "omaha-nebraska",
      name: "Omaha, Nebraska",
      photographer: "Jackson",
      year: "1867-1869",
      catalog_ref: "null",
      description: "Mystic Lake, Montana Territory",
      coordinates: {
        latitude: 41.2565,
        longitude: -87.637596
      },
      elevation_feet: 6398,
      elevation_meters: 1950,
      image_url: "null"
    },
    {
      id: "gallatin-headwaters",
      name: "Headwaters of the Gallatin Mountains",
      photographer: "Jackson",
      year: "1871, 1878",
      catalog_ref: "P.48.1.16",
      description: "Headwaters of the Gallatin Mountains",
      coordinates: {
        latitude: 45.0053,
        longitude: -110.8365
      },
      elevation_feet: 8500,
      elevation_meters: 2591,
      image_url: "public/assets/img/P.48.1.16.jpg"
    },
    {
      id: "mystic-lake",
      name: "Mystic Lake, M.T.",
      photographer: "Jackson",
      year: "1871, 1878",
      catalog_ref: "P.48.1.7",
      description: "Mystic Lake, Montana Territory",
      coordinates: {
        latitude: 45.2190,
        longitude: -109.7834
      },
      elevation_feet: 6398,
      elevation_meters: 1950,
      image_url: "public/assets/img/P.48.1.7.jpg",
      photoView: {
        viewpoint: {
          latitude: 45.543261,
          longitude: -110.920025,
          elevation: 0
        },
        bearing: 3.66,
        pitch: 84.73,
        zoom: 17.65,
        fov: 60 
      }
    },
    {
      id: "mammoth-hot-springs",
      name: "Mammoth Hot-Springs Gardiners River [Wyoming]",
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
      image_url: "public/assets/img/P.48.1.8.jpg",
      photoView: {
        viewpoint: {
          latitude: 44.966179,
          longitude: -110.709840,
          elevation: 0 
        },
        bearing: -162.95,
        pitch: 85.00,
        zoom: 17.26,
        fov: 60
      }
    },
    {
      id: "yellowstone-falls",
      name: "Great Falls of the Yellowstone",
      photographer: "Jackson",
      year: "1871-1872",
      catalog_ref: "P.48.1.9",
      description: "Great Falls of the Yellowstone",
      coordinates: {
        latitude: 44.7245,
        longitude: -110.7245
      },
      elevation_feet: 7500,
      elevation_meters: 2286,
      image_url: "public/assets/img/P.48.1.9.jpg",
      photoView: {
        viewpoint: {
          latitude: 44.717836,
          longitude: -110.495424,
          elevation: 0
        },
        bearing: -101.29,
        pitch: 84.07,
        zoom: 16.28,
        fov: 60
      }
    },
    {
      id: "grand-canyon",
      name: "Grand Canyon [Arizona]",
      photographer: "Hillers",
      year: "1872",
      catalog_ref: "null",
      description: "Grand Canyon [Arizona]",
      coordinates: {
        latitude: 39.4668,
        longitude: -106.4817
      },
      elevation_feet: 10000,
      elevation_meters: 3000,
      image_url: "null"
    },
    {
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
      image_url: "public/assets/img/P.48.1.2.jpg",
      photoView: {
        viewpoint: {
          latitude: 39.462634,
          longitude: -106.478730,
          elevation: 0
        },
        bearing: -126.63,
        pitch: 84.37,
        zoom: 14.07,
        fov: 60
      }
    },
    {
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
      image_url: "null"
    },
    {
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
      image_url: "null"
    },
    {
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
      image_url: "null"
    },
    {
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
      image_url: "public/assets/img/P.48.1.29.jpg",
      photoView: {
        viewpoint: {
          latitude: 37.337382,
          longitude: -108.444995,
          elevation: 0
        },
        bearing: -84.32,
        pitch: 82.48,
        zoom: 18.37,
        fov: 60
      }
    },
    {
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
      image_url: "public/assets/img/P.48.1.30.jpg"
    },
    {
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
      image_url: "public/assets/img/P.48.1.28.jpg",
      photoView: {
        viewpoint: {
          latitude: 37.288492,
          longitude: -108.474738,
          elevation: 0 
        },
        bearing: -125.22,
        pitch: 83.47,
        zoom: 17.15,
        fov: 60
      }
    },
    {
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
      image_url: "public/assets/img/P.48.1.20.jpg"
    },
    {
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
      image_url: "public/assets/img/P.48.1.10.jpg"
    },
    {
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
      image_url: "public/assets/img/P.48.1.12.jpg"
    },
    {
      id: "montezuma-canyon",
      name: "Montezuma Canyon",
      photographer: "Jackson",
      year: "1874-1875",
      catalog_ref: "P.48.1.31",
      description: "Ruins in the Montezuma Canyon",
      coordinates: {
        latitude: 31.3357, 
        longitude: -110.2301
      },
      elevation_feet: 5800,
      elevation_meters: 1768,
      image_url: "public/assets/img/P.48.1.31.jpg",
      photoView: {
        viewpoint: {
          latitude: 37.385507,
          longitude: -109.305991,
          elevation: 0
        },
        bearing: 5.98,
        pitch: 80.86,
        zoom: 18.66,
        fov: 60
      }
    },
    {
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
      image_url: "null"
    },
    {
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
      image_url: "null"
    },
    {
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
      image_url: "public/assets/img/P.48.1.22.jpg",
      photoView: {
        viewpoint: {
          latitude: 35.828917,
          longitude: -110.388440,
          elevation: 0
        },
        bearing: -42.22,
        pitch: 80.97,
        zoom: 19.81,
        fov: 60
      }
    },
    {
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
      image_url: "public/assets/img/P.48.1.3.jpg"
    },
    {
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
      image_url: "public/assets/img/P.48.1.11.jpg"
    },
    {
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
      image_url: "null"
    }
  ]
};

/**
 * Helper function to access camera information 
 */
export function getCameraInfo() {
  return cameraInfo;
}