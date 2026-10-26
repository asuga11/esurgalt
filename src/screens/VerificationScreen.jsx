import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import API from '../services/api';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import ScreenWrapper from '../components/ScreenWrapper';

export default function VerificationScreen({ navigation }) {
  const [secretCode, setSecretCode] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);

  const handleVerify = async () => {
    if (!secretCode.trim()) {
      Alert.alert('Анхаар', 'Баталгаажуулах кодоо оруулна уу');
      return;
    }

    try {
      setLoadingVerify(true);
      const response = await API.verifyEmail(secretCode.trim());

      Alert.alert('Амжилттай', response?.message || 'И-мэйл амжилттай баталгаажлаа', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Баталгаажуулахад алдаа гарлаа');
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <Text className="text-center text-3xl font-extrabold text-slate-900">И-мэйл баталгаажуулах</Text>
        <Text className="mt-2 mb-5 text-center text-sm text-slate-500">
          Бүртгүүлэх үед таны и-мэйлд ирсэн баталгаажуулах кодыг оруулна уу.
        </Text>

        <FormInput
          label="Нууц код"
          value={secretCode}
          onChangeText={setSecretCode}
          placeholder="JPnwx8E1"
          autoCapitalize="none"
        />

        <CustomButton title="Баталгаажуулах" onPress={handleVerify} loading={loadingVerify} />
      </View>
    </ScreenWrapper>
  );
}
