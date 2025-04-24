import { useState } from 'react';

// Define home view state as a constant
export const HOME_VIEW_STATE = {
  longitude: -109.428630,
  latitude: 37.743507,
  zoom: 6.51,
  pitch: 51.55,
  bearing: -19.10,
  maxPitch: 89, // Increased from 85 to allow almost first-person view
  minPitch: 0,
  minZoom: 1,
  maxZoom: 20,
  fov: 60 // Standard field of view
  // Removed transitionDuration to avoid conflicts with FlyToInterpolator
};

export function useViewState() {
  // Updated initial viewpoint based on historicalPhotoData.js camera settings
  return HOME_VIEW_STATE;
}

export function useHomeViewState() {
  const [currentViewState, setCurrentViewState] = useState(HOME_VIEW_STATE);
  
  // Function to return to home view (with optional transition)
  const goToHomeView = (transitionOptions = {}) => {
    const defaultTransition = {
      transitionDuration: 3000,
    };
    
    return {
      ...HOME_VIEW_STATE,
      ...defaultTransition,
      ...transitionOptions
    };
  };
  
  return {
    currentViewState,
    setCurrentViewState,
    HOME_VIEW_STATE,
    goToHomeView
  };
}