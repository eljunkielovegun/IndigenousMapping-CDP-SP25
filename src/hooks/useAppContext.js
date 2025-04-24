import { useContext } from 'react';
import { AppContext } from '../App';

/**
 * Custom hook to access the app's context
 * Provides access to app functions and state from any component
 * 
 * @returns {Object} App context with functions like handlePhotoSelect, returnToHomeView, etc.
 */
export function useAppContext() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppContext.Provider');
  }
  
  return context;
}

/**
 * Example usage in another component:
 * 
 * import { useAppContext } from '../hooks/useAppContext';
 * 
 * function MyComponent() {
 *   const { handlePhotoSelect, appMode } = useAppContext();
 *   
 *   return (
 *     <button onClick={() => handlePhotoSelect('photo1')}>
 *       View Photo 1
 *     </button>
 *   );
 * }
 */