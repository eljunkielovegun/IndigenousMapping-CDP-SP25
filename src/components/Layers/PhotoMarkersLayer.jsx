// src/components/Layers/PhotoMarkersLayer.jsx
import { ScatterplotLayer } from '@deck.gl/layers';
import { getAllPhotos } from '../../data/historicalPhotoData';

export default function createPhotoMarkersLayer({ onPhotoSelect = () => {} } = {}) {
  const photos = getAllPhotos();
  
  return new ScatterplotLayer({
    id: 'photo-markers',
    data: photos,
    pickable: true,
    opacity: 1,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 6,
    radiusMaxPixels: 12,
    lineWidthMinPixels: 1,
    getPosition: d => [d.coordinates.longitude, d.coordinates.latitude],
    getRadius: d => 5,
    getFillColor: d => d.photographer === "Jackson" ? [255, 87, 51, 255] : [75, 144, 226, 255],
    getLineColor: [255, 255, 255, 200],
    onClick: (info) => {
      if (info.object) {
        onPhotoSelect(info.object.id);
      }
    },
    // Optional tooltip
    getTooltip: ({object}) => object && `${object.name} (${object.year})\nPhotographer: ${object.photographer}`,
  });
}