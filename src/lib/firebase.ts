import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  type Firestore
} from 'firebase/firestore';
import type { JournalEntry, MoodInsightReport } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use provisioned Firestore Database ID
export const db: Firestore = getFirestore(
  app, 
  firebaseConfigJson.firestoreDatabaseId || undefined
);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    // If popup blocked or other issue, surface clean message
    throw error;
  }
};

export const signInAsGuest = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.error('Guest Sign-In error:', error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  await fbSignOut(auth);
};

// --- Firestore Helpers with Strict User Isolation ---

export const saveJournalEntry = async (userId: string, entry: JournalEntry): Promise<void> => {
  if (!userId) throw new Error('User ID is required to save an entry');
  const entryRef = doc(db, 'users', userId, 'entries', entry.id);
  await setDoc(entryRef, {
    ...entry,
    userId,
    updatedAt: Date.now()
  }, { merge: true });
};

export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  if (!userId) return [];
  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const entries: JournalEntry[] = [];
  snapshot.forEach((d) => {
    entries.push(d.data() as JournalEntry);
  });
  return entries;
};

export const deleteJournalEntry = async (userId: string, entryId: string): Promise<void> => {
  if (!userId || !entryId) throw new Error('User ID and Entry ID required');
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryRef);
};

export const toggleFavoriteEntry = async (userId: string, entryId: string, currentStatus: boolean): Promise<void> => {
  if (!userId || !entryId) return;
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await setDoc(entryRef, { isFavorite: !currentStatus, updatedAt: Date.now() }, { merge: true });
};

export const saveUserInsights = async (userId: string, report: MoodInsightReport): Promise<void> => {
  if (!userId) return;
  const reportRef = doc(db, 'users', userId, 'insights', 'latest');
  await setDoc(reportRef, report, { merge: true });
};

export const getUserInsights = async (userId: string): Promise<MoodInsightReport | null> => {
  if (!userId) return null;
  const reportRef = doc(db, 'users', userId, 'insights', 'latest');
  const snapshot = await getDoc(reportRef);
  if (snapshot.exists()) {
    return snapshot.data() as MoodInsightReport;
  }
  return null;
};
