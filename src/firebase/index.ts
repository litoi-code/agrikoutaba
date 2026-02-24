
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes the Firebase App and services.
 * Uses existing instances if already initialized to prevent errors during hot reloads.
 */
export function initializeFirebase() {
  const firebaseApp = getApps().length === 0 
    ? initializeApp(firebaseConfig) 
    : getApp();
    
  return getSdks(firebaseApp);
}

/**
 * Retrieves or initializes Firebase services (Auth, Firestore).
 * @param firebaseApp The initialized FirebaseApp instance.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  let firestore: Firestore;
  
  try {
    // Attempt to get the existing Firestore instance
    firestore = getFirestore(firebaseApp);
  } catch (e) {
    // If Firestore hasn't been initialized yet, initialize it with custom settings.
    // Forcing long-polling is a robust way to deal with environments that
    // might block the default gRPC-web connection (like some cloud IDEs).
    firestore = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    });
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
