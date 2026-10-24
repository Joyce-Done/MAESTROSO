import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAuthProfile } from '../types';

// Ensure single Firebase instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Connection test
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connecting...');
    }
  }
}
testFirestoreConnection();

// Google OAuth Provider for Sheets access
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in in progress
let isSigningIn = false;
// In-memory access token cache
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: UserAuthProfile, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const profile: UserAuthProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      };

      if (onAuthSuccess) {
        onAuthSuccess(profile, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{
  profile: UserAuthProfile;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      console.warn('No access token returned from Google Auth popup');
    }

    cachedAccessToken = credential?.accessToken || null;

    const profile: UserAuthProfile = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
      photoURL: result.user.photoURL,
      isAnonymous: false,
    };

    return {
      profile,
      accessToken: cachedAccessToken || '',
    };
  } catch (error: any) {
    const errorCode = error?.code || '';
    if (
      errorCode === 'auth/popup-closed-by-user' ||
      errorCode === 'auth/cancelled-popup-request' ||
      errorCode === 'auth/user-cancelled'
    ) {
      // User simply closed or dismissed the Google sign-in dialog without completing
      console.info('Google sign-in popup dismissed by user.');
      return null;
    }

    if (errorCode === 'auth/popup-blocked') {
      console.warn('Google sign-in popup was blocked by the browser. Please allow popups for this site.');
      return null;
    }

    console.warn('Google sign-in attempt completed without authentication:', error?.message || error);
    return null;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logOutUser = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (err) {
    console.error('Logout error:', err);
  }
};
