'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

export function initializeFirebase() {
  // If an app is already initialized, return the existing SDKs.
  if (getApps().length) {
    return getSdks(getApp());
  }

  // Otherwise, initialize a new app using the explicit configuration.
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  // Explicitly initialize Firestore with settings to improve network compatibility.
  // Forcing long-polling is a robust way to deal with environments that
  // might block the default gRPC-web connection.
  const firestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  });

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
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
