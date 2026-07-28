'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface SupabaseContextState {
  supabaseClient: typeof supabase;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
      if (error) setUserError(error);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setIsUserLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      supabaseClient: supabase,
      user,
      isUserLoading,
      userError,
    }),
    [user, isUserLoading, userError]
  );

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    return {
      supabaseClient: supabase,
      user: null,
      isUserLoading: true,
      userError: null,
    };
  }
  return context;
}

export function useSupabaseClient() {
  return useSupabase().supabaseClient;
}

export function useUser() {
  return useSupabase().user;
}