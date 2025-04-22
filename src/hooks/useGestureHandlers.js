import { useGesture } from '@use-gesture/react';
import { useViewState } from './deck/useViewState';
import { FlyToInterpolator } from '@deck.gl/core';

// Gesture handlers for touch and mouse controls
export function useGestureHandlers(setViewState, setSelectedPhotoId) {
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
    
    // Return to the initial view state with a smooth transition
    setViewState({
      ...homeViewState,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: t => {
        // Cubic ease-in-out for smooth transition
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
