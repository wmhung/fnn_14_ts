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
  userRoles: [],
  currentUserRole: {},
  isLoading: false,
  error: '',
};

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'userRoles/loaded':
      return {
        ...state,
        isLoading: false,
        userRoles: action.payload,
      };

    case 'userRole/loaded':
      return { ...state, isLoading: false, currentUserRole: action.payload };

    case 'userRole/created':
      return {
        ...state,
        isLoading: false,
        userRoles: [...state.userRoles, action.payload],
        currentUserRole: action.payload,
      };

    case 'userRole/deleted':
      return {
        ...state,
        isLoading: false,
        userRoles: state.userRoles.filter(
          (userRole) => userRole.id !== action.payload
        ),
        currentUserRole:
          state.currentUserRole?.id === action.payload
            ? {}
            : state.currentUserRole,
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
const UserRoleContext = createContext();

// Provider Component
function UserRoleProvider({ children }) {
  const [{ userRoles, isLoading, currentUserRole, error }, dispatch] =
    useReducer(reducer, initialState);

  // Fetch all userRoles
  const fetchUserRoles = useCallback(async () => {
    dispatch({ type: 'loading' });

    const { data, error } = await supabase.from('user').select('*').order('id');

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
    } else {
      dispatch({ type: 'userRoles/loaded', payload: data });
    }
  }, []);

  async function createUserRole(newUserRole) {
    dispatch({ type: 'loading' });

    try {
      const { data, error } = await supabase
        .from('user')
        .insert([{ ...newUserRole }])
        .select(); // Ensure inserted data is returned

      if (error) throw error;

      console.log('User role created:', data);

      dispatch({ type: 'userRole/created', payload: data[0] });
    } catch (error) {
      console.error('Failed to create user role:', error.message);
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  // 🔄 Create or Update user role
  async function updateUserRole(newUserRole) {
    try {
      // Check if the userRole already exists
      const { data: existingUserRole, error: fetchError } = await supabase
        .from('user')
        .select('*')
        .eq('email', newUserRole.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignore "row not found" error, but catch other errors
        throw fetchError;
      }

      if (existingUserRole) {
        // If userRole exists, switch to the other one
        const { data, error: updateError } = await supabase
          .from('user')
          .update(newUserRole)
          .eq('id', existingUserRole.id)
          .select()
          .single();

        if (updateError) throw updateError;

        dispatch({ type: 'userRole/loaded', payload: data });
      } else {
        // If no userRole exists, create it (toggle on)
        const { data, error: insertError } = await supabase
          .from('user')
          .insert([newUserRole])
          .select()
          .single();

        if (insertError) throw insertError;

        dispatch({ type: 'userRole/created', payload: data });
      }
    } catch (error) {
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  useEffect(() => {
    fetchUserRoles();
  }, [fetchUserRoles]);

  return (
    <UserRoleContext.Provider
      value={{
        userRoles,
        isLoading,
        currentUserRole,
        error,
        createUserRole,
        updateUserRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

function useUserRoles() {
  const context = useContext(UserRoleContext);
  if (context === undefined)
    throw new Error('UserRoleContext was used outside the UserRoleProvider');
  return context;
}

export { UserRoleProvider, useUserRoles };
