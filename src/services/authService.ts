import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../types';

const DEMO_USER: UserProfile = {
  uid: 'user-hentamo-solo',
  email: 'nijas@hentamo.com',
  displayName: 'Nijas Moideen',
  photoURL: undefined,
  isAnonymous: false,
};

const LOCAL_STORAGE_USER_KEY = 'hentamo_pm_user';

export const authService = {
  getCurrentUser(): UserProfile | null {
    if (!isFirebaseConfigured || !auth) {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : DEMO_USER;
    }
    const current = auth.currentUser;
    if (!current) return null;
    return {
      uid: current.uid,
      email: current.email,
      displayName: current.displayName || 'Hentamo Developer',
      photoURL: current.photoURL || undefined,
    };
  },

  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      const user = this.getCurrentUser();
      callback(user);
      return () => {};
    }

    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Hentamo Developer',
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else {
        callback(null);
      }
    });
  },

  async signInDemo(): Promise<UserProfile> {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEMO_USER));
    return DEMO_USER;
  },

  async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth) {
      const user: UserProfile = {
        uid: 'user-hentamo-solo',
        email,
        displayName: email.split('@')[0],
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
    };
  },

  async signUpWithEmail(email: string, pass: string): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth) {
      return this.signInWithEmail(email, pass);
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
    };
  },

  async signInWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured || !auth) {
      return this.signInDemo();
    }
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName,
      photoURL: cred.user.photoURL || undefined,
    };
  },

  async signOut(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      return;
    }
    await firebaseSignOut(auth);
  },
};
