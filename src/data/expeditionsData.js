// Organized data for William Henry Jackson and John K. Hillers
export const photographerData = {
    jackson: [
      {
        year: "1867-1869",
        location: "Omaha, Nebraska",
        coordinates: "41.2565°N, 95.9345°W",
        photographer: "William Henry Jackson",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "1871/1878",
        location: "Cordillera Gallatin (Wyoming)",
        coordinates: "45.0053°N, 110.8365°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.16"],
        outsideImages: []
      },
      {
        year: "1871/1878",
        location: "Mystic Lake (Montana)",
        coordinates: "45.2210°N, 109.7837°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.7"],
        outsideImages: []
      },
      {
        year: "1871",
        location: "Mammoth Hot Springs (Wyoming)",
        coordinates: "44°58'34.79\"N, 110°42'03.37\"W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.8"],
        outsideImages: []
      },
      {
        year: "1871-1872",
        location: "Yellowstone",
        coordinates: "44.5979°N, 110.5612°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.9"],
        outsideImages: []
      },
      {
        year: "1873",
        location: "Mt. of the Holy Cross (Colorado)",
        coordinates: "39.4680°N, 106.4798°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.2"],
        outsideImages: []
      },
      {
        year: "1874-1875",
        location: "Mancos Canyon (Utah)",
        coordinates: "37.0461°N, 108.6956°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.29", "P.48.1.30"],
        outsideImages: []
      },
      {
        year: "1874-1875",
        location: "Walpi Pueblo (Arizona)",
        coordinates: "35.8302°N, 110.3894°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.28"],
        outsideImages: []
      },
      {
        year: "1874-1875",
        location: "Montezuma Canyon (Arizona)",
        coordinates: "35.05°N, 111.96°W OR 31.3357°N, 110.2301°W",
        photographer: "William Henry Jackson",
        collectionImages: ["P.48.1.31"],
        outsideImages: []
      },
      {
        year: "1874-1875",
        location: "Southwestern Colorado",
        coordinates: "",
        photographer: "William Henry Jackson",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "1880-1907",
        location: "Central Mexico",
        coordinates: "",
        photographer: "William Henry Jackson",
        collectionImages: [],
        outsideImages: []
      }
    ],
    hillers: [
      {
        year: "1872",
        location: "Utah, Arizona (Grand Canyon)",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "1873",
        location: "Utah, Arizona, Nevada",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "1873",
        location: "Utah, Arizona, Nevada",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "1874",
        location: "Utah",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "",
        location: "Walpi Pueblo (Arizona)",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: ["P.48.1.20"],
        outsideImages: []
      },
      {
        year: "",
        location: "Walpi Pueblo (Arizona)",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: ["P.48.1.10"],
        outsideImages: []
      },
      {
        year: "",
        location: "Walpi Pueblo (Arizona)",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: ["P.48.1.12"],
        outsideImages: []
      },
      {
        year: "1875",
        location: "Oklahoma \"Indian Territory\"",
        coordinates: "btwn 33.37°N & 37°N, 94.26°W & 103°W",
        photographer: "John K. Hillers",
        collectionImages: [],
        outsideImages: []
      },
      {
        year: "1876",
        location: "Arizona (Hopi)",
        coordinates: "35.8756°N, 110.6068°W",
        photographer: "John K. Hillers",
        collectionImages: ["P.48.1.22"],
        outsideImages: []
      },
      {
        year: "1879",
        location: "New Mexico (Zuni)",
        coordinates: "35.0695°N, 108.8484°W",
        photographer: "John K. Hillers",
        collectionImages: ["P.48.1.3"],
        outsideImages: []
      },
      {
        year: "",
        location: "Arizona (Diné)",
        coordinates: "36.12°N, 111.23°W",
        photographer: "John K. Hillers",
        collectionImages: ["P.48.1.11"],
        outsideImages: []
      },
      {
        year: "1881",
        location: "Arizona",
        coordinates: "",
        photographer: "John K. Hillers",
        collectionImages: [],
        outsideImages: []
      }
    ]
  };
  
  // Function to extract data by set name
  export function getPhotographerSet(setName) {
    if (setName.toLowerCase() === 'jackson') {
      return photographerData.jackson;
    } else if (setName.toLowerCase() === 'hillers') {
      return photographerData.hillers;
    } else {
      return null; // Return null for invalid set names
    }
  }
  
  // Function to extract data by specific criteria
  export function extractData(setName, criteria, value) {
    const dataset = getPhotographerSet(setName);
    
    if (!dataset) {
      return "Invalid set name. Please use 'jackson' or 'hillers'.";
    }
    
    if (!criteria) {
      return dataset; // Return the entire set if no criteria specified
    }
    
    // Filter by criteria
    return dataset.filter(item => {
      if (criteria === 'year') {
        return item.year === value;
      } else if (criteria === 'location') {
        return item.location.includes(value);
      } else if (criteria === 'coordinates') {
        return item.coordinates.includes(value);
      } else if (criteria === 'collectionImage') {
        return item.collectionImages.includes(value);
      } else {
        return false; // Invalid criteria
      }
    });
  }
  
  // Example usage:
  // Get all Jackson data
  // const jacksonSet = getPhotographerSet('jackson');
  
  // Get Hillers data from 1879
  // const hillersData1879 = extractData('hillers', 'year', '1879');
  
  // Get Jackson data from Yellowstone
  // const jacksonYellowstone = extractData('jackson', 'location', 'Yellowstone');
  
  // Find which set contains image P.48.1.10
  // const imageP48110 = extractData('hillers', 'collectionImage', 'P.48.1.10');