'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface DBUser {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  profile_image: string | null;
  role: string;
  created_at: string;
}

interface AuthContextType {
  firebaseUser: User | null;
  dbUser: DBUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  dbUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const syncUserWithDB = async (user: User) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          profile_image: user.photoURL,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Failed to sync user with DB:', err);
    }
    return null;
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await syncUserWithDB(firebaseUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncUserWithDB(user);
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const dbUserData = await syncUserWithDB(user);
      if (dbUserData) {
        if (dbUserData.role === 'counsellor') {
          router.push('/counsellor/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setDbUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, dbUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
