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
import { buildStorageKey } from '@/app/_lib/utils/storage-key';

// import the canonical types instead of redeclaring them
import type { Place, PlaceInput, PlaceUpdateInput } from '@/types/place';

// re-export so existing imports don't break
export type { Place, PlaceInput, PlaceUpdateInput };

interface PlaceState {
  places: Place[];
  currentPlace: Place | null;
  isLoading: boolean;
  error: string;
}

type PlaceAction =
  | { type: 'loading' }
  | { type: 'places/loaded'; payload: Place[] }
  | { type: 'place/loaded'; payload: Place }
  | { type: 'place/created'; payload: Place }
  | { type: 'place/updated'; payload: Place }
  | { type: 'place/deleted'; payload: number }
  | { type: 'rejected'; payload: string };

interface PlaceContextType extends PlaceState {
  getPlace: (id: number) => Promise<void>;
  createPlace: (newPlace: PlaceInput) => Promise<Place[] | undefined>;
  updatePlace: (input: PlaceUpdateInput) => Promise<Place | undefined>;
  deletePlace: (id: number, email: string) => Promise<void>;
}

const initialState: PlaceState = {
  places: [],
  currentPlace: null,
  isLoading: false,
  error: '',
};

function reducer(state: PlaceState, action: PlaceAction): PlaceState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };
    case 'places/loaded':
      return { ...state, isLoading: false, places: action.payload };
    case 'place/loaded':
      return { ...state, isLoading: false, currentPlace: action.payload };
    case 'place/created':
      return {
        ...state,
        isLoading: false,
        places: [...state.places, action.payload],
        currentPlace: action.payload,
      };
    case 'place/updated':
      return {
        ...state,
        isLoading: false,
        places: state.places.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
        currentPlace: action.payload,
      };
    case 'place/deleted':
      return {
        ...state,
        isLoading: false,
        places: state.places.filter((place) => place.id !== action.payload),
        currentPlace:
          state.currentPlace && state.currentPlace.id === action.payload
            ? null
            : state.currentPlace,
      };
    case 'rejected':
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error('Unknown action type');
  }
}

const PlaceContext = createContext<PlaceContextType | undefined>(undefined);

function PlaceProvider({ children }: { children: ReactNode }) {
  const [{ places, isLoading, currentPlace, error }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const fetchPlaces = useCallback(async () => {
    dispatch({ type: 'loading' });
    const { data, error } = await supabase
      .from('placelist')
      .select('*, user(full_name)')
      .order('id');
    if (error) dispatch({ type: 'rejected', payload: error.message });
    else if (data) {
      const flattened = (data as any[]).map(({ user, ...place }) => ({
        ...place,
        user_name: user?.full_name ?? 'Anonymous',
      })) as Place[];
      dispatch({ type: 'places/loaded', payload: flattened });
    }
  }, []);

  const getPlace = useCallback(
    async (id: number) => {
      if (currentPlace && id === currentPlace.id) return;
      dispatch({ type: 'loading' });
      const { data, error } = await supabase
        .from('placelist')
        .select('*, user(full_name)')
        .eq('id', id)
        .single();
      if (error) dispatch({ type: 'rejected', payload: error.message });
      else {
        // Same derive-on-read as fetchPlaces — see the note above.
        const { user, ...place } = data as any;
        dispatch({
          type: 'place/loaded',
          payload: {
            ...place,
            user_name: user?.full_name ?? 'Anonymous',
          } as Place,
        });
      }
    },
    [currentPlace],
  );

  async function uploadImage(file: File): Promise<string | null> {
    const imageName = buildStorageKey(file.type);
    if (!imageName) {
      dispatch({
        type: 'rejected',
        payload: 'Image must be a PNG or JPEG file.',
      });
      return null;
    }
    const { error: storageError } = await supabase.storage
      .from('photos')
      .upload(imageName, file);
    if (storageError) {
      dispatch({ type: 'rejected', payload: storageError.message });
      return null;
    }
    return `${supabaseUrl}/storage/v1/object/public/photos/${imageName}`;
  }

  async function createPlace(newPlace: PlaceInput) {
    dispatch({ type: 'loading' });

    let imagePath: string | null = null;
    if (newPlace.image instanceof File) {
      imagePath = await uploadImage(newPlace.image);
      if (!imagePath) return;
    } else if (typeof newPlace.image === 'string') {
      imagePath = newPlace.image;
    }

    const { image, ...rest } = newPlace;
    const { data, error } = await supabase
      .from('placelist')
      .insert([{ ...rest, image: imagePath }])
      .select('*, user(full_name)');

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }

    let createdPlace: Place | undefined;
    if (data?.[0]) {
      const { user, ...place } = data[0] as any;
      createdPlace = {
        ...place,
        user_name: user?.full_name ?? 'Anonymous',
      } as Place;
      dispatch({ type: 'place/created', payload: createdPlace });
    }
    return (createdPlace ? [createdPlace] : []) as Place[];
  }

  async function updatePlace(input: PlaceUpdateInput) {
    dispatch({ type: 'loading' });

    let imagePath: string | undefined;
    if (input.image instanceof File) {
      const uploaded = await uploadImage(input.image);
      if (!uploaded) return;
      imagePath = uploaded;
    } else if (typeof input.image === 'string') {
      imagePath = input.image;
    }

    const { id, image, email, ...rest } = input;
    const patch = {
      ...rest,
      ...(imagePath ? { image: imagePath } : {}),
    };

    let query = supabase.from('placelist').update(patch).eq('id', id);
    if (email) query = query.eq('email', email);

    // Embed so the updated row carries a derived user_name, matching fetchPlaces.
    const { data, error } = await query.select('*, user(full_name)').single();

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }

    const { user, ...place } = data as any;
    const updated = {
      ...place,
      user_name: user?.full_name ?? 'Anonymous',
    } as Place;
    dispatch({ type: 'place/updated', payload: updated });
    return updated;
  }

  async function deletePlace(id: number, email: string) {
    if (!email) {
      dispatch({ type: 'rejected', payload: 'Not signed in' });
      return;
    }

    const target = places.find((p) => p.id === id);
    const imageKey = target?.image?.split('/photos/')[1] ?? null;

    dispatch({ type: 'place/deleted', payload: id });

    const { error: deleteErr } = await supabase
      .from('placelist')
      .delete()
      .eq('id', id)
      .eq('email', email);

    if (deleteErr) {
      dispatch({ type: 'rejected', payload: deleteErr.message });
      await fetchPlaces();
      return;
    }

    await supabase
      .from('bookmark')
      .delete()
      .eq('place_id', id)
      .eq('email', email);
    if (imageKey) {
      await supabase.storage.from('photos').remove([imageKey]);
    }
  }

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <PlaceContext.Provider
      value={{
        places,
        isLoading,
        currentPlace,
        error,
        getPlace,
        createPlace,
        updatePlace,
        deletePlace,
      }}
    >
      {children}
    </PlaceContext.Provider>
  );
}

function usePlaces() {
  const context = useContext(PlaceContext);
  if (context === undefined)
    throw new Error('PlaceContext was used outside the PlaceProvider');
  return context;
}

export { PlaceProvider, usePlaces };
