'use client';

import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function supabaseInsert<T>(
  table: string,
  data: T
): Promise<{ data: T | null; error: Error | null }> {
  const { data: result, error } = await supabase.from(table).insert(data).select().single();
  return { data: result as T | null, error };
}

export async function supabaseUpdate<T>(
  table: string,
  id: string,
  data: Partial<T>
): Promise<{ data: T | null; error: Error | null }> {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  return { data: result as T | null, error };
}

export async function supabaseDelete(table: string, id: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  return { error };
}

export async function supabaseUpsert<T>(
  table: string,
  data: T
): Promise<{ data: T | null; error: Error | null }> {
  const { data: result, error } = await supabase.from(table).upsert(data).select().single();
  return { data: result as T | null, error };
}

export async function supabaseSelect<T>(
  table: string,
  options?: {
    filter?: { column: string; value: string | number | boolean };
    order?: string;
    ascending?: boolean;
    limit?: number;
  }
): Promise<{ data: T[] | null; error: Error | null }> {
  let query = supabase.from(table).select('*');
  if (options?.filter) {
    query = query.eq(options.filter.column, options.filter.value);
  }
  if (options?.order) {
    query = query.order(options.order, { ascending: options.ascending ?? true });
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  const { data: result, error } = await query;
  return { data: result as T[] | null, error };
}