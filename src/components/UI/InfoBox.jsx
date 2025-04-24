import React from 'react';
import './InfoBox.css';

/**
 * InfoBox component to display information about indigenous peoples
 * Styled with white text on semi-transparent background, using Aldine font for text
 */
const InfoBox = ({ peopleData, onClose, isVisible }) => {
  if (!peopleData || !isVisible) return null;

  const { title, sections } = peopleData;

  return (
    <div className="info-box">
      <div className="info-box-header">
        <h2>{title}</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      <div className="info-box-content">
        {Object.entries(sections).map(([sectionTitle, content]) => (
          <div key={sectionTitle} className="info-section">
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

export default InfoBox;