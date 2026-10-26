import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import ScreenWrapper from '../components/ScreenWrapper';

export default function EditProfileScreen({ navigation }) {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    lastname: user?.lastname || '',
    firstname: user?.firstname || '',
    gender: user?.gender || '',
    phone1: user?.phone1 || '',
    phone2: user?.phone2 || '',
    social1: user?.social1 || '',
    social2: user?.social2 || '',
    city: user?.city || '',
    soum: user?.soum || '',
    buleg: user?.buleg || '',
    onTugsult: user?.onTugsult || '',
    email: user?.email || '',
  });

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const userId = user?._id || user?.id;

    if (!userId) {
      Alert.alert('Алдаа', 'Хэрэглэгчийн ID олдсонгүй');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...user,
        ...form,
      };

      const response = await API.updateStudentById(userId, payload, token);
      const updatedUser = response?.suragch || response?.data?.suragch || response?.data || payload;

      await updateUser(updatedUser);

      Alert.alert('Амжилттай', 'Мэдээлэл хадгалагдлаа', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Мэдээлэл хадгалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <Text className="mb-5 text-center text-3xl font-extrabold text-slate-900">
          Мэдээлэл засах
        </Text>

        <FormInput label="Овог" value={form.lastname} onChangeText={(v) => setField('lastname', v)} placeholder="Овог" />
        <FormInput label="Нэр" value={form.firstname} onChangeText={(v) => setField('firstname', v)} placeholder="Нэр" />
        <FormInput label="Хүйс" value={form.gender} onChangeText={(v) => setField('gender', v)} placeholder="Хүйс" />
        <FormInput label="Утас 1" value={form.phone1} onChangeText={(v) => setField('phone1', v)} placeholder="90100689" keyboardType="phone-pad" />
        <FormInput label="Утас 2" value={form.phone2} onChangeText={(v) => setField('phone2', v)} placeholder="88439911" keyboardType="phone-pad" />
        <FormInput label="Social 1" value={form.social1} onChangeText={(v) => setField('social1', v)} placeholder="Social 1" />
        <FormInput label="Social 2" value={form.social2} onChangeText={(v) => setField('social2', v)} placeholder="Social 2" />
        <FormInput label="Аймаг / Хот" value={form.city} onChangeText={(v) => setField('city', v)} placeholder="Аймаг / Хот" />
        <FormInput label="Сум / Дүүрэг" value={form.soum} onChangeText={(v) => setField('soum', v)} placeholder="Сум / Дүүрэг" />
        <FormInput label="Бүлэг" value={form.buleg} onChangeText={(v) => setField('buleg', v)} placeholder="A" />
        <FormInput label="Төгсөлт" value={form.onTugsult} onChangeText={(v) => setField('onTugsult', v)} placeholder="2026" />
        <FormInput label="И-мэйл" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" />

        <CustomButton title="Хадгалах" onPress={handleSave} loading={loading} />
      </View>
    </ScreenWrapper>
  );
}
