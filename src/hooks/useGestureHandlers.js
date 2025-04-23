import { useGesture } from '@use-gesture/react';
import { useViewState } from './deck/useViewState';
import { FlyToInterpolator } from '@deck.gl/core';

// Gesture handlers for touch and mouse controls
export function useGestureHandlers(setViewState, setSelectedPhotoId, setShowInfoPanel, setInfoPanelOpacity) {
  // Get the initial/home view state
  const homeViewState = useViewState();
  
  // Calculate a threshold for swipe detection
  const SWIPE_THRESHOLD = 100; // px
  const DRAG_THRESHOLD = 200; // px
  
  // Function to return to home view state
  const goToHomeView = () => {
    // Close any open photo info panel
    if (setSelectedPhotoId) {
      setSelectedPhotoId(null);
    }
    
    // Set up timing constants
    const transitionDuration = 3000;
    const fadeInDuration = 300;
    
    // Get the current view state to check zoom level
    const currentViewState = window.deckInstance?.deck?.viewState || {};
    const currentZoom = currentViewState.zoom || 0;
    
    // Only show the info panel if we're going back to a zoomed-out view (zoom < 7.5)
    if (homeViewState.zoom < 7.5) {
      // First make panel visible (but transparent)
      if (setShowInfoPanel) {
        setShowInfoPanel(true);
      }
      
      // Start the fade-in so it completes at the same time as the transition
      setTimeout(() => {
        if (setInfoPanelOpacity) {
          setInfoPanelOpacity(1); // Start fade-in animation
        }
      }, transitionDuration - fadeInDuration); // Sync the end of fade with end of transition
    }
    
    // Return to the initial view state with a smooth transition
    setViewState({
      ...homeViewState,
      transitionDuration: transitionDuration, 
      transitionInterpolator: new FlyToInterpolator({
        speed: 1.2,
        curve: 1.5,
        screenSpeed: 15,
        maxDuration: transitionDuration
      }),
      transitionEasing: t => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
    });
  };
  
  return {
    // Return the gesture bindings
    gestureBindings: useGesture({
      // Handle dragging (for click-and-drag left)
      onDrag: ({ delta: [dx, dy], direction: [dirX], touches, first, movement: [mx] }) => {
        // If this is a three-finger swipe left
        if (touches === 3 && dirX < 0) {
          if (mx < -SWIPE_THRESHOLD) {
            goToHomeView();
          }
        } 
        // If this is a click-and-drag left (long drag)
        else if (touches === 1 && dirX < 0) {
          if (mx < -DRAG_THRESHOLD) {
            goToHomeView();
          }
        }
      }
    }),
    
    // Export the goToHomeView function so it can be used for a home button
    goToHomeView
  };
}
