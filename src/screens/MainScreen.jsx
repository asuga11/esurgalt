import React, { useCallback } from 'react';
import { ImageBackground, Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenWrapper from '../components/ScreenWrapper';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { useAuth } from '../context/AuthContext';
import { useLearningActivity } from '../context/LearningActivityContext';

function ActivityCard({ title, value, icon, onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title + (value == null ? '' : ' ' + value)}
      onPress={onPress} className="min-w-0 flex-1 rounded-[20px] border border-line bg-white p-3.5 active:bg-brand-50">
      <View className="flex-row items-center justify-between gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
          <Ionicons name={icon} size={20} color="#2b459f" />
        </View>
        <Text className="text-2xl font-extrabold text-ink">{value ?? '—'}</Text>
      </View>
      <Text className="mt-2 text-sm font-bold text-slate-700">{title}</Text>
    </Pressable>
  );
}

function HomeRow({ title, detail, icon, label, onPress, warm = false }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label || title} onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-[20px] border border-line bg-white p-3.5 active:bg-brand-50">
      <View className={`h-11 w-11 items-center justify-center rounded-[15px] ${warm ? 'bg-orange-100' : 'bg-brand-50'}`}>
        <Ionicons name={icon} size={22} color={warm ? '#9a3412' : '#2b459f'} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-extrabold text-ink">{title}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-slate-600">{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color="#64748b" />
    </Pressable>
  );
}

export default function MainScreen({ navigation }) {
  const { user } = useAuth();
  const { exams, courses, entries, refresh } = useLearningActivity();
  const { width } = useWindowDimensions();
  const roomy = width >= 720;
  const name = typeof user?.firstname === 'string' ? user.firstname.trim() : '';
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const available = exams?.filter((entry) => ['Хуваарилсан', 'Ажиллаж байна'].includes(entry?.info?.examStatus));
  const inProgress = available?.find((entry) => entry.info.examStatus === 'Ажиллаж байна' && entry.shalgalt?._id)?.shalgalt;
  const activeCourses = courses?.filter((entry) => entry?.suraltsagch?.status === 'Худалдаж авсан');
  const myCourse = activeCourses?.find(({ surgalt }) => surgalt?._id)?.surgalt;
  const newest = entries.find((entry) => !entry.read);

  const open = (route, params) => {
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    navigation.navigate(route, params, { pop: true });
  };

  return (
    <ScreenWrapper scroll bottomBar={<BottomNavigationBar active="home" navigation={navigation} />}>
      <ImageBackground source={require('../../assets/campus.jpg')} resizeMode="cover"
        style={{ marginBottom: 16, borderRadius: 26, overflow: 'hidden', backgroundColor: '#152449' }}
        imageStyle={{ width: '100%', height: '100%', opacity: 0.38 }}>
        <View className={roomy ? 'px-7 py-8' : 'px-4 pb-5 pt-5'}>
          <View className="mb-3 h-1 w-8 rounded-full bg-orange-300" />
          <Text accessibilityRole="header" className={`${roomy ? 'text-[34px]' : 'text-[27px]'} max-w-xl font-extrabold text-white`}>
            {name ? `Сайн байна уу, ${name}` : 'Тавтай морил'}
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <Pressable accessibilityRole="button" accessibilityLabel="Сургалтууд"
              onPress={() => open('Training', { tab: 'all' })}
              className="min-h-[44px] flex-row items-center gap-2 rounded-[14px] bg-white px-3 py-2">
              <Text className="font-extrabold text-brand-950">Сургалт үзэх</Text>
              <Ionicons name="arrow-forward" size={17} color="#2b459f" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="QR код уншуулах" onPress={() => open('QRScanner')}
              className="min-h-[44px] flex-row items-center gap-2 rounded-[14px] border border-white/40 bg-brand-950/60 px-3 py-2">
              <Ionicons name="qr-code-outline" size={18} color="#ffffff" />
              <Text className="font-bold text-white">QR уншуулах</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      <View className="mb-5 flex-row gap-2">
        <ActivityCard title="Миний сургалт" value={activeCourses?.length} icon="library-outline"
          onPress={() => open('Training', { tab: 'mine' })} />
        <ActivityCard title="Оролцох сорил" value={available?.length} icon="clipboard-outline"
          onPress={() => inProgress ? open('Quiz', { examId: inProgress._id }) : open('QuizList')} />
      </View>

      {(inProgress || myCourse) && (
        <View className="mb-4">
          <Text accessibilityRole="header" className="mb-2 text-lg font-extrabold text-ink">Үргэлжлүүлэх</Text>
          {!!inProgress && <HomeRow title="Сорил үргэлжлүүлэх" detail={inProgress.name || 'Сорил'} icon="play-outline"
            onPress={() => open('Quiz', { examId: inProgress._id })} />}
          {!!myCourse && <HomeRow title="Миний сургалт үзэх" detail={myCourse.name || 'Сургалт'} icon="book-outline"
            onPress={() => open('Course', { courseId: myCourse._id })} />}
        </View>
      )}

      {!!newest && <HomeRow title={newest.title} detail={newest.name} icon="notifications-outline" warm
        label="Сүүлийн мэдэгдлийг харах" onPress={() => open('Notifications')} />}
      <HomeRow title="ЭЕШ-ын сорил" detail="Хичээлээр хайж, сорил сонгох" icon="document-text-outline"
        onPress={() => open('QuizList')} />
    </ScreenWrapper>
  );
}
