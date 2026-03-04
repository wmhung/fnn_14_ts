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
  userName?: string;
}

// ✅ new: input type for creating parks
// This allows image to be either a File (new upload) or a string (already stored)
export type ParkInput = Omit<Park, 'id' | 'image'> & { image: File | string };

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
  createPark: (newPark: ParkInput) => Promise<Park[] | undefined>;
  deletePark: (id: number) => Promise<void>;
}

// ----------------- Initial state -----------------
const initialState: ParkState = {
  parks: [],
  currentPark: null,
  isLoading: false,
  error: '',
};

// ----------------- Reducer -----------------
function reducer(state: ParkState, action: ParkAction): ParkState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };
    case 'parks/loaded':
      return { ...state, isLoading: false, parks: action.payload };
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
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error('Unknown action type');
  }
}

// ----------------- Context -----------------
const ParkContext = createContext<ParkContextType | undefined>(undefined);

// ----------------- Provider -----------------
function ParkProvider({ children }: { children: ReactNode }) {
  const [{ parks, isLoading, currentPark, error }, dispatch] = useReducer(
    reducer,
    initialState,
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
      if (currentPark && id === currentPark.id) return;
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
    [currentPark],
  );

  // ✅ Create a new park (accepts File | string for image)
  async function createPark(newPark: ParkInput): Promise<Park[] | undefined> {
    dispatch({ type: 'loading' });

    let imagePath: string | null = null;
    let imageName: string | null = null;

    if (newPark.image instanceof File) {
      imageName = `${Math.floor(Math.random() * 1000 + 1)}-${
        newPark.image.name
      }`.replaceAll('/', '');
      imagePath = `${supabaseUrl}/storage/v1/object/public/photos/${imageName}`;
    } else if (typeof newPark.image === 'string') {
      imagePath = newPark.image;
    }

    // 1️⃣ Insert park into Supabase
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

    // 2️⃣ Upload image only if it's a File
    if (newPark.image instanceof File && imageName) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .upload(imageName, newPark.image);

      if (storageError && createdPark) {
        await supabase.from('parklist').delete().eq('id', createdPark.id);
        console.error(storageError);
        throw new Error(
          'Image could not be uploaded and the park was not created',
        );
      }
    }

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

  // Auto-fetch parks on mount
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

// ----------------- Hook -----------------
function useParks() {
  const context = useContext(ParkContext);
  if (context === undefined)
    throw new Error('ParkContext was used outside the ParkProvider');
  return context;
}

export { ParkProvider, useParks };
