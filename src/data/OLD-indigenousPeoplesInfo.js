/**
 * Function to extract and organize indigenous peoples information from text
 * @param {string} text - The raw text content to be parsed
 * @return {object} - Structured data organized by tribe and category
 */
function indigenousPeoplesInfo(text) {
    // Split the text by the main tribe sections
    const sections = text.split(/\n{5,}/);
    
    // Initialize the result object
    const result = {};
    
    // Process each tribe section
    sections.forEach(section => {
      // Skip empty sections
      if (!section.trim()) return;
      
      // Extract lines and remove empty ones
      const lines = section.split('\n').filter(line => line.trim());
      
      // The first non-empty line is the tribe name
      const tribeName = lines[0].trim();
      
      // Initialize tribe object
      result[tribeName] = {};
      
      // Initialize current category
      let currentCategory = null;
      let categoryContent = [];
      
      // Process each line starting from index 1 (skipping the tribe name)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if line is a category header
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line)) {
          // Save previous category if exists
          if (currentCategory && categoryContent.length > 0) {
            result[tribeName][currentCategory] = categoryContent.join('\n');
            categoryContent = [];
          }
          
          // Set new current category
          currentCategory = line;
          result[tribeName][currentCategory] = "";
        } 
        // Skip word count lines in parentheses
        else if (/^\[\d+\s+words\]$/.test(line) || /^\(\d+\s+words\)$/.test(line)) {
          continue;
        }
        // Regular content line
        else if (currentCategory && line) {
          // Don't include empty lines or word count annotations
          if (!line.match(/^\(\d+\s+words\)$/) && !line.match(/^\[\d+\s+words\]$/)) {
            categoryContent.push(line);
          }
        }
      }
      
      // Save the last category
      if (currentCategory && categoryContent.length > 0) {
        result[tribeName][currentCategory] = categoryContent.join('\n');
      }
    });
    
    return result;
  }
  
  // Pre-processed indigenous peoples data
  const indigenousData = {
    "Zuni": {
      "History": "In 1539, Esteban, an African slave from a shipwrecked Spanish vessel, \"discovered\" the Zuni. By 1540, Francisco Vásquez de Coronado followed Esteban's path and conquered the Zuni Pueblo for Spain. The Spanish established Santa Fe in 1610, and attempted to suppress Pueblo culture and religious practices. In 1680-1692, the Zuni and Hopi led the Pueblo Revolt, defeating the Spanish and forcing their withdrawal from Santa Fe. Though the Spanish later reclaimed the city, the revolt led to a more relaxed Spanish rule to prevent further uprisings.\n\nIn 1848, the Zuni were absorbed into the United States by the resolution of the Mexican-American War with no legal title to their land. In 1879, the Bureau of American Ethnology (BAE) focused on the Zuni in the first federally-funded anthropological study. The BAE considered the Zuni an ideal society to study given their resistance to conversion and the continuity of their core beliefs. Their ancient ruins and culture were believed to be key to revealing the origins of North American civilization. By the late 19th century, the Zuni had become a living laboratory for anthropologists.",

      "Culture": "The Zuni are a peaceful people who make up one of the major Pueblo tribes inhabiting the Southwestern region of the United States. Their villages featured stacked multi story homes, made of red adobe rock and accessible via ladders.\n\nZuni men played a dominant role in village life and took the role of spiritual leaders in charge of religious ceremonies and rituals while the women's role was focused on the home.\n\nThe Zuni were agriculturalists, stockbreeders, and skilled weavers, potters, and silversmiths. Life in the Pueblo consisted of yearly cycle farming, herding, and hunting.",

      "Origin Story": "The Zuni creation story tells of a journey from the \"unlovely place,\" interpreted as hell, to the \"Middle Place,\" or heaven. From four underground chambers, Zuni, not yet fully formed humans, emerged with the help of twin war gods, Āh-ai-ū-ta and Mā-ā-sē-we. The gods summoned a water creature to lie on the ground and mark the spot where its heart lay. This would be where the Middle Place, their destined home, would be. Their creation story emphasizes the importance of \"place\" in Zuni and a deep longing for a sense of belonging on earth.",

      "Religious Practices": "Kivas are underground spaces where Zuni priests performed rituals to bring healing, rain, bountiful harvests, and prosperous hunts. These sites are reserved for spiritual leaders (all men) who also participate in public dances where they wear Kachina costumes. The costumes, including paint, rattles, and mud masks, symbolize Zuni cosmology. Ceremonies marked seasonal cycles.\n\nThe Zuni are protective of their religious practices, fearing outsiders may exploitation by collectors and ethnographers has made them hesitant to share sacred knowledge.",

      "Location/Landscape": "The Zuni were a relatively isolated group residing in the valleys of New Mexico and Arizona. In times of conflict, the Zuni would move their people to the mountains and reside in cliff dwellings like their ancestors as a form of protection from predatory tribal groups and European and Spanish explorers. In one instance, the Zuni fled to the mountains during the Pueblo revolt against the Spanish from 1680 until 1692.\n\nZuni who first settled in Western New Mexico along the Rio Zuni – which flows into the Little Colorado River – established the village known as Tkāp-quē-nā, or Hot Spring. Some believe that this spring could be the origin place of the Zuni, sprung from the underworld through this natural pool.\n\nThe Zuni, like the Hopi, constructed villages of stacked homes made of flat stone and red adobe. They moved through pueblos via ladders and roof top entryways. The modern-day place of Zuni origin is called Chimik'yana'kya De'y'a, also known as Ribbon Falls on Bright Angel Creek located at the bottom of the Grand Canyon National Park."
    },
    "Hopi": {
      "History": "The Hopi have inhabited villages like Old Oraibi since 1150. Their ancestors are known as Histatsinom, or \"people of long ago.\" From 1540 to 1821, the Hopi endured Spanish attempts at conquest and conversion. From 1629 until 1680, the Hopi faced intense \"encomienda\", or forced labor. This period of Spanish control led to the Pueblo Revolts.\n\nIn 1858, Mormon Jacob Hamblin established relations with the Hopi, believing they were descendants of the Nephites from the Book of Mormon. This began decades of Mormon missions to the Pueblos. By 1874, Hopi chief Tuuvi allowed Hamblin to settle at Moenkopi. Soon after, Hamblin led Bureau of Ethnographer founder John Wesley Powell to the Hopi, marking the beginning of Hopi as subjects of anthropology. The constant flow of anthropologists to the Pueblos of the Southwest thus shaped the development of anthropology, and ethnography.",

      "Culture": "For centuries, Hopi have been talented weavers, potters, and jewelers. Weaving is traditionally done in the winter by men in kivas, with women and children helping in warmer seasons. The Hopi use geometric designs in their textiles, representing rain, clouds, and fertility from Hopi cosmology. Nampeyo, a young skilled Hopi potter when she was first photographed by William Henry Jackson, included intricate designs and geometric motifs in her work and traditional techniques of coiling clay.",

      "Origin Story": "The Hopi emerged from under the earth. They were instructed by Maasaw (earth or death god) that the earth was a gift to them, but they must be mindful and care for it. After emerging, the Hopi went in search for Tuuwanasavi, or the \"center place.\" As they journeyed, they placed spiral insignias to mark their path. They settled where a bright light had shown down on the land, the Hopitutskwa.",

      "Religious Practices": "Contemporary Hopi customs, including spiritual ceremonies, largely focus on commemorating the places that contributed to the development of Hopi society and religion. They also participate in historic preservation to protect their cultural interests. This includes the restoration of original Hopi place names to restore Hopi history erased by White cartographers.\n\nOne ancient sacred ceremony still practiced today is the Snake Dance. Hopi priests spend about eight or nine days in the kivas, practicing in secret. They believe that non-Hopi onlookers will spiritually disrupt the cosmic or tribal space, threatening to introduce evil and ill will to the ceremony and its practitioners.\n\nThe Hopi partake in pilgrimages every four years, experiencing history through visiting ancestral places. The Hopitutskwa is filled with itaakuku, or \"footprints of ancestors.\" The route includes the Grand Canyon, Zuni Salt Lake, and a 600-mile circuit of shrines in Arizona and Utah. These are of the places Hopi ancestors once settled. The land is remembered through ceremonies and stories.",

      "Location/Landscape": "Old Oraibi in Northern Arizona is believed to be the oldest continuously inhabited village in North America. It was settled in 1150. Near Oraibi, there is a sacred place known to the Hopi as Prophecy Rock. It includes an account of Koyaansquatsi, or \"world out of balance\", where the inhabitants of the earth are afflicted by disease, misery, and doubt, etched into the stone's face.\n\nHopi identify their ancestral dwelling places by symbols etched into rock and architectural ruins.\n\nThe Hopi Pueblo consists of three mesas, each of which includes independently governed villages. The First Mesa is known for producing pottery. The Second Mesa is known for its coiled pottery. The Third Mesa is known for basketry, weaving, Kachina doll carving, and silversmithing.\n\nOne sacred Hopi historic site is Kwayka'a, on Antelope Mountain. This is where it is believed the Hopi likely met the Spanish for the first time. Today, it is prohibited to use traditional archaeological methods here because it would violate the deep-seated Hopi ethics about disturbing the dead."
    },
    "Diné": {
      "History": "The Diné  live in the northeastern part of Arizona and the northwestern corner of New Mexico, surrounding the Hopi peoples' territory. They are also known as the Navajo, which originated from Spanish missionaries who called them Apaches de Nabajó.",

      "Culture": "The traditional Dine language is Diné Bizaad. Their language is not just a means of communication; it encapsulates core cultural principles like Hózhó, or balance, beauty, and harmony.\n\nFor the Dine, K'é (kinship) emphasizes that interconnectedness, respect, and reciprocal relationships are central to maintaining Diné culture and values.\n\nDiné principles include Sa'ah Naaghái Bik'eh Hózhóón, living in harmony with the natural world.",

      "Origin Story": "Tradition states that the Diné emerged from the \"lower worlds\" to inhabit Dinétah, the Diné ancestral homelands. Oral traditions are a daily custom and way of education as well as communication among the Diné. Their legendary lore is used to maintain traditional religious knowledge and tribal history, and Diné folklore is often used to teach moral and ethical lessons for children. It is also used as a way to connect as a community.\n\nThe Diyin Dine'é (Holy People) created the four sacred mountains to etch a protected area into the landscape for Diné to steward and practice their cultural ceremonies. The Diné's bond with the land is the foundation of tribal sovereignty. Diné express this sacred bond by affirming: \"We don't own the land; the land owns us.\"\n\nIt is said that all Diné people descended from the figure of Asdzáán Nádleehé, or \"changing woman.\" It is from Asdzáán Nádleehé that the four Diné clans originated.",

      "Religious Practices": "Diné ceremonies and prayers focus on maintaining balance and harmony, or Hózhóójí.",

      "Location/Landscape": "Dine ancestral homelands are marked by four sacred mountains Sisnaajini (Blanka Peak) and Dibé Ntsaa (Hesperus Peak) in Colorado, Tsoodzill (Mount Taylor) in New Mexico, and Dook'o'oosliid (the San Francisco Peaks) in Arizona."
    }
  };
  
  // Export the function and the pre-processed data
  export {
    indigenousPeoplesInfo,
    indigenousData
  };