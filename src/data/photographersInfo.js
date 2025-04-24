/**
 * Function to extract and organize photographer information from text
 * @param {string} text - Raw text with photographer information
 * @return {object} - Structured data about photographers
 */
function photographersInfo(text) {
    // Split the text by photographer sections
    const sections = text.split(/HILLERS:|JACKSON:/);
    
    // Initialize the result object
    const result = {
      "HILLERS": {},
      "JACKSON": {}
    };
    
    // Process Hillers section (index 1)
    if (sections[1]) {
      const hillersText = sections[1].trim();
      
      // Extract bio (paragraph before the bullet points)
      const bioEnd = hillersText.indexOf('* Born');
      if (bioEnd !== -1) {
        result["HILLERS"]["bio"] = hillersText.substring(0, bioEnd).trim();
      }
      
      // Extract personal details
      const birthMatch = hillersText.match(/\* Born ([^\n]+)/);
      if (birthMatch) {
        result["HILLERS"]["born"] = birthMatch[1].trim();
      }
      
      const deathMatch = hillersText.match(/\* Died ([^\n]+)/);
      if (deathMatch) {
        result["HILLERS"]["died"] = deathMatch[1].trim();
      }
      
      // Extract expeditions
      result["HILLERS"]["expeditions"] = [];
      
      // Look for expedition dates in the text
      const expeditionMatches = hillersText.match(/\* WORK:[^\*]*/s);
      if (expeditionMatches) {
        const expeditionText = expeditionMatches[0];
        const expeditionLines = expeditionText.split('\n').filter(line => line.trim());
        
        let currentRegion = null;
        
        for (const line of expeditionLines) {
          if (line.includes('WORK:')) continue;
          
          // Check if this is a new region
          if (line.trim().startsWith('*') && line.includes(':')) {
            currentRegion = line.replace('*', '').trim();
            result["HILLERS"]["expeditions"].push({
              region: currentRegion,
              years: []
            });
          } 
          // If we have a region, add years
          else if (currentRegion && line.trim().startsWith('*')) {
            const yearText = line.replace('*', '').trim();
            const lastExpedition = result["HILLERS"]["expeditions"][result["HILLERS"]["expeditions"].length - 1];
            lastExpedition.years.push(yearText);
          }
        }
      }
    }
    
    // Process Jackson section (index 2)
    if (sections[2]) {
      const jacksonText = sections[2].trim();
      
      // Extract bio (paragraph before the bullet points)
      const bioEnd = jacksonText.indexOf('Who are Jackson');
      if (bioEnd !== -1) {
        result["JACKSON"]["bio"] = jacksonText.substring(0, bioEnd).trim();
      }
      
      // Extract personal details
      const birthMatch = jacksonText.match(/\* Born ([^\n]+)/);
      if (birthMatch) {
        result["JACKSON"]["born"] = birthMatch[1].trim();
      }
      
      const deathMatch = jacksonText.match(/\* Died ([^\n]+)/);
      if (deathMatch) {
        result["JACKSON"]["died"] = deathMatch[1].trim();
      }
      
      // Extract timeline
      result["JACKSON"]["timeline"] = [];
      
      const timelineMatch = jacksonText.match(/\* Timeline summary:[^\*]*/s);
      if (timelineMatch) {
        const timelineText = timelineMatch[0];
        const timelineItems = timelineText.split('\n').filter(line => line.trim() && !line.includes('Timeline summary'));
        
        for (const item of timelineItems) {
          if (item.includes('–')) {
            const [years, description] = item.split('–').map(s => s.trim());
            const yearRange = years.replace('*', '').trim();
            
            const timelineEntry = {
              years: yearRange,
              description: description,
              photos: []
            };
            
            // Look for photo references in following lines
            const photoLines = [];
            const itemIndex = timelineItems.indexOf(item);
            
            for (let i = itemIndex + 1; i < timelineItems.length; i++) {
              if (timelineItems[i].includes('P.48.1.')) {
                photoLines.push(timelineItems[i]);
              } else if (timelineItems[i].includes('–')) {
                break;
              }
            }
            
            // Add photos to the timeline entry
            for (const photoLine of photoLines) {
              const photoMatch = photoLine.match(/\* (P\.48\.1\.\d+) – (.+)/);
              if (photoMatch) {
                timelineEntry.photos.push({
                  id: photoMatch[1],
                  description: photoMatch[2]
                });
              }
            }
            
            result["JACKSON"]["timeline"].push(timelineEntry);
          }
        }
      }
    }
    
    return result;
  }
  
  // Updated photographers data with region keys added to Hillers' timeline
const updatedPhotographersData = {
    "HILLERS": {
      "bio": "John Karl Hillers was a pivotal early American photographer whose work helped shape the understanding of the American West. He spent his career as a government photographer, starting as a boatman and later becoming photographer-in-chief for John Wesley Powell's survey expeditions. In 1872, Hillers began documenting Indigenous cultures, including the Zuni and San Juan Pueblo peoples. His 1879-1880 survey in New Mexico and Arizona produced many iconic images of the Zuni and Rio Grande Pueblos. Hillers' photographs of architecture, daily life, and rituals were used by the Bureau of Ethnography to document and preserve traditional ways of life. His work remains an important reference for the study of these cultures.",
      "born": "1843 Hanover, Germany",
      "died": "1925 Washington, DC",
      "career": "First staff photographer for Department of Ethnology, 1879-1900",
      "significance": "His images aided in the conceptualization of the \"American West\". Spent his entire career as a government photographer \"working for agencies dedicated to increasing knowledge\" including the Bureau of Ethnography and the USGS. Worked under John Wesley Powell, first as a \"boatman\" on survey team, then shadowed photographers on the surveys and eventually became Powell's assistant, and by 1872 he was the expeditions photographer-in-chief.",
      "timeline": [
        {
          "year": "1871",
          "description": "John Wesley Powell's second survey of the Colorado River. Hillers joins as a \"boatman\" and begins taking photographs - mostly landscapes.",
          "region": "Landscapes",
          "subjects": []
        },
        {
          "year": "1872",
          "description": "In the fall, \"at the request of the Western lands survey,\" Hillers transitions from photographing landscapes to photographing Indigenous people, specifically the Zuni and San Juan Pueblo peoples.",
          "region": "Zuni",
          "subjects": ["Zuni", "San Juan Pueblo"]
        },
        {
          "year": "1876",
          "description": "Hillers joins BAE expedition to Arizona to photograph Hopi for the Centennial Indian Exhibit.",
          "region": "Hopi",
          "subjects": ["Hopi"]
        },
        {
          "year": "1879",
          "description": "Hillers joins John Wesley Powell on surveys for the BAE.",
          "region": "Various",
          "subjects": []
        },
        {
          "year": "1879-1880",
          "description": "Hillers accompanies a survey run by the Bureau of Ethnology in what is now New Mexico and Arizona where he photographed the \"Canyon de Chelly, the Rio Grande pueblos, and Zuni.\"",
          "region": "New Mexico/Arizona",
          "subjects": ["Zuni", "Diné (Navajo)", "Rio Grande Pueblos"]
        },
        {
          "year": "1879-1882",
          "description": "Extended documentation of Zuni Pueblo.",
          "region": "Zuni",
          "subjects": ["Zuni"]
        },
        {
          "year": "1881",
          "description": "Hillers transferred to USGS, and served as its chief photographer until his retirement in 1900.",
          "region": "Various",
          "subjects": []
        }
      ]
    },
    // Jackson data remains the same
    "JACKSON": {
      "bio": "William Henry Jackson is renowned for photographing the geological wonders of Yellowstone, helping to establish National Parks. After serving in the Civil War, he worked as a bullwhacker before settling in Nebraska, where he began photographing Indigenous people. His work caught the attention of Dr. Ferdinand Hayden, leading to Jackson's participation in the 1871 Hayden Geological Expedition. It was on this expedition that Jackson's iconic photo of Mount of the Holy Cross was taken in 1873. He served as the official photographer for the U.S. Geological Survey until 1878, then opened a studio in Denver, Colorado. His photography played a key role in documenting the American West's natural beauty.",
      "born": "1843 upstate NY",
      "died": "1942 New York, NY",
      "career": "US Geological Survey, 1870s",
      "timeline": [
        {
          "years": "1867-1879",
          "description": "Omaha Nebraska, hired to do photography work for the Union Pacific Railway project",
          "photos": []
        },
        {
          "years": "1871-1872",
          "description": "expedition to Yellowstone with USGS",
          "photos": [
            {
              "id": "P.48.1.9",
              "description": "Great Falls of the Yellowstone"
            },
            {
              "id": "P.48.1.8",
              "description": "Mammoth Hot-Springs Gardiners River [Wyoming]"
            }
          ]
        },
        {
          "years": "1873",
          "description": "Works with USGS of Colorado",
          "photos": []
        },
        {
          "years": "1874-1875",
          "description": "photographed Walpi Pueblo in Arizona, photos of Mancos Canyon in Utah/Southwestern Colorado, Montezuma Canyon photos",
          "photos": [
            {
              "id": "P.48.1.31",
              "description": "Ruins in the Montezuma Canyon"
            },
            {
              "id": "P.48.1.28",
              "description": "[The Pueblo of Walpi on the East Mesa opposite Tewa]"
            },
            {
              "id": "P.48.1.30",
              "description": "Ancient Ruins in the Canyon of the Mancos"
            }
          ]
        },
        {
          "years": "1880-1907",
          "description": "worked for the Central Mexican Railway",
          "photos": []
        }
      ]
    }
  };
  
  // Updated module exports to include all data and functions
  export const photographersData = updatedPhotographersData;