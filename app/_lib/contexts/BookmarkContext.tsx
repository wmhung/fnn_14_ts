'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/app/_lib/supabase';

// ---------------- Types ----------------

export interface Bookmark {
  id: number;
  email: string;
  place_id: number;
  created_at?: string;
}

interface BookmarkState {
  bookmarkedPlaceIds: Set<number>;
  isLoading: boolean;
  error: string;
}

type BookmarkAction =
  | { type: 'loading' }
  | { type: 'ids/loaded'; payload: number[] }
  | { type: 'toggle/local'; payload: { placeId: number; on: boolean } }
  | { type: 'place/removed'; payload: number }
  | { type: 'rejected'; payload: string };

interface BookmarkContextType extends BookmarkState {
  toggleBookmark: (placeId: number, email: string) => Promise<void>;
  removeBookmarksForPlace: (placeId: number) => void;
  fetchBookmarkIds: (email: string) => Promise<void>;
}

// ---------------- Initial State ----------------

const initialState: BookmarkState = {
  bookmarkedPlaceIds: new Set<number>(),
  isLoading: false,
  error: '',
};

// ---------------- Reducer ----------------

function reducer(state: BookmarkState, action: BookmarkAction): BookmarkState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'ids/loaded':
      return {
        ...state,
        isLoading: false,
        bookmarkedPlaceIds: new Set(action.payload),
      };

    case 'toggle/local': {
      const next = new Set(state.bookmarkedPlaceIds);
      if (action.payload.on) next.add(action.payload.placeId);
      else next.delete(action.payload.placeId);
      return { ...state, bookmarkedPlaceIds: next };
    }

    case 'place/removed': {
      if (!state.bookmarkedPlaceIds.has(action.payload)) return state;
      const next = new Set(state.bookmarkedPlaceIds);
      next.delete(action.payload);
      return { ...state, bookmarkedPlaceIds: next };
    }

    case 'rejected':
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error('Unknown action type');
  }
}

// ---------------- Context ----------------

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined,
);

// ---------------- Provider ----------------

function BookmarkProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { data: session, status } = useSession();
  const email = session?.user?.email ?? null;
  // console.log(email, status);

  // -------- Reads --------

  const fetchBookmarkIds = useCallback(async (sessionEmail: string) => {
    dispatch({ type: 'loading' });

    const { data, error } = await supabase
      .from('bookmark')
      .select('place_id')
      .eq('email', sessionEmail);

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }

    dispatch({
      type: 'ids/loaded',
      payload: (data ?? []).map((r) => r.place_id as number),
    });
  }, []);

  // Auto-load whenever the signed-in user changes.
  useEffect(() => {
    if (status === 'authenticated' && email) fetchBookmarkIds(email);
  }, [status, email, fetchBookmarkIds]);

  // -------- Writes --------

  async function toggleBookmark(placeId: number, sessionEmail: string) {
    if (!sessionEmail) {
      dispatch({ type: 'rejected', payload: 'Not signed in' });
      return;
    }

    // Predict the outcome from local truth.
    const willBeOn = !state.bookmarkedPlaceIds.has(placeId);

    // Optimistic flip — UI updates instantly.
    dispatch({ type: 'toggle/local', payload: { placeId, on: willBeOn } });

    const { error } = await supabase.rpc('toggle_bookmark', {
      p_place_id: placeId,
      p_email: sessionEmail,
    });

    if (error) {
      // console.error('[toggle_bookmark]', error);
      // Roll back the optimistic flip.
      dispatch({ type: 'toggle/local', payload: { placeId, on: !willBeOn } });
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  const removeBookmarksForPlace = useCallback((placeId: number) => {
    dispatch({ type: 'place/removed', payload: placeId });
  }, []);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedPlaceIds: state.bookmarkedPlaceIds,
        isLoading: state.isLoading,
        error: state.error,
        toggleBookmark,
        removeBookmarksForPlace,
        fetchBookmarkIds,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

// ---------------- Hook ----------------

function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used inside BookmarkProvider');
  }
  return context;
}

export { BookmarkProvider, useBookmarks };
