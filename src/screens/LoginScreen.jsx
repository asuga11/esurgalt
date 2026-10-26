import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import ScreenWrapper from '../components/ScreenWrapper';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async () => {
    if (!email.trim() || !validateEmail(email.trim())) {
      Alert.alert('Анхаар', 'Зөв и-мэйл оруулна уу');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Анхаар', 'Нууц үгээ оруулна уу');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password.trim());
      Alert.alert('Амжилттай', 'Та амжилттай нэвтэрлээ');
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <View className="mb-6 items-center">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-brand-100">
            <Text className="text-3xl">🎓</Text>
          </View>
          <Text className="text-3xl font-extrabold text-slate-900">Сурагч нэвтрэх</Text>
          <Text className="mt-2 text-center text-sm text-slate-500">
            И-мэйл болон нууц үгээрээ системд нэвтэрнэ үү.
          </Text>
        </View>

        <FormInput
          label="И-мэйл"
          value={email}
          onChangeText={setEmail}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          label="Нууц үг"
          value={password}
          onChangeText={setPassword}
          placeholder="******"
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity className="self-end" onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-sm font-semibold text-brand-600">Нууц үгээ мартсан уу?</Text>
        </TouchableOpacity>

        <CustomButton title="Нэвтрэх" onPress={handleLogin} loading={loading} />

        <CustomButton
          title="И-мэйл баталгаажуулах"
          variant="outline"
          onPress={() => navigation.navigate('Verification')}
        />

        <View className="mt-5 flex-row items-center justify-center">
          <Text className="text-sm text-slate-500">Бүртгэлгүй юу?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="ml-2 text-sm font-bold text-brand-600">Бүртгүүлэх</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
