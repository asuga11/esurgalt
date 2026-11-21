import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Image, Platform, Text, View } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import HeaderActions from '../components/HeaderActions';
import { LearningActivityProvider } from '../context/LearningActivityContext';
import NotificationsScreen from '../screens/NotificationsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import MainScreen from '../screens/MainScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import QuizScreen from '../screens/QuizScreen';
import LessonPlayer from '../components/LessonPlayer';
import CourseScreen from '../screens/CourseScreen';
import TrainingScreen from '../screens/TrainingScreen';
import QuizListScreen from '../screens/QuizListScreen';

const Stack = createNativeStackNavigator();

function WebScreenLayout({ children }) {
  const region = useRef(null);

  useFocusEffect(useCallback(() => {
    const frame = window.requestAnimationFrame(() => {
      const root = region.current;
      if (!root || root.contains(document.activeElement)) return;
      const heading = root.querySelector('h1, [role="heading"]');
      const target = heading || root;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []));

  return <View ref={region} role="main" style={{ flex: 1 }} tabIndex={-1}>{children}</View>;
}

const screenLayout = Platform.OS === 'web'
  ? ({ children }) => <WebScreenLayout>{children}</WebScreenLayout>
  : undefined;

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <ActivityIndicator size="large" color="#3754bf" />
      <Text className="mt-3 text-sm font-semibold text-slate-500">
        Түр хүлээнэ үү...
      </Text>
    </View>
  );
}

const commonOptions = {
  orientation: 'portrait_up',
  headerStyle: {
    backgroundColor: '#ffffff',
  },
  headerTintColor: '#182641',
  headerShadowVisible: true,
  headerBackButtonDisplayMode: 'minimal',
  headerTitleStyle: {
    fontWeight: '800',
  },
};

const authenticatedOptions = ({ navigation, route }) => ({
  ...commonOptions,
  headerRight: route.name !== 'Quiz' && route.name !== 'Lesson'
    ? () => <HeaderActions navigation={navigation} currentRoute={route.name} />
    : undefined,
});

const homeOptions = {
  title: 'E-Surgalt',
  headerTitle: () => (
    <Image source={require('../../assets/esurgalt-logo.png')}
      style={{ width: 116, height: 28 }} resizeMode="contain" accessibilityLabel="e-Сургалт" />
  ),
};

export default function AppNavigator() {
  const { isAuthenticated, loading, user, token } = useAuth();
  const memberId = user?._id || user?.id;

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'guest'}>
      {isAuthenticated ? (
        <LearningActivityProvider key={memberId} memberId={memberId} token={token}>
          <Stack.Navigator initialRouteName="Main" screenOptions={authenticatedOptions} screenLayout={screenLayout}>
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={homeOptions}
            />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Мэдэгдэл' }} />
            <Stack.Screen
              name="Training"
              component={TrainingScreen}
              options={{ title: 'Сургалт' }}
            />
            <Stack.Screen name="Course" component={CourseScreen} options={{ title: 'Сургалт' }} />
            <Stack.Screen name="Lesson" component={LessonPlayer} options={{ headerShown: false, title: 'Хичээл' }} />
            <Stack.Screen
              name="QuizList"
              component={QuizListScreen}
              options={{ title: 'Сорилууд' }}
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
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{ title: 'Сорилын QR уншуулах' }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ title: 'Сорил' }}
            />
          </Stack.Navigator>
        </LearningActivityProvider>
      ) : (
        <Stack.Navigator initialRouteName="Login" screenOptions={commonOptions} screenLayout={screenLayout}>
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
