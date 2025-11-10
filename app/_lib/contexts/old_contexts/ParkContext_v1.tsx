'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { supabase, supabaseUrl } from '@/app/_lib/supabase';

// Initial state
const initialState = {
  parks: [],
  currentPark: {},
  isLoading: false,
  error: '',
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'parks/loaded':
      return {
        ...state,
        isLoading: false,
        parks: action.payload,
      };

    case 'park/loaded':
      return { ...state, isLoading: false, currentPark: action.payload };

    case 'park/created':
      return {
        ...state,
        isLoading: false,
        parks: [...state.parks, action.payload],
        currentPark: action.payload,
      };

    case 'park/deleted':
      return {
        ...state,
        isLoading: false,
        parks: state.parks.filter((park) => park.id !== action.payload),
        currentPark:
          state.currentPark.id === action.payload ? {} : state.currentPark,
      };

    case 'rejected':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error('Unknown action type');
  }
}

// Create Context
const ParkContext = createContext();

// Provider Component
function ParkProvider({ children }) {
  const [{ parks, isLoading, currentPark, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // Fetch all parks
  const fetchParks = useCallback(async () => {
    dispatch({ type: 'loading' });

    const { data, error } = await supabase
      .from('parklist')
      .select('*')
      .order('id');

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
    } else {
      dispatch({ type: 'parks/loaded', payload: data });
    }
  }, []);

  // Fetch a single park by ID
  const getPark = useCallback(
    async function getParkById(id) {
      if (Number(id) === currentPark.id) return;
      dispatch({ type: 'loading' });

      const { data, error } = await supabase
        .from('parklist')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        dispatch({ type: 'rejected', payload: error.message });
      } else {
        dispatch({ type: 'park/loaded', payload: data });
      }
    },
    [currentPark.id]
  );

  // Create a new park
  async function createPark(newPark) {
    const imageName = `${Math.floor(Math.random() * 1000 + 1)}-${
      newPark.image.name
    }`.replaceAll('/', '');
    const imagePath = `${supabaseUrl}/storage/v1/object/public/photos/${imageName}`;

    dispatch({ type: 'loading' });
    // 1) create park
    const { data, error } = await supabase
      .from('parklist')
      .insert([{ ...newPark, image: imagePath }])
      .select();

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }
    const createdPark = data?.[0];

    if (createdPark) {
      dispatch({ type: 'park/created', payload: createdPark });
    }

    // 2) upload image
    const { error: storageError } = await supabase.storage
      .from('photos')
      .upload(imageName, newPark.image);

    // 3) delete the park if there was an error when uploading image
    if (storageError && createdPark) {
      await supabase.from('parklist').delete().eq('id', createdPark.id);
      console.error(storageError);
      throw new Error(
        'Image could not be uploaded and the park was not created'
      );
    }
    // Fetch fresh data to ensure UI updates
    // fetchParks();
    return data;
  }

  // Delete a park by ID
  async function deletePark(id) {
    if (!id) {
      dispatch({ type: 'rejected', payload: 'Invalid park ID' });
      return;
    }

    dispatch({ type: 'loading' });

    const { error } = await supabase.from('parklist').delete().eq('id', id);

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }

    dispatch({ type: 'park/deleted', payload: id });

    fetchParks();
  }

  useEffect(() => {
    fetchParks();
  }, [fetchParks]);

  return (
    <ParkContext.Provider
      value={{
        parks,
        isLoading,
        currentPark,
        error,
        getPark,
        createPark,
        deletePark,
      }}
    >
      {children}
    </ParkContext.Provider>
  );
}

function useParks() {
  const context = useContext(ParkContext);
  if (context === undefined)
    throw new Error('ParkContext was used outside the ParksProvider');
  return context;
}

export { ParkProvider, useParks };
