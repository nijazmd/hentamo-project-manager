import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInDemo: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(currentUser => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInDemo = async () => {
    setIsLoading(true);
    const u = await authService.signInDemo();
    setUser(u);
    setIsLoading(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await authService.signInWithEmail(email, pass);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const u = await authService.signUpWithEmail(email, pass);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const u = await authService.signInWithGoogle();
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInDemo,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
