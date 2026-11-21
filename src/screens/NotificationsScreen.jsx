import React, { useCallback, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenWrapper from '../components/ScreenWrapper';
import PageIntro from '../components/PageIntro';
import ChoiceTabs from '../components/ChoiceTabs';
import CollectionState from '../components/CollectionState';
import CustomButton from '../components/CustomButton';
import InlineNotice from '../components/InlineNotice';
import { useLearningActivity } from '../context/LearningActivityContext';

const filters = [['all', 'Бүгд'], ['unread', 'Уншаагүй']];

export default function NotificationsScreen({ navigation }) {
  const { entries, unread, loading, error, refresh, markRead, markAllRead } = useLearningActivity();
  const [filter, setFilter] = useState('all');
  const visible = filter === 'unread' ? entries.filter((entry) => !entry.read) : entries;
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const open = (entry) => {
    markRead(entry.id);
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    if (entry.kind === 'exam') navigation.navigate('Quiz', { examId: entry.targetId });
    else navigation.navigate('Course', { courseId: entry.targetId });
  };

  return (
    <ScreenWrapper scroll>
      <PageIntro title="Мэдэгдэл" description={unread ? `${unread} уншаагүй мэдэгдэл` : 'Сорил болон сургалтын мэдээлэл'} icon="notifications-outline" />
      {entries.length > 0 && <ChoiceTabs label="Мэдэгдэл шүүх" options={filters} value={filter} onChange={setFilter} />}
      {unread > 0 && (
        <Pressable accessibilityRole="button" onPress={markAllRead}
          className="mb-2 min-h-[44px] justify-center self-end px-2">
          <Text className="font-bold text-brand-700">Бүгдийг уншсан болгох</Text>
        </Pressable>
      )}
      {entries.length === 0 && (
        loading ? <CollectionState state="loading" title="Мэдэгдэл ачаалж байна…" /> :
          error ? <CollectionState state="error" title="Мэдэгдэл шинэчилж чадсангүй" action={refresh} /> :
            <CollectionState state="empty" title="Одоогоор мэдэгдэл алга" action={refresh} actionLabel="Шинэчлэх" />
      )}
      {entries.length > 0 && (
        <>
          {error && <InlineNotice message="Зарим мэдэгдлийг шинэчилж чадсангүй." />}
          {!visible.length && (
            <CollectionState state="empty" title="Уншаагүй мэдэгдэл алга"
              actionLabel="Бүх мэдэгдэл харах" action={() => setFilter('all')} />
          )}
          {visible.map((entry) => (
            <Pressable key={entry.id} accessibilityRole="button"
              accessibilityLabel={`${entry.title}. ${entry.name}.${entry.read ? '' : ' Уншаагүй.'}`}
              onPress={() => open(entry)}
              className={`mb-2 flex-row items-center gap-3 rounded-2xl border p-3 ${entry.read ? 'border-line bg-white' : 'border-brand-200 bg-brand-50'}`}>
              <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-brand-50">
                <Ionicons name={entry.kind === 'exam' ? 'document-text-outline' : 'book-outline'} size={21} color="#2b459f" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="font-extrabold text-ink">{entry.title}</Text>
                <Text className="mt-1 text-sm text-slate-600">{entry.name}</Text>
              </View>
              {!entry.read && <View className="h-2.5 w-2.5 rounded-full bg-brand-700" />}
            </Pressable>
          ))}
          <CustomButton title="Шинэчлэх" variant="outline" loading={loading} onPress={refresh} />
        </>
      )}
    </ScreenWrapper>
  );
}
