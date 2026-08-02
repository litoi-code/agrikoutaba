'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/supabase/provider';
import type { User } from '@supabase/supabase-js';

export type WithId<T> = T & { id: string };

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  metadata: { creationTime: string; lastSignInTime: string };
}

interface FirebaseQuery {
  table: string;
}

export type FirebaseDocRef = {
  __firebaseRef: true;
  table: string;
  id: string;
};

function getDocTable(ref: FirebaseDocRef): string {
  return ref.table;
}

function getDocId(ref: FirebaseDocRef): string {
  return ref.id;
}

export function useUser() {
  const { user, isUserLoading } = useSupabase();
  const fbUser = useMemo<FirebaseUser | null>(() => {
    if (!user) return null;
    return {
      uid: user.id,
      email: (user.email ?? null) as string | null,
      displayName: user.user_metadata?.full_name ?? null,
      metadata: {
        creationTime: user.created_at ?? '',
        lastSignInTime: user.last_sign_in_at ?? '',
      },
    };
  }, [user]);
  return { user: fbUser, isUserLoading };
}

export function useFirestore() {
  return {};
}

export function useMemoFirebase<T>(fn: () => T, deps: React.DependencyList): T {
  return useMemo(fn, deps);
}

export function doc(_ref: unknown, ...pathParts: string[]): FirebaseDocRef {
  const table = pathParts.slice(0, -1).join('/');
  const id = pathParts[pathParts.length - 1];
  return { __firebaseRef: true, table, id };
}

export function collection(_ref: unknown, name: string): FirebaseQuery {
  return { table: name };
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function mapKeys<T>(obj: unknown, convert: (k: string) => string): T {
  if (Array.isArray(obj)) return obj.map((i) => mapKeys(i, convert)) as unknown as T;
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const newKey = convert(k);
      out[newKey] = mapKeys(v, convert);
    }
    return out as T;
  }
  return obj as T;
}

function toCamelCase<T>(rows: unknown): T {
  return mapKeys(rows, snakeToCamel);
}

function toSnakeCase(data: Record<string, unknown>): Record<string, unknown> {
  return mapKeys(data, camelToSnake);
}

export function useAuth() {
  return {};
}

export async function signOut(_auth?: unknown) {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function signInWithEmailAndPassword(
  _auth: unknown,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const u = data.user;
  return { user: { uid: u.id, email: u.email, displayName: u.user_metadata?.full_name ?? null, metadata: { creationTime: u.created_at ?? '', lastSignInTime: u.last_sign_in_at ?? '' } }, error: null };
}

export async function createUserWithEmailAndPassword(
  _auth: unknown,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const u = data.user;
  return { user: { uid: u?.id ?? '', email: u?.email ?? null, displayName: u?.user_metadata?.full_name ?? null, metadata: { creationTime: u?.created_at ?? '', lastSignInTime: u?.last_sign_in_at ?? '' } }, error: null };
}

export async function setDoc(ref: FirebaseDocRef, data: Record<string, unknown>) {
  const { error } = await supabase.from(ref.table).upsert({ id: ref.id, ...toSnakeCase(data) });
  return { error };
}

export async function addDocumentNonBlocking(
  ref: FirebaseDocRef | FirebaseQuery,
  data: Record<string, unknown>
) {
  const table = ref.table;
  const id = "id" in ref ? ref.id : crypto.randomUUID();
  const { error } = await supabase.from(table).insert({ id, ...toSnakeCase(data) });
  if (error) console.error('Add error:', error);
}

export async function updateDocumentNonBlocking(
  ref: FirebaseDocRef,
  data: Record<string, unknown>
) {
  const { error } = await supabase.from(ref.table).update(toSnakeCase(data)).eq('id', ref.id);
  if (error) console.error('Update error:', error);
}

export async function deleteDocumentNonBlocking(ref: FirebaseDocRef) {
  const { error } = await supabase.from(ref.table).delete().eq('id', ref.id);
  if (error) console.error('Delete error:', error);
}

export async function updateDoc(ref: FirebaseDocRef, data: Record<string, unknown>) {
  const { error } = await supabase.from(ref.table).update(toSnakeCase(data)).eq('id', ref.id);
  return { error };
}

export async function getDocs(query: FirebaseQuery | null) {
  if (!query?.table) return { data: [] as Record<string, unknown>[], error: null as Error | null };
  const { data, error } = await supabase.from(query.table).select('*').order('created_at', { ascending: false });
  return { data: toCamelCase<Record<string, unknown>[]>(data ?? []), error };
}

export function useDoc<T>(ref: FirebaseDocRef | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void supabase
      .from(getDocTable(ref))
      .select('*')
      .eq('id', getDocId(ref))
      .single()
      .then(({ data: result, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError);
          setData(null);
        } else {
          setData(toCamelCase<T>(result));
        }
        setIsLoading(false);
      });
  }, [ref]);

  return { data, isLoading, error };
}

export function useCollection<T>(query: FirebaseQuery | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    setError(null);

    if (!query?.table) {
      setData(null);
      setIsLoading(false);
      return;
    }

    void supabase
      .from(query.table)
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data: result, error: fetchError }) => {
        if (!mountedRef.current) return;
        if (fetchError) {
          setError(fetchError);
          setData(null);
          setIsLoading(false);
        } else {
          setData(toCamelCase<T[]>(result));
          setError(null);
          setIsLoading(false);
        }
      });

    return () => {
      mountedRef.current = false;
    };
  }, [query]);

  return { data, isLoading, error };
}