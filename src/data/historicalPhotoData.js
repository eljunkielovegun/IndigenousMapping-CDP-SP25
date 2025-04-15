// historicalPhotoData.js
/**
 * Historical photography locations with camera parameters for overlay positioning
 */

export const historicalPhotos = {
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
          latitude: 45.5461,
          longitude: -110.9215,
          elevation: 6420
        },
        bearing: 135,    // Southeast direction
        pitch: -5,       // Slightly downward looking at lake surface
        zoom: 14.2,      // Close enough to see details but capture mountains
        fov: 60         // Standard field of view
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
          latitude: 44.9785,
          longitude: -110.7045,
          elevation: 6300
        },
        bearing: 215,     // Southwest view looking down at the terraces
        pitch: -15,       // Looking down at the terraces
        zoom: 15.5,       // Close enough to see the terraces in detail
        fov: 65          // Wider field of view to capture valley beyond
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
          latitude: 44.7155,
          longitude: -110.4980,
          elevation: 7700
        },
        bearing: 65,     // Northeast view looking up the canyon
        pitch: -10,      // Looking slightly down at the falls
        zoom: 14.8,      // Close enough to see the falls and canyon details
        fov: 55         // Narrower field of view focusing on the falls in the canyon
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
          latitude: 39.466268,
          longitude: -106.478553,
          elevation: 13800
        },
        bearing: -109.27,  // Updated view of the mountain face
        pitch: 81.77,      // Steep upward view to capture the mountain
        zoom: 15.95,       // Closer zoom to focus on the details
        fov: 60            // Standard field of view
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
    "mancos-canyon": {
      id: "mancos-canyon",
      name: "Mancos Canyon",
      photographer: "Jackson",
      year: "1874-1875",
      catalog_ref: "P.48.1.30",
      description: "Ancient Ruins in the Canyon of the Mancos",
      coordinates: {
        latitude: 37.3352,
        longitude: -108.4338
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
          [-108.4360, 37.3340],  // Southwest corner
          [-108.4330, 37.3360]   // Northeast corner
        ]
      },
      image_url: "/assets/img/P.48.1.30.jpg"
    },
    "walpi-pueblo-1": {
      id: "walpi-pueblo-1",
      name: "Walpi Pueblo - Terraced Houses",
      photographer: "Hillers",
      year: "1879",
      catalog_ref: "P.48.1.20",
      description: "Terraced Houses at Wolpi [Walpi]",
      coordinates: {
        latitude: 35.8291,
        longitude: -110.3885
      },
      elevation_feet: 6225,
      elevation_meters: 1897,
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
          [-110.3895, 35.8285],  // Southwest corner
          [-110.3880, 35.8295]   // Northeast corner
        ]
      },
      image_url: "/assets/img/P.48.1.20.jpg"
    },
    "walpi-pueblo-2": {
      id: "walpi-pueblo-2",
      name: "Walpi Pueblo - Weaving",
      photographer: "Hillers",
      year: "1879",
      catalog_ref: "P.48.1.22",
      description: "A Moki [Hopi] Weaving [Walpi]",
      coordinates: {
        latitude: 35.8291,
        longitude: -110.3885
      },
      elevation_feet: 6225,
      elevation_meters: 1897,
      camera: {
        viewpoint: {
          latitude: 35.8292,
          longitude: -110.3883,
          elevation: 6230
        },
        bearing: 270,     // Looking west at the wall with the loom
        pitch: -5,        // Slightly downward to capture the weaver on the ground
        zoom: 19.8,       // Very close detailed view
        fov: 40          // Narrow field of view for detailed ethnographic documentation
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
          latitude: 37.3868,
          longitude: -109.3070,
          elevation: 5820
        },
        bearing: 75,      // East-northeast view of the ruins
        pitch: -5,        // Slightly downward to capture the ruins in foreground
        zoom: 16.8,       // Close enough to see the ruins with hillside backdrop
        fov: 60          // Standard field of view to include ruins and landscape
      },
      overlay: {
        opacity: 0.5,
        bounds: [
          [-109.3080, 37.3860],  // Southwest corner
          [-109.3050, 37.3880]   // Northeast corner
        ]
      },
      image_url: "/assets/img/P.48.1.31.jpg"
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