import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDocFromServer,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Poster } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with explicit database ID from config
const dbId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-mp-44c6c9c3-dc3b-4b39-918d-9cc8608e9243';
export const db = getFirestore(app, dbId);

// Test Firestore connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection check: offline or checking network');
    }
  }
}

// Subscribe to real-time updates for posters (Instant View for Visitors)
export const subscribeToPosters = (
  onUpdate: (posters: Poster[]) => void,
  onError?: (err: Error) => void
) => {
  const postersCol = collection(db, 'posters');
  return onSnapshot(
    postersCol,
    (snapshot) => {
      const items: Poster[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Poster;
        if (data && data.id && data.title && data.imageUrl) {
          items.push(data);
        }
      });
      // Sort by addedAt descending or orderIndex
      items.sort((a, b) => {
        if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
          return a.orderIndex - b.orderIndex;
        }
        return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

// Fetch posters once
export const fetchPostersFromFirestore = async (): Promise<Poster[]> => {
  const postersCol = collection(db, 'posters');
  const snapshot = await getDocs(postersCol);
  const items: Poster[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Poster;
    if (data && data.id && data.title && data.imageUrl) {
      items.push(data);
    }
  });
  items.sort((a, b) => {
    if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
      return a.orderIndex - b.orderIndex;
    }
    return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
  });
  return items;
};

// Clean object helper to remove undefined fields before saving to Firestore
const sanitizeForFirestore = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj));
};

// Save a single poster to Firestore
export const savePosterToFirestore = async (poster: Poster): Promise<void> => {
  const posterRef = doc(db, 'posters', poster.id);
  const clean = sanitizeForFirestore(poster);
  await setDoc(posterRef, clean, { merge: true });
};

// Batch save multiple posters to Firestore
export const batchSavePostersToFirestore = async (posters: Poster[]): Promise<void> => {
  if (!posters || posters.length === 0) return;
  // Smaller chunk size (80) avoids payload limits and network congestion
  const CHUNK_SIZE = 80;
  for (let i = 0; i < posters.length; i += CHUNK_SIZE) {
    const chunk = posters.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const poster of chunk) {
      if (!poster.id) continue;
      const posterRef = doc(db, 'posters', poster.id);
      const clean = sanitizeForFirestore(poster);
      batch.set(posterRef, clean, { merge: true });
    }
    // Set 15-second timeout per batch to prevent hanging forever
    const commitPromise = batch.commit();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore commit timed out')), 15000)
    );
    await Promise.race([commitPromise, timeoutPromise]);
  }
};

// Delete a single poster from Firestore
export const deletePosterFromFirestore = async (posterId: string): Promise<void> => {
  const posterRef = doc(db, 'posters', posterId);
  await deleteDoc(posterRef);
};

// Batch delete posters from Firestore
export const batchDeletePostersFromFirestore = async (posterIds: string[]): Promise<void> => {
  if (!posterIds || posterIds.length === 0) return;
  const CHUNK_SIZE = 400;
  for (let i = 0; i < posterIds.length; i += CHUNK_SIZE) {
    const chunk = posterIds.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const id of chunk) {
      const posterRef = doc(db, 'posters', id);
      batch.delete(posterRef);
    }
    await batch.commit();
  }
};

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.setCustomParameters({ prompt: 'select_account' });

const TOKEN_KEY = 'mp_drive_access_token';
let isSigningIn = false;
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
})();

// Clear token on expiry
export const clearCachedAccessToken = () => {
  cachedAccessToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Keep user logged in even if token needs refresh
        if (onAuthSuccess) onAuthSuccess(user, '');
      }
    } else {
      cachedAccessToken = null;
      try {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      } catch {}
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Drive access token could not be obtained. ကျေးဇူးပြု၍ Drive permissions များကို ခွင့်ပြုပေးပါ။');
    }

    cachedAccessToken = credential.accessToken;
    try {
      localStorage.setItem(TOKEN_KEY, cachedAccessToken);
      sessionStorage.setItem(TOKEN_KEY, cachedAccessToken);
    } catch {}

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    const code = error?.code || '';
    if (code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'Netlify';
      throw new Error(
        `Firebase Unauthorized Domain Error: လက်ရှိ domain "${currentHost}" ကို Firebase Console -> Authentication -> Settings -> Authorized domains တွင် ထည့်သွင်းပေးရန် လိုအပ်ပါသည်ခင်ဗျာ။`
      );
    }
    if (code === 'auth/popup-blocked') {
      throw new Error('Browser မှ Pop-up ကို ပိတ်ထားသဖြင့် Google Login ဖွင့်၍မရပါ။ ကျေးဇူးပြု၍ Pop-up ခွင့်ပြုပေးပါ။');
    }
    if (code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In Pop-up ကို ပိတ်လိုက်သဖြင့် မအောင်မြင်ခဲ့ပါ။ ပြန်လည်ကြိုးစားပေးပါ။');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  clearCachedAccessToken();
};
