// BookmarkContext.tsx
'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '@/app/_lib/supabase';

// ---------------- Types ----------------
export interface Bookmark {
  id?: number;
  parkId: number;
  parkName: string;
  date: string | Date; // ISO string
  position?: {
    lat: number;
    lng: number;
  };
  starRating?: number;
  [key: string]: any; // optional extra fields like notes, image, city, email
}

interface BookmarkState {
  bookmarks: Bookmark[];
  currentBookmark: Bookmark | null;
  isLoading: boolean;
  error: string;
}

type BookmarkAction =
  | { type: 'loading' }
  | { type: 'bookmarks/loaded'; payload: Bookmark[] }
  | { type: 'bookmark/loaded'; payload: Bookmark }
  | { type: 'bookmark/created'; payload: Bookmark }
  | { type: 'bookmark/deleted'; payload: number }
  | { type: 'rejected'; payload: string };

interface BookmarkContextType extends BookmarkState {
  getBookmark: (parkId: number) => Promise<void>;
  createBookmark: (bookmark: Omit<Bookmark, 'id'>) => Promise<void>;
  deleteBookmark: (id: number) => Promise<void>;
  updateBookmark: (bookmark: Omit<Bookmark, 'id'>) => Promise<void>;
}

// ---------------- Initial State ----------------
const initialState: BookmarkState = {
  bookmarks: [],
  currentBookmark: null,
  isLoading: false,
  error: '',
};

// ---------------- Reducer ----------------
function reducer(state: BookmarkState, action: BookmarkAction): BookmarkState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'bookmarks/loaded':
      return { ...state, isLoading: false, bookmarks: action.payload };

    case 'bookmark/loaded':
      return { ...state, isLoading: false, currentBookmark: action.payload };

    case 'bookmark/created':
      return {
        ...state,
        isLoading: false,
        bookmarks: [...state.bookmarks, action.payload],
        currentBookmark: action.payload,
      };

    case 'bookmark/deleted':
      return {
        ...state,
        isLoading: false,
        bookmarks: state.bookmarks.filter(
          (bookmark) => bookmark.id !== action.payload,
        ),
        currentBookmark:
          state.currentBookmark?.id === action.payload
            ? null
            : state.currentBookmark,
      };

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
  const [{ bookmarks, currentBookmark, isLoading, error }, dispatch] =
    useReducer(reducer, initialState);

  // Fetch all bookmarks
  const fetchBookmarks = useCallback(async () => {
    dispatch({ type: 'loading' });

    const { data, error } = await supabase
      .from('bookmark')
      .select('*')
      .order('id');

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
    } else {
      dispatch({ type: 'bookmarks/loaded', payload: data as Bookmark[] });
    }
  }, []);

  // Fetch a single bookmark by parkId
  const getBookmark = useCallback(
    async (parkId: number) => {
      if (currentBookmark?.parkId === parkId) return;

      dispatch({ type: 'loading' });

      const { data, error } = await supabase
        .from('bookmark')
        .select('*')
        .eq('parkId', parkId)
        .single();

      if (error) {
        dispatch({ type: 'rejected', payload: error.message });
      } else {
        dispatch({ type: 'bookmark/loaded', payload: data as Bookmark });
      }
    },
    [currentBookmark],
  );

  // Create a bookmark
  async function createBookmark(newBookmark: Omit<Bookmark, 'id'>) {
    dispatch({ type: 'loading' });

    const { data, error } = await supabase
      .from('bookmark')
      .insert([newBookmark])
      .select();

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }

    dispatch({ type: 'bookmark/created', payload: data?.[0] as Bookmark });
  }

  // Delete a bookmark
  async function deleteBookmark(id: number) {
    if (!id) {
      dispatch({ type: 'rejected', payload: 'Invalid bookmark ID' });
      return;
    }

    dispatch({ type: 'loading' });

    const { error } = await supabase.from('bookmark').delete().eq('id', id);

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
      return;
    }

    dispatch({ type: 'bookmark/deleted', payload: id });
    fetchBookmarks();
  }

  // Toggle bookmark (add/remove)
  async function updateBookmark(newBookmark: Omit<Bookmark, 'id'>) {
    try {
      const { data: existingBookmark, error: fetchError } = await supabase
        .from('bookmark')
        .select('*')
        .eq('parkId', newBookmark.parkId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingBookmark) {
        const { error: deleteError } = await supabase
          .from('bookmark')
          .delete()
          .eq('id', existingBookmark.id);

        if (deleteError) throw deleteError;

        dispatch({ type: 'bookmark/deleted', payload: existingBookmark.id });
      } else {
        const { data, error: insertError } = await supabase
          .from('bookmark')
          .insert([newBookmark])
          .select()
          .single();

        if (insertError) throw insertError;

        dispatch({ type: 'bookmark/created', payload: data as Bookmark });
      }
    } catch (error: any) {
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        currentBookmark,
        isLoading,
        error,
        getBookmark,
        createBookmark,
        deleteBookmark,
        updateBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

// ---------------- Hook ----------------
function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context)
    throw new Error('useBookmarks must be used inside BookmarkProvider');
  return context;
}

export { BookmarkProvider, useBookmarks };
