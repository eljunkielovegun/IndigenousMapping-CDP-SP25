/**
 * Indigenous Peoples Information
 * A data module containing structured information about Indigenous peoples,
 * their histories, origin stories, and connection to the landscape.
 */

// Main data structure for indigenous peoples information
const indigenousPeoplesData = {
  "Zuni": {
    "title": "Zuni: \"Living Laboratory\"",
    "coordinates": {
      "latitude": 35.0695,
      "longitude": -108.8484,
      "location": "New Mexico"
    },
    "photos": {
      "landscape": "P.48.1.13",
      "portrait": "P.48.1.24"
    },
    "sections": {
      "History": "In 1539, Esteban, an African slave from a shipwrecked Spanish vessel, \"discovered\" the Zuni. By 1540, Francisco Vásquez de Coronado followed Esteban's path and conquered the Zuni Pueblo for Spain. Pueblo culture and religious practices were suppressed with the establishment of Santa Fe by the Spanish in 1610. From 1680-1692, the Zuni and Hopi led the Pueblo Revolt, defeating the Spanish and forcing their withdrawal from Santa Fe. By 1848, the Zuni were absorbed into the United States by the resolution of the Mexican-American War with no legal title to their land, and in 1877 the Zuni Reservation was established.\n\nIn 1879, the Bureau of American Ethnology (BAE) focused on the Zuni in the first federally-funded anthropological study. The Zuni were considered to be an ideal society to study given their resistance to conversion and the continuity of their core beliefs. Their ancient ruins and culture were believed to be key to revealing the origins of North American civilization. By the late 19th century, the Zuni had become a living laboratory for anthropologists.",
      "Origin Story": "The Zuni creation story tells of a journey from the \"unlovely place,\" interpreted as hell, to the \"Middle Place,\" or heaven. From four underground chambers, Zuni, not yet fully formed humans, emerged with the help of twin war gods, Āh-ai-ū-ta and Mā-ā-sē-we. The gods summoned a water creature to lie on the ground and mark the spot where its heart lay, signifying where their destined home would be. Their creation story emphasizes the importance of \"place\" in Zuni and a deep longing for a sense of belonging on earth.",
      "Landscape / Location": "The present-day place of Zuni origin is called Chimik'yana'kya De'y'a, also known as Ribbon Falls, on Bright Angel Creek located at the bottom of the Grand Canyon National Park.\n\nZuni who first settled in western New Mexico along the Rio Zuni – which flows into the Little Colorado River – established the village known as Tkāp-quē-nā, or Hot Spring. Some believe that this spring could be the origin place of the Zuni, sprung from the underworld through this natural pool."
    },
    "visual_references": {
      "Coronado attacking Zuni-Cibola": true,
      "BAE Reports": true,
      "Ribbon Falls": true,
      "Hot Spring (Tkāp-quē-nā)": true
    }
  },
  
  "Hopi": {
    "title": "Hopi: \"People of Long Ago\"",
    "coordinates": {
      "latitude": 35.8756,
      "longitude": -110.6068,
      "location": "Arizona"
    },
    "photos": {
      "landscape": "P.48.1.20",
      "portrait": "p.48.1.5"
    },
    "sections": {
      "History": "The Hopi have inhabited villages like Old Oraibi since 1150. Their ancestors are known as Histatsinom, or \"people of long ago.\" From 1540 to 1821, the Hopi endured Spanish attempts at conquest and conversion. From 1629 until 1680, the Hopi faced intense \"encomienda\", or forced labor. This period of Spanish control led to the Pueblo Revolts.\n\nIn 1858, Mormon Jacob Hamblin established relations with the Hopi, believing they were descendants of the Nephites from the Book of Mormon. This began decades of Mormon missions. By 1874, Hopi chief Tuuvi allowed Hamblin to settle at Moenkopi. Hamblin then led Bureau of Ethnographer founder John Wesley Powell to the Hopi, marking the beginning of Hopi as subjects of anthropology. These interactions shaped the early decades of anthropology.",

      "Origin Story": "The Hopi emerged from under the earth. They were instructed by Maasaw (earth or death god) that the earth was a gift to them, but they must be mindful and care for it. After emerging, the Hopi went in search for Tuuwanasavi, or the \"center place.\" As they journeyed, they placed spiral insignias to mark their path. They settled where a bright light had shown down on the land, the Hopitutskwa.",

      "Landscape / Location": "Old Oraibi in Northern Arizona is believed to be the oldest continuously inhabited village in North America. It was settled in 1150. Near Oraibi, there is a sacred place known to the Hopi as Prophecy Rock. It includes an account of Koyaansquatsi, or \"world out of balance\", where the inhabitants of the earth are afflicted by disease, misery, and doubt, etched into the stone's face."
    },
    "visual_references": {
      "Old Oraibi": true,
      "Mormon Jacob Hamblin": true,
      "Image depicting Nephi being baptized according to the LDS scripture": true,
      "Oraibi Terraced Homes": true,
      "Prophecy Rock": true
    }
  },
  
  "Diné": {
    "title": "Diné: \"Stewards of the Earth\"",
    "coordinates": {
      "latitude": 36.12,
      "longitude": -111.23,
      "location": "Arizona"
    },
    "photos": {
      "landscape": "P.48.1.11",
      "portrait": "P.48.1.1"
    },
    "sections": {
      "History": "The Diné live in the northeastern part of Arizona and the northwestern corner of New Mexico, surrounding the Hopi peoples' territory. They are also known as the Navajo, which originated from Spanish missionaries who called them Apaches de Nabajó.",
      "Origin Story": "Tradition states that the Diné emerged from the \"lower worlds\" to inhabit Dinétah, the Diné ancestral homelands. Oral traditions are a daily custom and way of education as well as communication among the Diné. Their legendary lore is used to maintain traditional religious knowledge and tribal history, and Diné folklore is often used to teach moral and ethical lessons for children. It is also used as a way to connect as a community.",
      "Landscape / Location": "Dine ancestral homelands are marked by four sacred mountains created by Diyin Dine'é (Holy People) – Sisnaajini (Blanka Peak) and Dibé Ntsaa (Hesperus Peak) in Colorado, Tsoodzill (Mount Taylor) in New Mexico, and Dook'o'oosliid (the San Francisco Peaks) in Arizona. These mountains etched a protected area into the landscape for Diné to steward and practice their cultural ceremonies."
    },
    "visual_references": {
      "Artistic Rendering of Origin Story": true,
      "Sisnaajini (Blanca Peak)": true,
      "Diné Ntsaa (Hesperus Peak)": true,
      "Tsoodzill (Mount Taylor)": true,
      "Dook'o'oosliid (San Francisco Peaks)": true
    }
  }
};

/**
 * Function to get all indigenous peoples data
 * @return {object} Complete data structure with all peoples
 */
function getAllIndigenousPeoplesData() {
  return indigenousPeoplesData;
}

/**
 * Function to get data for a specific indigenous people
 * @param {string} name - Name of the indigenous people (Zuni, Hopi, or Diné)
 * @return {object|null} Data for the specified people or null if not found
 */
function getIndigenousPeopleData(name) {
  return indigenousPeoplesData[name] || null;
}

/**
 * Function to get all people within a geographic bounding box
 * @param {number} minLat - Minimum latitude
 * @param {number} minLon - Minimum longitude
 * @param {number} maxLat - Maximum latitude
 * @param {number} maxLon - Maximum longitude
 * @return {array} Array of people within the bounding box
 */
function getPeoplesInBoundingBox(minLat, minLon, maxLat, maxLon) {
  return Object.entries(indigenousPeoplesData)
    .filter(([_, data]) => {
      const lat = data.coordinates.latitude;
      const lon = data.coordinates.longitude;
      return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
    })
    .map(([name, data]) => ({
      name,
      coordinates: data.coordinates,
      title: data.title
    }));
}

/**
 * Function to search for content within the indigenous peoples data
 * @param {string} searchTerm - Term to search for
 * @return {object} Search results organized by people and section
 */
function searchIndigenousContent(searchTerm) {
  const results = {};
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  Object.entries(indigenousPeoplesData).forEach(([people, data]) => {
    const peopleResults = {};
    let hasResults = false;
    
    Object.entries(data.sections).forEach(([section, content]) => {
      if (content.toLowerCase().includes(lowerSearchTerm)) {
        peopleResults[section] = content;
        hasResults = true;
      }
    });
    
    if (hasResults) {
      results[people] = peopleResults;
    }
  });
  
  return results;
}

// Export functions for use in other modules
export {
  getAllIndigenousPeoplesData,
  getIndigenousPeopleData,
  getPeoplesInBoundingBox,
  searchIndigenousContent,
  indigenousPeoplesData
};