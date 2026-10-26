import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import API from '../services/api';

const AuthContext = createContext();

const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
};

const pickUser = (response) =>
  response?.suragch ||
  response?.user ||
  response?.data?.suragch ||
  response?.data?.user ||
  response?.data ||
  (response?._id || response?.id ? response : null) ||
  null;

const pickToken = (response) =>
  response?.token ||
  response?.accessToken ||
  response?.data?.token ||
  response?.data?.accessToken ||
  null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAuthData = async (savedUser, savedToken) => {
    try {
      setUser(savedUser);
      setToken(savedToken);

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(savedUser));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, savedToken);
    } catch (error) {
      console.log('saveAuthData error:', error);
      throw new Error('Хэрэглэгчийн мэдээлэл хадгалах үед алдаа гарлаа');
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
    } catch (error) {
      console.log('clearStorage error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const loginResponse = await API.login(email, password);
      const returnedToken = pickToken(loginResponse);

      if (!returnedToken) {
        throw new Error('Token ирсэнгүй');
      }

      const decodedToken = jwtDecode(returnedToken);
      const userId = decodedToken?.id || decodedToken?._id || decodedToken?.sub;

      if (!userId) {
        throw new Error('Token дотор хэрэглэгчийн ID олдсонгүй');
      }

      const userResponse = await API.getStudentById(userId, returnedToken);
      const returnedUser = pickUser(userResponse);

      if (!returnedUser) {
        throw new Error('Хэрэглэгчийн мэдээлэл ирсэнгүй');
      }

      await saveAuthData(returnedUser, returnedToken);

      return {
        success: true,
        token: returnedToken,
        suragch: returnedUser,
      };
    } catch (error) {
      throw new Error(error?.message || 'Нэвтрэх үед алдаа гарлаа');
    }
  };

  const register = async (formData) => {
    try {
      return await API.register(formData);
    } catch (error) {
      throw new Error(error?.message || 'Бүртгүүлэх үед алдаа гарлаа');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await clearStorage();
    } catch (error) {
      console.log('logout error:', error);
    }
  };

  const checkLogin = async () => {
    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      if (savedToken) {
        setToken(savedToken);
      }
    } catch (error) {
      console.log('checkLogin error:', error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUserId = user?._id || user?.id;

      if (!currentUserId) {
        throw new Error('Хэрэглэгчийн ID олдсонгүй');
      }

      const response = await API.getStudentById(currentUserId, token);
      const freshUser = pickUser(response);

      if (!freshUser) {
        throw new Error('Шинэ хэрэглэгчийн мэдээлэл ирсэнгүй');
      }

      setUser(freshUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));

      return freshUser;
    } catch (error) {
      console.log('refreshUser error:', error);
      throw new Error(error?.message || 'Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа');
    }
  };

  const updateUser = async (newUserData) => {
    try {
      const updatedUser = {
        ...user,
        ...newUserData,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    } catch (error) {
      console.log('updateUser error:', error);
      throw new Error('Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа');
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      checkLogin,
      refreshUser,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
