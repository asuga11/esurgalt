import React, { useRef, useState } from 'react';
import { usePreventRemove } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import InlineNotice from '../components/InlineNotice';
import PageIntro from '../components/PageIntro';
import ScreenWrapper from '../components/ScreenWrapper';

export default function EditProfileScreen({ navigation }) {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [leaveAction, setLeaveAction] = useState(null);

  const [form, setForm] = useState({
    lastname: String(user?.lastname ?? ''),
    firstname: String(user?.firstname ?? ''),
    gender: String(user?.gender ?? ''),
    phone1: String(user?.phone1 ?? ''),
    phone2: String(user?.phone2 ?? ''),
    social1: String(user?.social1 ?? ''),
    social2: String(user?.social2 ?? ''),
    city: String(user?.city ?? ''),
    soum: String(user?.soum ?? ''),
    buleg: typeof user?.buleg === 'string' ? user.buleg : user?.buleg?.ner || user?.buleg?.name || '',
    onTugsult: String(user?.onTugsult ?? ''),
    email: String(user?.email ?? ''),
  });

  const before = useRef(form);
  const hasChanges = Object.entries(form).some(([key, value]) => value.trim() !== before.current[key].trim());

  usePreventRemove(loading || hasChanges, ({ data }) => {
    if (loading) {
      setNotice({ message: 'Мэдээлэл хадгалагдаж байна. Түр хүлээнэ үү.' });
      return;
    }
    setLeaveAction(data.action);
  });
  const setField = (key, value) => {
    setNotice(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (loading) return;
    const userId = user?._id || user?.id;

    if (!userId || !token) {
      setNotice({ message: 'Нэвтрэх мэдээлэл олдсонгүй. Дахин нэвтэрнэ үү.' });
      return;
    }

    if (!form.lastname.trim() || !form.firstname.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setNotice({ message: 'Овог, нэр болон зөв имэйл хаяг оруулна уу.' });
      return;
    }

    const payload = Object.fromEntries(Object.entries(form)
      .filter(([key, value]) => value.trim() !== before.current[key].trim())
      .map(([key, value]) => [key, value.trim()]));
    if (!Object.keys(payload).length) {
      setNotice({ success: true, message: 'Өөрчлөлт оруулаагүй байна.' });
      return;
    }

    try {
      setLoading(true);
      setNotice(null);
      const response = await API.updateStudentById(userId, payload, token);
      const updatedUser = response?.suragch || response?.data?.suragch || response?.data?.user || payload;
      await updateUser(updatedUser);
      before.current = form;
      setNotice({ success: true, message: 'Мэдээлэл хадгалагдлаа.' });
    } catch (error) {
      setNotice({ message: error?.message || 'Мэдээлэл хадгалахад алдаа гарлаа.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <View className="mx-auto w-full max-w-[620px] rounded-[26px] border border-line bg-white p-4 shadow-card">
        <PageIntro title="Мэдээлэл засах" icon="create-outline" />

        <FormInput editable={!loading} label="Овог" value={form.lastname} onChangeText={(v) => setField('lastname', v)} placeholder="Овог" />
        <FormInput editable={!loading} label="Нэр" value={form.firstname} onChangeText={(v) => setField('firstname', v)} placeholder="Нэр" />
        <FormInput editable={!loading} label="Хүйс" value={form.gender} onChangeText={(v) => setField('gender', v)} placeholder="Хүйс" />
        <Text accessibilityRole="header" className="mb-3 mt-2 text-lg font-bold text-slate-900">Холбоо барих мэдээлэл</Text>
        <FormInput editable={!loading} label="Утас 1" value={form.phone1} onChangeText={(v) => setField('phone1', v)} placeholder="90100689" keyboardType="phone-pad" />
        <FormInput editable={!loading} label="Утас 2" value={form.phone2} onChangeText={(v) => setField('phone2', v)} placeholder="88439911" keyboardType="phone-pad" />
        <FormInput editable={!loading} label="Имэйл хаяг" value={form.email} onChangeText={(v) => setField('email', v)}
          keyboardType="email-address" autoComplete="email" autoCapitalize="none" />
        <FormInput editable={!loading} label="Facebook" value={form.social1} onChangeText={(v) => setField('social1', v)} placeholder="Social 1" />
        <FormInput editable={!loading} label="Instagram" value={form.social2} onChangeText={(v) => setField('social2', v)} placeholder="Social 2" />
        <Text accessibilityRole="header" className="mb-3 mt-2 text-lg font-bold text-slate-900">Сургуулийн мэдээлэл</Text>
        <FormInput editable={!loading} label="Аймаг / Хот" value={form.city} onChangeText={(v) => setField('city', v)} placeholder="Аймаг / Хот" />
        <FormInput editable={!loading} label="Сум / Дүүрэг" value={form.soum} onChangeText={(v) => setField('soum', v)} placeholder="Сум / Дүүрэг" />
        <FormInput editable={!loading} label="Бүлэг" value={form.buleg} onChangeText={(v) => setField('buleg', v)} placeholder="A" />
        <FormInput editable={!loading} label="Төгсөлт" value={form.onTugsult} onChangeText={(v) => setField('onTugsult', v)} placeholder="2026" />
        <InlineNotice message={notice?.message} success={notice?.success} />
        {notice?.success && <CustomButton title="Профайл руу буцах" variant="outline" onPress={() => navigation.goBack()} />}
        <CustomButton title="Хадгалах" onPress={handleSave} loading={loading} disabled={!hasChanges} />
        {leaveAction && (
          <ConfirmDialog title="Мэдээлэл засах хэсгээс гарах уу?"
            message="Хадгалаагүй өөрчлөлтүүд устах болно."
            cancelLabel="Засварлах" confirmLabel="Хадгалахгүй гарах"
            onCancel={() => setLeaveAction(null)}
            onConfirm={() => { setLeaveAction(null); navigation.dispatch(leaveAction); }} />
        )}
      </View>
    </ScreenWrapper>
  );
}
