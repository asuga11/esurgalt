import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import API from '../services/api';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import ScreenWrapper from '../components/ScreenWrapper';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    if (!validateEmail(email.trim())) {
      Alert.alert('Анхаар', 'Зөв и-мэйл оруулна уу');
      return;
    }

    try {
      setLoading(true);
      const response = await API.forgotPassword(email.trim());

      Alert.alert('Амжилттай', response?.message || 'Хүсэлт илгээгдлээ', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }),
        },
      ]);
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Хүсэлт илгээхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <Text className="text-center text-3xl font-extrabold text-slate-900">Нууц үг сэргээх</Text>
        <Text className="mt-2 mb-5 text-center text-sm text-slate-500">
          И-мэйлээ оруулаад сэргээх хүсэлт явуулна уу.
        </Text>

        <FormInput
          label="И-мэйл"
          value={email}
          onChangeText={setEmail}
          placeholder="example@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomButton title="Илгээх" onPress={handleSubmit} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}
