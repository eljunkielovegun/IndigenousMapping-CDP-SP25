export function useViewState() {
  // Utah/Arizona border initial viewpoint
  return {
    longitude: -111.686256,
    latitude: 37.884571,
    zoom: 5.51,
    pitch: 32.91,
    bearing: -1.48,
    maxPitch: 85,
    minZoom: 1,
    maxZoom: 20,
    transitionDuration: 1000
  };
}