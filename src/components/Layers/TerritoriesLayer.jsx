import React, { useState, useEffect } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { getIndigenousPeopleData } from '../../data/indigenousPeoplesInfo';
import { useAppContext } from '../../hooks/useAppContext';

/**
 * Create a territories layer using GeoJSON data 
 * showing indigenous territories with mouse interaction
 */
const TerritoriesLayer = ({ territoriesVisible, onTerritoryHover, onTerritoryClick }) => {
  const [hopiData, setHopiData] = useState(null);
  const [zuniData, setZuniData] = useState(null);
  const [navajoData, setNavajoData] = useState(null);
  const [hoveredTerritoryName, setHoveredTerritoryName] = useState(null);
  const { appMode, storyType, STORY_TYPES } = useAppContext();

  // Load territory GeoJSON data
  useEffect(() => {
    // Load Hopi Territory
    import('../../data/territories/hopi.json')
      .then(data => setHopiData(data.default || data))
      .catch(error => console.error('Error loading Hopi data:', error));

    // Load Zuni Territory
    import('../../data/territories/zuni.json')
      .then(data => setZuniData(data.default || data))
      .catch(error => console.error('Error loading Zuni data:', error));

    // Load Navajo (Diné) Territory
    import('../../data/territories/navajo.json')
      .then(data => setNavajoData(data.default || data))
      .catch(error => console.error('Error loading Navajo data:', error));
  }, []);

  const layers = [];

  if (hopiData && territoriesVisible.hopi) {
    const isActiveStory = storyType === STORY_TYPES.HOPI;
    
    // Create Hopi territory layer
    layers.push(
      new GeoJsonLayer({
        id: 'hopi-territory',
        data: hopiData,
        pickable: true,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 3,
        getLineColor: [143, 52, 127, 230], // Purple for Hopi
        getFillColor: [143, 52, 127, isActiveStory ? 150 : 75],
        getLineWidth: isActiveStory ? 3 : 2,
        lineJointRounded: true,
        onHover: (info) => {
          if (info.object) {
            setHoveredTerritoryName('Hopi');
            if (onTerritoryHover) onTerritoryHover('Hopi', getIndigenousPeopleData('Hopi'));
          } else if (hoveredTerritoryName === 'Hopi') {
            setHoveredTerritoryName(null);
            if (onTerritoryHover) onTerritoryHover(null, null);
          }
        },
        onClick: (info) => {
          if (info.object && onTerritoryClick) {
            onTerritoryClick('Hopi', getIndigenousPeopleData('Hopi'));
          }
        }
      })
    );
  }

  if (zuniData && territoriesVisible.zuni) {
    const isActiveStory = storyType === STORY_TYPES.ZUNI;
    
    // Create Zuni territory layer
    layers.push(
      new GeoJsonLayer({
        id: 'zuni-territory',
        data: zuniData,
        pickable: true,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 3,
        getLineColor: [82, 92, 235, 230], // Blue for Zuni
        getFillColor: [82, 92, 235, isActiveStory ? 150 : 75],
        getLineWidth: isActiveStory ? 3 : 2,
        lineJointRounded: true,
        onHover: (info) => {
          if (info.object) {
            setHoveredTerritoryName('Zuni');
            if (onTerritoryHover) onTerritoryHover('Zuni', getIndigenousPeopleData('Zuni'));
          } else if (hoveredTerritoryName === 'Zuni') {
            setHoveredTerritoryName(null);
            if (onTerritoryHover) onTerritoryHover(null, null);
          }
        },
        onClick: (info) => {
          if (info.object && onTerritoryClick) {
            onTerritoryClick('Zuni', getIndigenousPeopleData('Zuni'));
          }
        }
      })
    );
  }

  if (navajoData && territoriesVisible.navajo) {
    const isActiveStory = storyType === STORY_TYPES.DINE;
    
    // Create Navajo (Diné) territory layer
    layers.push(
      new GeoJsonLayer({
        id: 'navajo-territory',
        data: navajoData,
        pickable: true,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 3,
        getLineColor: [224, 76, 76, 230], // Red for Navajo/Diné
        getFillColor: [224, 76, 76, isActiveStory ? 150 : 75],
        getLineWidth: isActiveStory ? 3 : 2,
        lineJointRounded: true,
        onHover: (info) => {
          if (info.object) {
            setHoveredTerritoryName('Diné');
            if (onTerritoryHover) onTerritoryHover('Diné', getIndigenousPeopleData('Diné'));
          } else if (hoveredTerritoryName === 'Diné') {
            setHoveredTerritoryName(null);
            if (onTerritoryHover) onTerritoryHover(null, null);
          }
        },
        onClick: (info) => {
          if (info.object && onTerritoryClick) {
            onTerritoryClick('Diné', getIndigenousPeopleData('Diné'));
          }
        }
      })
    );
  }

  return layers;
};

export default TerritoriesLayer;