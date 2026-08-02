import { supabase } from '@/lib/supabase';
import type { FirebaseDocRef } from './index';

function getDocTable(ref: FirebaseDocRef): string {
  return ref.table;
}

function getDocId(ref: FirebaseDocRef): string {
  return ref.id;
}

export async function deleteDocumentNonBlocking(ref: FirebaseDocRef) {
  const { error } = await supabase.from(getDocTable(ref)).delete().eq('id', getDocId(ref));
  if (error) console.error('Delete error:', error);
}

export async function addDocumentNonBlocking(ref: FirebaseDocRef, data: Record<string, unknown>) {
  const { error } = await supabase.from(getDocTable(ref)).insert({ id: getDocId(ref), ...data });
  if (error) console.error('Add error:', error);
}

export async function updateDocumentNonBlocking(ref: FirebaseDocRef, data: Record<string, unknown>) {
  const { error } = await supabase.from(getDocTable(ref)).update(data).eq('id', getDocId(ref));
  if (error) console.error('Update error:', error);
}