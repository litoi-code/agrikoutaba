'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

const PERMISSION_ERROR_CODES = new Set([
  'permission-denied',
  'unauthenticated',
]);

function emitIfPermissionError(error: any, context: {path: string, operation: string, requestResourceData?: any}) {
  if (PERMISSION_ERROR_CODES.has(error?.code)) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: context.path,
        operation: context.operation as 'get' | 'list' | 'create' | 'update' | 'delete' | 'write',
        requestResourceData: context.requestResourceData,
      })
    )
  }
}

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    emitIfPermissionError(error, {path: docRef.path, operation: 'write', requestResourceData: data})
  })
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      emitIfPermissionError(error, {path: colRef.path, operation: 'create', requestResourceData: data})
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      emitIfPermissionError(error, {path: docRef.path, operation: 'update', requestResourceData: data})
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      emitIfPermissionError(error, {path: docRef.path, operation: 'delete'})
    });
}