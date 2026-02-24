
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';

/**
 * Singleton-style references to ensure we don't re-initialize 
 * SDKs unnecessarily during hot reloads.
 */
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

/**
 * Initializes the Firebase App and services.
 * Enforces long-polling for maximum compatibility in all network environments.
 */
export function initializeFirebase() {
  if (!app) {
    app = getApps().length === 0 
      ? initializeApp(firebaseConfig) 
      : getApp();
  }
    
  if (!auth) {
    auth = getAuth(app);
  }

  if (!db) {
    try {
      // Force long polling to avoid gRPC/connection issues in restricted environments.
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      // Fallback if already initialized
      db = getFirestore(app);
    }
  }

  return {
    firebaseApp: app,
    auth,
    firestore: db,
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
