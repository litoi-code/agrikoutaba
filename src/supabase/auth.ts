'use client';

import { supabase } from '@/lib/supabase';
import type { AuthError, User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) return { error };
  if (data.user) {
    await supabase.from('workers').insert({
      id: data.user.id,
      first_name: fullName.split(' ')[0],
      last_name: fullName.split(' ').slice(1).join(' ') || '',
      email,
      contact_number: '',
      role: 'Worker',
    });
  }
  return { data, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInAnonymously() {
  const { data, error } = await supabase.auth.signInAnonymously();
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export function getCurrentUser(): User | null {
  return supabase.auth.getUser().then(({ data: { user } }) => user).catch(() => null);
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}