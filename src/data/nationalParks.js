/**
 * Function to extract and structure information about National Parks and their indigenous connections
 * @param {string} text - Raw text containing National Parks information
 * @return {object} - Structured data about National Parks
 */
function nationalParksIndigenousInfo(text) {
    // Split the text by park sections
    const lines = text.split('\n').filter(line => line.trim());
    
    // Initialize result and tracking variables
    const result = {};
    let currentPark = null;
    let description = [];
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip header line
      if (line === "Current National Parks") {
        continue;
      }
      
      // Skip word count annotations
      if (line.match(/^\[\d+\s+words\]$/)) {
        continue;
      }
      
      // Check if line is a new park name
      if (!line.includes(" ") || (line.split(" ").length <= 4 && !line.match(/^\[/) && !description.length)) {
        // Save previous park description if exists
        if (currentPark && description.length) {
          result[currentPark] = description.join('\n');
          description = [];
        }
        
        // Set new current park
        currentPark = line;
        result[currentPark] = "";
      } else if (currentPark) {
        // Add to current park description
        description.push(line);
      }
    }
    
    // Add the last park description
    if (currentPark && description.length) {
      result[currentPark] = description.join('\n');
    }
    
    return result;
  }
  
  // Pre-processed National Parks indigenous connections data
  const nationalParksData = {
    "Yellowstone National Park": "For thousands of years, what is now called Yellowstone was a place for hunting, fishing, and gathering plants for the Crow, Blackfeet, Shoshone, Bannock, Kiowa, and other tribal groups. It was a religious site where thermal waters were collected for medicinal and spiritual uses.",
    
    "Grand Canyon": "Eleven tribal communities have connections to what is now called the Grand Canyon – *Havasu'baaja *(Havasupai Tribe), Hopi Tribe,* Hwal'bay* (Hualapi Tribe), *Nugwu* (Kaibab Band of Paiute Indians), Las Vegas Paiute Indians, Moapa Band of Paiute Indians, *Diné* (Navajo Nation), Paiute Indian Tribe of Utah, San Juan Southern Paiute Tribe, *A:shiwi* (The Pueblo of Zuni), and *Yavap'e - Nnéé* (Yavapai-Apache Nation).",
    
    "Chaco Culture National Park": "Chaco was a thriving regional epicenter for the ancestral Pueblo tribes from 850 to 1250. It continues to be a sacred space for Indigenous peoples."
  };