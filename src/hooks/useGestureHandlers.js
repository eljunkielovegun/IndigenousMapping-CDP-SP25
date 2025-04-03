import { useGesture } from '@use-gesture/react';

// Placeholder for future touchscreen controls
export function useGestureHandlers(setViewState) {
  return useGesture({
    onDrag: ({ delta: [dx, dy] }) => {
      // Example: update viewState.bearing or pitch here later
    },
    onPinch: ({ offset: [d] }) => {
      // Update zoom here
    }
  });
}
