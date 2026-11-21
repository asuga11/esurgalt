import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../../assets/esurgalt-logo.png');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [height, setHeight] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  const handleLogin = async () => {
    if (pending.current) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Зөв имэйл хаяг оруулна уу.');
      return;
    }
    if (!password.trim()) {
      setError('Нууц үгээ оруулна уу.');
      return;
    }
    pending.current = true;
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (reason) {
      setError(reason?.message || 'Нэвтрэхэд алдаа гарлаа.');
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  const tight = height !== null && height < 560;
  const limited = height !== null && height < 390;
  const logoWidth = limited ? 112 : tight ? 212 : 268;

  return (
    <SafeAreaView className="flex-1 overflow-hidden bg-canvas">
      <View pointerEvents="none" className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-brand-100" />
      <View pointerEvents="none" className="absolute -bottom-40 -left-28 h-80 w-80 rounded-full bg-orange-100" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          onLayout={({ nativeEvent }) => setHeight(nativeEvent.layout.height)}
          className={`mx-auto w-full max-w-[440px] flex-1 px-4 ${tight ? 'pt-2' : 'pt-7'}`}
        >
          <View className={`items-center ${limited ? 'mb-1' : tight ? 'mb-3' : 'mb-6'}`}>
            <Image
              source={logo}
              resizeMode="contain"
              accessible
              accessibilityLabel="e-Сургалт"
              style={{ width: logoWidth, height: logoWidth * 362 / 1511, maxWidth: '100%' }}
            />
            {!limited && (
              <Text accessibilityRole="header" className={`${tight ? 'mt-1 text-xl' : 'mt-4 text-3xl'} text-center font-extrabold text-ink`}>
                Сурагч нэвтрэх
              </Text>
            )}
          </View>

          <View className={`rounded-[26px] border border-line bg-white shadow-card ${tight ? 'px-4 py-2' : 'px-5 py-5'}`}>
            <FormInput compact={tight} icon="mail-outline" label="Имэйл хаяг" value={email}
              onChangeText={(value) => { setEmail(value); setError(''); }}
              placeholder="ner@example.mn" keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!loading} />
            <FormInput compact={tight} icon="lock-closed-outline" label="Нууц үг" value={password}
              onChangeText={(value) => { setPassword(value); setError(''); }}
              placeholder="Нууц үгээ оруулна уу" secureTextEntry={!showPassword} autoCapitalize="none"
              autoComplete="current-password" editable={!loading} returnKeyType="go" onSubmitEditing={handleLogin}
              accessory={(
                <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Нууц үг нуух' : 'Нууц үг харуулах'}
                  className="h-11 w-11 items-center justify-center" onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#475569" />
                </Pressable>
              )} />
            {!!error && <Text accessibilityRole="alert" numberOfLines={2} className="rounded-xl bg-rose-50 px-3 py-1.5 text-sm text-rose-800">{error}</Text>}
            <CustomButton title="Нэвтрэх" onPress={handleLogin} loading={loading} compact={tight} />

            {!limited && (
              <Pressable accessibilityRole="button" className="mt-2 min-h-[44px] justify-center self-end"
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text className="text-sm font-bold text-brand-700">Нууц үгээ мартсан уу?</Text>
              </Pressable>
            )}
          </View>

          {!limited && (
            <View className="mt-1 flex-row items-center gap-x-3">
              <Pressable accessibilityRole="button" className="min-h-[44px] flex-1 items-center justify-center" onPress={() => navigation.navigate('Register')}>
                <Text className="text-sm font-bold text-brand-700">Бүртгүүлэх</Text>
              </Pressable>
              <Pressable accessibilityRole="button" className="min-h-[44px] flex-1 items-center justify-center" onPress={() => navigation.navigate('Verification')}>
                <Text className="text-center text-sm font-bold text-brand-700">Имэйл баталгаажуулах</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
