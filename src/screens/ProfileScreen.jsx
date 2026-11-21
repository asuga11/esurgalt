import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomButton from '../components/CustomButton';
import InlineNotice from '../components/InlineNotice';
import ScreenWrapper from '../components/ScreenWrapper';
import BottomNavigationBar from '../components/BottomNavigationBar';

function display(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value?.ner || value?.name || value?.butenNer || '';
}

function Information({ title, entries }) {
  return (
    <View className="mt-4 rounded-2xl border border-line bg-white p-4">
      <Text accessibilityRole="header" className="mb-2 text-lg font-extrabold text-slate-900">{title}</Text>
      {entries.map(([label, value]) => (
        <View key={label} className="min-h-[44px] flex-row flex-wrap items-baseline justify-between gap-x-3 border-b border-slate-100 py-2">
          <Text className="text-sm text-slate-600">{label}</Text>
          <Text className="max-w-full text-sm font-semibold text-slate-900">{display(value) || '—'}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [working, setWorking] = useState('');
  const [notice, setNotice] = useState(null);
  const [askLogout, setAskLogout] = useState(false);
  const [failedImage, setFailedImage] = useState(null);
  const verified = user?.secretToken === 'Баталгаажсан' || user?.isVerified === true;

  const run = async (kind, action) => {
    if (working) return;
    setWorking(kind);
    setNotice(null);
    try {
      await action();
      if (kind === 'refresh') setNotice({ success: true, message: 'Мэдээлэл шинэчлэгдлээ.' });
    } catch (reason) {
      setNotice({ message: reason?.message || 'Дахин оролдоно уу.' });
    } finally {
      setWorking('');
    }
  };

  const imageUrl = typeof user?.image === 'string' && /^https?:\/\//i.test(user.image) ? user.image : null;
  const name = display(user?.butenNer) || [display(user?.lastname), display(user?.firstname)].filter(Boolean).join(' ');
  const initials = [display(user?.lastname)[0], display(user?.firstname)[0]].filter(Boolean).join('') || '?';

  return (
    <ScreenWrapper scroll bottomBar={<BottomNavigationBar navigation={navigation} />}>
      <View className="overflow-hidden rounded-[26px] border border-line bg-white">
        <View className="flex-row items-center gap-3 bg-brand-950 px-4 py-5">
          {imageUrl && imageUrl !== failedImage ? (
            <Image source={{ uri: imageUrl }} onError={() => setFailedImage(imageUrl)} className="h-16 w-16 rounded-[20px] bg-white" />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-[20px] bg-brand-600">
              <Text className="text-xl font-extrabold text-white">{initials}</Text>
            </View>
          )}
          <View className="min-w-0 flex-1">
            <Text accessibilityRole="header" className="text-xl font-extrabold text-white">{name || 'Миний профайл'}</Text>
            {!!user?.email && <Text className="mt-1 text-sm text-brand-100">{display(user.email)}</Text>}
            <Text className={`mt-1 text-xs font-semibold ${verified ? 'text-emerald-200' : 'text-amber-200'}`}>
              {verified ? 'Имэйл баталгаажсан' : 'Имэйл баталгаажаагүй'}
            </Text>
          </View>
        </View>
        <View className="gap-2 p-3">
        <CustomButton title="Мэдээлэл засах" compact onPress={() => navigation.navigate('EditProfile')} />
        {!verified && <CustomButton title="Имэйл баталгаажуулах" variant="outline" compact
          onPress={() => navigation.navigate('Verification')} />}
        </View>
      </View>

      <Information title="Хувийн мэдээлэл" entries={[
        ['Овог', user?.lastname], ['Нэр', user?.firstname], ['Хүйс', user?.gender],
        ['Регистр', user?.regnum], ['Баркод', user?.barcode], ['Төлөв', user?.status],
      ]} />
      <Information title="Холбоо барих ба сургууль" entries={[
        ['Утас', user?.phone1], ['Нэмэлт утас', user?.phone2],
        ['Аймаг / Хот', user?.city], ['Сум / Дүүрэг', user?.soum], ['Сургууль', display(user?.surguuli) || display(user?.school)],
        ['Бүлэг', user?.buleg], ['Төгсөлт', user?.onTugsult],
      ]} />

      <View className="mt-4">
        <InlineNotice message={notice?.message} success={notice?.success} />
        <CustomButton title="Мэдээлэл шинэчлэх" variant="outline" onPress={() => run('refresh', refreshUser)}
          loading={working === 'refresh'} disabled={working === 'logout'} />
        <CustomButton title="Гарах" variant="danger" onPress={() => setAskLogout(true)}
          loading={working === 'logout'} disabled={working === 'refresh'} />
        {askLogout && (
          <ConfirmDialog title="Аппаас гарах уу?" message="Дахин ашиглахдаа нэвтрэх шаардлагатай."
            cancelLabel="Үлдэх" confirmLabel="Гарахыг баталгаажуулах" onCancel={() => setAskLogout(false)}
            onConfirm={() => { setAskLogout(false); run('logout', logout); }} />
        )}
      </View>
    </ScreenWrapper>
  );
}
