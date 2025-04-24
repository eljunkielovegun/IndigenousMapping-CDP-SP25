/**
 * Function to extract and organize information about the Bureau of American Ethnology
 * @param {string} text - Raw text with BAE information
 * @return {object} - Structured data about the BAE and ethnography
 */
function baeInfo(text) {
    // Initialize result object
    const result = {
      "ethnography_definition": "",
      "bureau_history": [],
      "john_wesley_powell": "",
      "tribal_connections": []
    };
    
    // Split text into sections by bullet points
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for section headers
      if (line.startsWith("What is ethnography?")) {
        currentSection = "ethnography_definition";
      } else if (line.startsWith("Bureau of Ethnography")) {
        currentSection = "bureau_history";
      } else if (line.includes("John Wesley Powell")) {
        currentSection = "john_wesley_powell";
      } else if (line.startsWith("Tribal Connections to Ethnography")) {
        currentSection = "tribal_connections";
      }
      
      // Process content based on current section
      if (line.startsWith("* ")) {
        const content = line.substring(2).trim();
        
        // Handle nested bullet points
        if (content.startsWith("* ")) {
          if (currentSection === "bureau_history" || currentSection === "tribal_connections") {
            // Add as a sub-item to the last item in the array
            const lastIndex = result[currentSection].length - 1;
            if (!result[currentSection][lastIndex].sub_points) {
              result[currentSection][lastIndex].sub_points = [];
            }
            result[currentSection][lastIndex].sub_points.push(content.substring(2).trim());
          }
        } else {
          // Add as a main point
          if (currentSection === "ethnography_definition") {
            result[currentSection] = content;
          } else if (currentSection === "john_wesley_powell") {
            if (result[currentSection]) {
              result[currentSection] += "\n" + content;
            } else {
              result[currentSection] = content;
            }
          } else if (currentSection === "bureau_history" || currentSection === "tribal_connections") {
            result[currentSection].push({
              point: content,
              sub_points: []
            });
          }
        }
      }
      // Handle title lines without bullet points
      else if (!line.includes("ETHNOGRAPHY") && !line.includes("*in master spreadsheet*")) {
        // Skip section headers that we already processed
        if (!line.startsWith("What is ethnography?") && 
            !line.startsWith("Bureau of Ethnography") && 
            !line.includes("John Wesley Powell") && 
            !line.startsWith("Tribal Connections to Ethnography")) {
          // This might be additional content for the current section
          if (currentSection) {
            if (typeof result[currentSection] === "string") {
              result[currentSection] += "\n" + line;
            } else if (Array.isArray(result[currentSection]) && result[currentSection].length > 0) {
              // Add to the last point in the array
              const lastIndex = result[currentSection].length - 1;
              result[currentSection][lastIndex].point += " " + line;
            }
          }
        }
      }
    }
    
    return result;
  }
  
  // Pre-processed BAE data
  const baeData = {
    "ethnography_definition": "At the time of the creation of the Bureau of Ethnography, ethnology was equivalent to what we today call anthropology.",
    
    "bureau_history": [
      {
        "point": "The Bureau of Ethnography and US Geological Survey (USGS) were created on March 3rd 1879 by an act of Congress to combine pre-existing surveys into a single organization and carry out anthropological fieldwork of these surveys under the administrative direction of the Smithsonian Institute.",
        "sub_points": [
          "The Smithsonian Institute intended to organize anthropological research in America with the creation of this new Bureau."
        ]
      },
      {
        "point": "The Bureau of Ethnography was renamed the Bureau of American Ethnography (BAE) in 1894 to emphasize the geographical limitation that had previously existed.",
        "sub_points": []
      },
      {
        "point": "At the time, it was believed that by White Americans settling in the western part of the United States, it would bring the end to the \"savage\" cultures and lifestyle of the Indigenous tribes that occupied and inhabited the region.",
        "sub_points": [
          "The ethnological surveys conducted served as a means to provide documentation to keep a record of these soon-to-be extinct groups."
        ]
      }
    ],
    
    "john_wesley_powell": "Originally into geology and ethnography\nStressed the importance of documenting the Indigenous peoples because of (what he believed to be) their fate of extinction",
    
    "tribal_connections": [
      {
        "point": "1879 – representatives of the BAE made the Zuni the focus of the first federally funded experiment in professional anthropology",
        "sub_points": [
          "Flow of anthropologists eager to document Zuni cultural practices lasted well into the 20th century",
          "First anthropologic expedition of the BAE in the Southwest",
          "Extensive use of photography and film documentation during early govt-led expeditions brought high level of visibility for the Native nations in Arizona, Colorado, New Mexico, and Utah",
          "The ancient cliff ruins, Pueblos, and Zuni people were seen as having potential to \"reveal the origins of civilization\" in North America",
          "This ignited popular romanticized imaginations about the Southwest as part of a national cultural treasure"
        ]
      },
      {
        "point": "The end of the 19th century – Zuni pueblo served as a living laboratory for a generation of anthropologists who documented this \"pre-industrial\" society while simultaneously defining a new profession (anthropology)",
        "sub_points": [
          "It was believed the Zuni would disappear or \"go extinct\"",
          "Ethnologists believed they could rescue the Zuni culture from \"pollution\" of contact with American culture",
          "They did so by collecting Zuni items"
        ]
      }
    ]
  };
  
  // Updated module exports to include all data and functions
  module.exports = {
 
    baeInfo,
    baeData
  };