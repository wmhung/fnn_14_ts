'use client';

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  ReactNode,
} from 'react';
import type { LatLng } from '../utils/distance';
import type { RouteResult } from '../services/routing';

// ---------------- Types ----------------
interface LocationState {
  position: LatLng | null;
  isLoading: boolean;
  error: string | null;
  route: RouteResult | null;
}

type LocationAction =
  | { type: 'position/loading' }
  | { type: 'position/loaded'; payload: LatLng }
  | { type: 'position/failed'; payload: string }
  | { type: 'route/set'; payload: RouteResult }
  | { type: 'route/cleared' };

interface LocationContextType extends LocationState {
  getPosition: () => void;
  setRoute: (route: RouteResult) => void;
  clearRoute: () => void;
}

// ---------------- Initial State ----------------
const initialState: LocationState = {
  position: null,
  isLoading: false,
  error: null,
  route: null,
};

// ---------------- Reducer ----------------
function reducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'position/loading':
      return { ...state, isLoading: true, error: null };

    case 'position/loaded':
      return { ...state, isLoading: false, position: action.payload };

    case 'position/failed':
      return { ...state, isLoading: false, error: action.payload };

    case 'route/set':
      return { ...state, route: action.payload };

    case 'route/cleared':
      return { ...state, route: null };

    default:
      throw new Error('Unknown action type');
  }
}

// ---------------- Context ----------------
const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

// ---------------- Provider ----------------
function LocationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Same logic as the old useGeolocation hook, just dispatching into a
  // shared store instead of local useState.
  const getPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      dispatch({
        type: 'position/failed',
        payload: 'Your browser does not support geolocation',
      });
      return;
    }

    dispatch({ type: 'position/loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch({
          type: 'position/loaded',
          payload: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        });
      },
      (err) => {
        dispatch({ type: 'position/failed', payload: err.message });
      },
    );
  }, []);

  const setRoute = useCallback((route: RouteResult) => {
    dispatch({ type: 'route/set', payload: route });
  }, []);

  const clearRoute = useCallback(() => {
    dispatch({ type: 'route/cleared' });
  }, []);

  return (
    <LocationContext.Provider
      value={{
        ...state,
        getPosition,
        setRoute,
        clearRoute,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

// ---------------- Hook ----------------
function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used inside LocationProvider');
  }
  return context;
}

export { LocationProvider, useLocation };
