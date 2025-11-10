'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase, supabaseUrl } from '@/app/_lib/supabase';

// ----------------- Types -----------------
export interface Park {
  id: number;
  city: string;
  dist: string;
  parkName: string;
  date: string;
  notes?: string;
  recreation?: string;
  position?: { lat: number; lng: number } | null;
  image?: string;
  starRating?: number;
  email?: string;
  userName?: string; // <-- optional if not always present
}

interface ParkState {
  parks: Park[];
  currentPark: Park | null;
  isLoading: boolean;
  error: string;
}

type ParkAction =
  | { type: 'loading' }
  | { type: 'parks/loaded'; payload: Park[] }
  | { type: 'park/loaded'; payload: Park }
  | { type: 'park/created'; payload: Park }
  | { type: 'park/deleted'; payload: number }
  | { type: 'rejected'; payload: string };

interface ParkContextType extends ParkState {
  getPark: (id: number) => Promise<void>;
  createPark: (
    newPark: Omit<Park, 'id'> & { image: File }
  ) => Promise<Park[] | undefined>;
  deletePark: (id: number) => Promise<void>;
}

// Initial state
const initialState: ParkState = {
  parks: [],
  currentPark: null,
  isLoading: false,
  error: '',
};

// Reducer function
function reducer(state: ParkState, action: ParkAction): ParkState {
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
          state.currentPark && state.currentPark.id === action.payload
            ? null
            : state.currentPark,
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
const ParkContext = createContext<ParkContextType | undefined>(undefined);

// Provider Component
function ParkProvider({ children }: { children: ReactNode }) {
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
    } else if (data) {
      dispatch({ type: 'parks/loaded', payload: data as Park[] });
    }
  }, []);

  // Fetch a single park by ID
  const getPark = useCallback(
    async (id: number) => {
      if (currentPark && id === currentPark.id) return; // Avoid refetching the same park

      dispatch({ type: 'loading' });

      const { data, error } = await supabase
        .from('parklist')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        dispatch({ type: 'rejected', payload: error.message });
      } else {
        dispatch({ type: 'park/loaded', payload: data as Park });
      }
    },
    [currentPark]
  );

  // Create a new park
  async function createPark(
    newPark: Omit<Park, 'id'> & { image: File }
  ): Promise<Park[] | undefined> {
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
    const createdPark = data?.[0] as Park;
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
    return data as Park[];
  }

  // Delete a park by ID
  async function deletePark(id: number) {
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

  // Auto-fetch parks
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
