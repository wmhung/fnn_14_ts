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

// ----- Types -----
interface UserRole {
  id: number;
  fullName: string;
  email: string;
  role: string;
  created_at?: string;
}

interface UserRoleState {
  userRoles: UserRole[];
  currentUserRole: Partial<UserRole> | null;
  isLoading: boolean;
  error: string | null;
}

interface UserRoleContextType extends UserRoleState {
  createUserRole: (newUserRole: Partial<UserRole>) => Promise<void>;
  updateUserRole: (newUserRole: Partial<UserRole>) => Promise<void>;
}

// ----- Initial State -----
const initialState: UserRoleState = {
  userRoles: [],
  currentUserRole: null,
  isLoading: false,
  error: null,
};

// ----- Reducer -----
function reducer(state: UserRoleState, action: any): UserRoleState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true };

    case 'userRoles/loaded':
      return { ...state, isLoading: false, userRoles: action.payload };

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
            ? null
            : state.currentUserRole,
      };

    case 'rejected':
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error('Unknown action type');
  }
}

// ----- Context -----
const UserRoleContext = createContext<UserRoleContextType | undefined>(
  undefined
);

// ----- Provider -----
function UserRoleProvider({ children }: { children: ReactNode }) {
  const [{ userRoles, isLoading, currentUserRole, error }, dispatch] =
    useReducer(reducer, initialState);

  const fetchUserRoles = useCallback(async () => {
    dispatch({ type: 'loading' });

    const { data, error } = await supabase.from('user').select('*').order('id');

    if (error) {
      dispatch({ type: 'rejected', payload: error.message });
    } else {
      dispatch({ type: 'userRoles/loaded', payload: data });
    }
  }, []);

  async function createUserRole(newUserRole: Partial<UserRole>) {
    dispatch({ type: 'loading' });

    try {
      const { data, error } = await supabase
        .from('user')
        .insert([{ ...newUserRole }])
        .select();

      if (error) throw error;

      dispatch({ type: 'userRole/created', payload: data[0] });
    } catch (error: any) {
      dispatch({ type: 'rejected', payload: error.message });
    }
  }

  async function updateUserRole(newUserRole: Partial<UserRole>) {
    try {
      const { data: existingUserRole, error: fetchError } = await supabase
        .from('user')
        .select('*')
        .eq('email', newUserRole.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingUserRole) {
        const { data, error: updateError } = await supabase
          .from('user')
          .update(newUserRole)
          .eq('id', existingUserRole.id)
          .select()
          .single();

        if (updateError) throw updateError;

        dispatch({ type: 'userRole/loaded', payload: data });
      } else {
        const { data, error: insertError } = await supabase
          .from('user')
          .insert([newUserRole])
          .select()
          .single();

        if (insertError) throw insertError;

        dispatch({ type: 'userRole/created', payload: data });
      }
    } catch (error: any) {
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

// ----- Hook -----
function useUserRoles() {
  const context = useContext(UserRoleContext);
  if (context === undefined)
    throw new Error('useUserRoles must be used within a UserRoleProvider');
  return context;
}

export { UserRoleProvider, useUserRoles };
