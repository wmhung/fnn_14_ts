'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '@/app/_lib/supabase';

// Initial state
const initialState = {
  bookmarks: [],
  currentBookmark: {},
  isLoading: false,
  error: '',
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'bookmarks/loaded':
      return {
        ...state,
        isLoading: false,
        bookmarks: action.payload,
      };

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
          (bookmark) => bookmark.id !== action.payload
        ),
        currentBookmark:
          state.currentBookmark?.id === action.payload
            ? {}
            : state.currentBookmark,
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
const BookmarkContext = createContext();

// Provider Component
function BookmarkProvider({ children }) {
  const [{ bookmarks, isLoading, currentBookmark, error }, dispatch] =
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
      dispatch({ type: 'bookmarks/loaded', payload: data });
    }
  }, []);

  // Fetch a single bookmark by ID
  const getBookmark = useCallback(
    async function getBookmarkById(parkId) {
      if (Number(parkId) === currentBookmark.parkId) return;
      dispatch({ type: 'loading' });

      const { data, error } = await supabase
        .from('bookmark')
        .select('*')
        .eq('parkId', parkId)
        .single();

      if (error) {
        dispatch({ type: 'rejected', payload: error.message });
      } else {
        dispatch({ type: 'bookmark/loaded', payload: data });
      }
    },
    [currentBookmark] // ✅ Fixed
  );

  async function createBookmark(newBookmark) {
    dispatch({ type: 'loading' });

    try {
      const { data, error } = await supabase
        .from('bookmark')
        .insert([{ ...newBookmark }])
        .select(); // Ensure inserted data is returned

      if (error) throw error;

      console.log('Bookmark created:', data);

      dispatch({ type: 'bookmark/created', payload: data[0] });
    } catch (error) {
      console.error('Failed to create bookmark:', error.message);
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  // Delete a park by ID
  async function deleteBookmark(id) {
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

  // 🔄 Toggle Bookmark (Add/Remove)
  async function updateBookmark(newBookmark) {
    try {
      // Check if the bookmark already exists
      const { data: existingBookmark, error: fetchError } = await supabase
        .from('bookmark')
        .select('*')
        .eq('parkId', newBookmark.parkId)
        .single();
      // .eq('userId', newBookmark.userId)

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignore "row not found" error, but catch other errors
        throw fetchError;
      }

      if (existingBookmark) {
        // If bookmark exists, delete it (toggle off)
        const { error: deleteError } = await supabase
          .from('bookmark')
          .delete()
          .eq('id', existingBookmark.id);

        if (deleteError) throw deleteError;

        dispatch({ type: 'bookmark/deleted', payload: existingBookmark.id });
      } else {
        // If no bookmark exists, create it (toggle on)
        const { data, error: insertError } = await supabase
          .from('bookmark')
          .insert([newBookmark])
          .select()
          .single();

        if (insertError) throw insertError;

        dispatch({ type: 'bookmark/created', payload: data });
      }
    } catch (error) {
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]); // ✅ Safe if fetchBookmarks is memoized with useCallback

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isLoading,
        currentBookmark,
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

function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined)
    throw new Error('BookmarkContext was used outside the BookmarksProvider');
  return context;
}

export { BookmarkProvider, useBookmarks };
