import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getIndigenousPeopleData } from '../../data/indigenousPeoplesInfo';
import './TribalInfoPanel.css';

/**
 * TribalInfoPanel component to display information about indigenous peoples
 * Styled with white text on semi-transparent background, using Aldine font for text
 */
const TribalInfoPanel = () => {
  const { appMode, storyType, STORY_TYPES, exitStoryMode } = useAppContext();
  
  // Determine which tribe to show based on active story type
  let tribeName = null;
  
  // Map story types to tribe names
  if (storyType === STORY_TYPES.DINE) tribeName = 'Diné';
  else if (storyType === STORY_TYPES.HOPI) tribeName = 'Hopi';
  else if (storyType === STORY_TYPES.ZUNI) tribeName = 'Zuni';
  
  // Get tribal information based on selected tribe
  const tribeData = tribeName ? getIndigenousPeopleData(tribeName) : null;
  
  // Don't render if not in story mode or no tribal data
  if (!tribeData || !tribeName) return null;

  return (
    <div className="tribal-info-panel">
      <div className="tribal-info-header">
        <h2 className="geographica-hand">{tribeData.title}</h2>
        <button className="close-button" onClick={exitStoryMode}>×</button>
      </div>
      <div className="tribal-info-content aldine-regular">
        {Object.entries(tribeData.sections).map(([sectionTitle, content]) => (
          <div key={sectionTitle} className="tribal-info-section">
            <h3>{sectionTitle}</h3>
            <div className="section-content">
              {content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TribalInfoPanel;