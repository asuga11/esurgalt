import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import API from '../services/api';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import ScreenWrapper from '../components/ScreenWrapper';

export default function ResetPasswordScreen({ route, navigation }) {
  const [resetToken, setResetToken] = useState(route?.params?.resetToken || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!resetToken.trim()) {
      Alert.alert('Анхаар', 'И-мэйлээр ирсэн нууц үг сэргээх холбоосын токеныг оруулна уу');
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert('Анхаар', 'Нууц үг хамгийн багадаа 6 тэмдэгт байна');
      return;
    }

    try {
      setLoading(true);
      const response = await API.resetPassword({
        resetToken: resetToken.trim(),
        password: password.trim(),
      });

      Alert.alert('Амжилттай', response?.message || 'Нууц үг амжилттай солигдлоо', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Нууц үг солиход алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <Text className="text-center text-3xl font-extrabold text-slate-900">Нууц үг шинэчлэх</Text>
        <Text className="mt-2 mb-5 text-center text-sm text-slate-500">
          Нууц үг сэргээх холбоос дахь токен болон шинэ нууц үгээ оруулна уу.
        </Text>

        <FormInput
          label="Сэргээх токен"
          value={resetToken}
          onChangeText={setResetToken}
          placeholder="Холбоос дахь resetToken"
          autoCapitalize="none"
        />

        <FormInput
          label="Шинэ нууц үг"
          value={password}
          onChangeText={setPassword}
          placeholder="******"
          secureTextEntry
          autoCapitalize="none"
        />

        <CustomButton title="Нууц үг шинэчлэх" onPress={handleReset} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}
