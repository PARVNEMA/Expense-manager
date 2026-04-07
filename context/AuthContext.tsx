import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import * as SQLite from 'expo-sqlite';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const DB_NAME = 'auth.sqlite';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [database, setDatabase] = useState<SQLite.SQLiteDatabase | null>(null);

  const getCurrentUser = useCallback(async (db: SQLite.SQLiteDatabase) => {
    const row = await db.getFirstAsync<{
      id: string;
      full_name: string;
      email: string;
      created_at: string;
    }>(
      `SELECT u.id, u.full_name, u.email, u.created_at
       FROM auth_session s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = 1
       LIMIT 1`,
    );

    if (!row) {
      setUser(null);
      return;
    }

    setUser({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      createdAt: row.created_at,
    });
  }, []);

  const setSession = useCallback(
    async (db: SQLite.SQLiteDatabase, userId: string | null) => {
      await db.runAsync(
        `INSERT INTO auth_session (id, user_id, updated_at)
         VALUES (1, ?, ?)
         ON CONFLICT(id)
         DO UPDATE SET user_id = excluded.user_id, updated_at = excluded.updated_at`,
        [userId, new Date().toISOString()],
      );
    },
    [],
  );

  useEffect(() => {
    let isActive = true;

    const initDb = async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS auth_session (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          user_id TEXT,
          updated_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `);

      if (!isActive) return;
      setDatabase(db);
      await getCurrentUser(db);
      setIsLoaded(true);
    };

    initDb().catch((error) => {
      console.error('Failed to initialize local database:', error);
      setIsLoaded(true);
    });

    return () => {
      isActive = false;
    };
  }, [getCurrentUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!database) return;

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password.trim()) {
        throw new Error('Email and password are required.');
      }

      const foundUser = await database.getFirstAsync<{
        id: string;
        full_name: string;
        email: string;
        created_at: string;
      }>(
        `SELECT id, full_name, email, created_at
         FROM users
         WHERE email = ? AND password = ?
         LIMIT 1`,
        [normalizedEmail, password],
      );

      if (!foundUser) {
        throw new Error('Invalid email or password.');
      }

      await setSession(database, foundUser.id);
      await getCurrentUser(database);
    },
    [database, getCurrentUser, setSession],
  );

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      if (!database) return;

      const normalizedName = fullName.trim();
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = password.trim();

      if (!normalizedName || !normalizedEmail || !normalizedPassword) {
        throw new Error('Name, email, and password are required.');
      }

      const existingUser = await database.getFirstAsync<{ id: string }>(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [normalizedEmail],
      );

      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date().toISOString();

      await database.runAsync(
        `INSERT INTO users (id, full_name, email, password, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, normalizedName, normalizedEmail, normalizedPassword, createdAt],
      );

      await setSession(database, id);
      await getCurrentUser(database);
    },
    [database, getCurrentUser, setSession],
  );

  const signOut = useCallback(async () => {
    if (!database) return;
    await setSession(database, null);
    setUser(null);
  }, [database, setSession]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoaded,
      signIn,
      signUp,
      signOut,
    }),
    [isLoaded, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
