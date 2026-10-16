import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache,
  setLogLevel,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal internal Firestore SDK warnings (e.g. BloomFilter existence filter fallback)
setLogLevel('error');

if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (args.some((a) => typeof a === 'string' && a.includes('BloomFilter'))) return;
    origWarn.apply(console, args);
  };
}

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';

// Initialize Firestore with memoryLocalCache to avoid multi-tab BloomFilter cache mismatches
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        localCache: memoryLocalCache(),
      },
      dbId
    );
  } catch {
    return getFirestore(app, dbId);
  }
})();

// Validate connection to Firestore on initialization
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline, check Firebase configuration.');
      return false;
    }
    // Reached Firestore server (even if doc doesn't exist)
    return true;
  }
}
