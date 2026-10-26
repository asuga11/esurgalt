import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import MainScreen from '../screens/MainScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <ActivityIndicator size="large" color="#4f46e5" />
      <Text className="mt-3 text-sm font-semibold text-slate-500">
        Түр хүлээнэ үү...
      </Text>
    </View>
  );
}

const commonOptions = {
  headerStyle: {
    backgroundColor: '#4f46e5',
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontWeight: '700',
  },
};

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'guest'}>
      {isAuthenticated ? (
        <Stack.Navigator initialRouteName="Main" screenOptions={commonOptions}>
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ title: 'E-Surgalt' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Миний мэдээлэл' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Профайл засах' }}
          />
          <Stack.Screen
            name="Verification"
            component={VerificationScreen}
            options={{ title: 'И-мэйл баталгаажуулах' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Login" screenOptions={commonOptions}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Бүртгүүлэх' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Нууц үг сэргээх' }}
          />
          <Stack.Screen
            name="Verification"
            component={VerificationScreen}
            options={{ title: 'И-мэйл баталгаажуулах' }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: 'Нууц үг шинэчлэх' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
