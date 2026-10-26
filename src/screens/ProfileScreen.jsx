import React from 'react';
import { Alert, Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import ScreenWrapper from '../components/ScreenWrapper';

function SectionTitle({ title }) {
  return <Text className="mb-3 text-lg font-extrabold text-slate-900">{title}</Text>;
}

function InfoCard({ label, value }) {
  return (
    <View className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </Text>
      <Text className="mt-1 text-base font-semibold text-slate-900">
        {value ? String(value) : '-'}
      </Text>
    </View>
  );
}

function Badge({ text, type = 'default' }) {
  const styles =
    type === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : type === 'warning'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-brand-100 text-brand-700';

  return (
    <View className={`rounded-full px-3 py-1 ${styles.split(' ')[0]}`}>
      <Text className={`text-xs font-bold ${styles.split(' ')[1]}`}>{text}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, token, logout, refreshUser } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshUser();
      Alert.alert('Амжилттай', 'Мэдээлэл шинэчлэгдлээ');
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Шинэчлэхэд алдаа гарлаа');
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Та системээс гарахдаа итгэлтэй байна уу?');

      if (confirmed) {
        await logout();
      }

      return;
    }

    Alert.alert('Гарах', 'Та системээс гарахдаа итгэлтэй байна уу?', [
      { text: 'Болих', style: 'cancel' },
      { text: 'Гарах', style: 'destructive', onPress: logout },
    ]);
  };

  const profileImage =
    user?.image && user.image !== 'no image' && user.image.startsWith('http') ? user.image : null;

  const initials = `${user?.lastname?.charAt(0) || ''}${user?.firstname?.charAt(0) || '?'}`;
  const schoolName =
    user?.surguuli?.ner || user?.surguuli?.name || user?.surguuli || user?.school?.ner || '-';

  return (
    <ScreenWrapper scroll>
      <View className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card">
        <View className="items-center">
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              className="h-28 w-28 rounded-full border-4 border-brand-100"
            />
          ) : (
            <View className="h-28 w-28 items-center justify-center rounded-full border-4 border-brand-100 bg-brand-600">
              <Text className="text-3xl font-extrabold text-white">{initials}</Text>
            </View>
          )}

          <Text className="mt-4 text-2xl font-extrabold text-slate-900">
            {user?.butenNer || `${user?.lastname || ''} ${user?.firstname || ''}`.trim() || 'Хэрэглэгч'}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">{user?.email || '-'}</Text>

          <View className="mt-4 flex-row items-center gap-2">
            <Badge text={user?.isActive ? 'Идэвхтэй' : 'Идэвхгүй'} type={user?.isActive ? 'success' : 'warning'} />
            <Badge text={user?.secretToken || 'Баталгаажаагүй'} type={user?.secretToken === 'Баталгаажсан' ? 'success' : 'warning'} />
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-brand-50 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Сургууль
              </Text>
              <Text className="mt-1 text-lg font-extrabold text-brand-700">{schoolName}</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              className="rounded-2xl bg-white px-4 py-2"
              activeOpacity={0.85}
            >
              <Text className="font-bold text-brand-700">Засах</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-7">
          <SectionTitle title="Хувийн мэдээлэл" />
          <InfoCard label="Овог" value={user?.lastname} />
          <InfoCard label="Нэр" value={user?.firstname} />
          <InfoCard label="Хүйс" value={user?.gender} />
          <InfoCard label="Регистр" value={user?.regnum} />
          <InfoCard label="Баркод" value={user?.barcode} />
          <InfoCard label="Төлөв" value={user?.status} />
        </View>

        <View className="mt-4">
          <SectionTitle title="Холбоо барих ба сургууль" />
          <InfoCard label="Утас 1" value={user?.phone1} />
          <InfoCard label="Утас 2" value={user?.phone2} />
          <InfoCard label="Аймаг / Хот" value={user?.city} />
          <InfoCard label="Сум / Дүүрэг" value={user?.soum} />
          <InfoCard label="Сургууль" value={schoolName} />
          <InfoCard label="Бүлэг" value={user?.buleg?.ner || user?.buleg} />
          <InfoCard label="Төгсөлт" value={user?.onTugsult} />
          <InfoCard label="И-мэйл баталгаажуулалт" value={user?.secretToken} />
          <InfoCard label="Token" value={token ? 'Байгаа' : 'Ирээгүй'} />
        </View>

        <View className="mt-6">
          <CustomButton title="Мэдээлэл шинэчлэх" onPress={handleRefresh} />
          <CustomButton
            title="Мэдээлэл засах"
            variant="outline"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <CustomButton
            title="И-мэйл баталгаажуулах"
            variant="outline"
            onPress={() => navigation.navigate('Verification')}
          />
          <CustomButton title="Гарах" variant="danger" onPress={handleLogout} />
        </View>
      </View>
    </ScreenWrapper>
  );
}
