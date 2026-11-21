import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import API from '../services/api';

const AuthContext = createContext();
const SESSION_KEY = 'esurgalt.session';
const LEGACY_KEYS = ['user', 'token'];

const pickUser = (response) => {
  const data = response?.data ?? response;
  const profile = data?.suragch ?? data?.user ?? data;
  return profile?._id || profile?.id ? profile : null;
};

function readClaims(token) {
  if (!token) return null;
  try {
    const claims = jwtDecode(token);
    const id = claims.id || claims._id || claims.sub;
    return id && (claims.exp == null || claims.exp * 1000 > Date.now()) ? { ...claims, id } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef(null);
  const writes = useRef(Promise.resolve());

  const queueWrite = (operation) => {
    const write = writes.current.then(operation);
    writes.current = write.catch(() => {});
    return write;
  };

  const publish = (next) => {
    sessionRef.current = next;
    setSession(next);
  };

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        let saved;
        if (stored) {
          saved = JSON.parse(stored);
        } else {
          const entries = Object.fromEntries(await AsyncStorage.multiGet(LEGACY_KEYS));
          saved = { user: JSON.parse(entries.user || 'null'), token: entries.token };
        }

        const claims = readClaims(saved?.token);
        const profile = pickUser(saved?.user);
        if (claims && profile && String(claims.id) === String(profile._id || profile.id)) {
          if (active) publish({ user: profile, token: saved.token });
        } else {
          await AsyncStorage.multiRemove([SESSION_KEY, ...LEGACY_KEYS]);
        }
      } catch {
        // If storage is unavailable, the user can still open the sign-in form.
      } finally {
        if (active) setLoading(false);
      }
    }
    restore();
    return () => { active = false; };
  }, []);

  const login = async (email, password) => {
    const response = await API.login(email, password);
    const token = response?.token || response?.accessToken || response?.data?.token || response?.data?.accessToken;
    const claims = readClaims(token);
    if (!claims) throw new Error('Нэвтрэх мэдээлэл хүчингүй байна.');

    const user = pickUser(await API.getStudentById(claims.id, token));
    if (!user || String(user._id || user.id) !== String(claims.id)) {
      throw new Error('Хэрэглэгчийн мэдээлэл олдсонгүй.');
    }

    await queueWrite(async () => {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
      publish({ user, token });
    });
  };

  const logout = async () => {
    await queueWrite(async () => {
      await AsyncStorage.multiRemove([SESSION_KEY, ...LEGACY_KEYS]);
      publish(null);
    });
  };

  const updateUser = (changes) => {
    const token = session?.token;
    return queueWrite(async () => {
      const current = sessionRef.current;
      if (!token || current?.token !== token) return;
      const next = { ...current, user: { ...current.user, ...changes } };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ user: next.user, token }));
      if (sessionRef.current === current) publish(next);
    });
  };

  const refreshUser = async () => {
    if (!session) throw new Error('Дахин нэвтэрнэ үү.');
    const freshUser = pickUser(await API.getStudentById(session.user._id || session.user.id, session.token));
    if (!freshUser) throw new Error('Хэрэглэгчийн мэдээлэл олдсонгүй.');
    await updateUser(freshUser);
    return freshUser;
  };

  return (
    <AuthContext.Provider value={{
      user: session?.user,
      token: session?.token,
      loading,
      isAuthenticated: Boolean(session),
      login,
      logout,
      register: API.register,
      updateUser,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
