import React, { useCallback, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenWrapper from '../components/ScreenWrapper';
import BottomNavigationBar from '../components/BottomNavigationBar';
import ChoiceTabs from '../components/ChoiceTabs';
import CourseCatalog from '../components/CourseCatalog';
import PageIntro from '../components/PageIntro';
import CollectionState from '../components/CollectionState';
import { useAuth } from '../context/AuthContext';
import API, { SERVER_URL } from '../services/api';

const trainingTabs = [['all', 'Бүх сургалт'], ['mine', 'Миний сургалт']];

export default function TrainingScreen({ navigation, route }) {
  const requestedTab = route.params?.tab;
  const [tab, setTab] = useState(requestedTab === 'mine' ? 'mine' : 'all');
  useFocusEffect(useCallback(() => {
    if (requestedTab !== 'all' && requestedTab !== 'mine') return;
    setTab(requestedTab);
    navigation.setParams({ tab: undefined });
  }, [navigation, requestedTab]));
  const [query, setQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const openCourse = (courseId) => navigation.navigate('Course', { courseId });

  return (
    <ScreenWrapper scroll bottomBar={<BottomNavigationBar active="training" navigation={navigation} />}>
      <PageIntro title="Сургалтууд" icon="book-outline" />
      <ChoiceTabs label="Сургалтын жагсаалт" options={trainingTabs} value={tab} onChange={setTab} />
      {tab === 'all' ? (
        <CourseCatalog onSelect={openCourse} query={query} setQuery={setQuery}
          priceFilter={priceFilter} setPriceFilter={setPriceFilter} />
      ) : (
        <MemberCourses onSelect={openCourse} onBrowse={() => setTab('all')} />
      )}
    </ScreenWrapper>
  );
}

function MemberCourses({ onSelect, onBrowse }) {
  const { user, token } = useAuth();
  const memberId = user?._id || user?.id;
  const [request, setRequest] = useState({ status: 'loading', courses: [], error: '' });
  const [retry, setRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setRequest({ status: 'loading', courses: [], error: '' });
    API.getMemberCourses(memberId, token, controller.signal).then((response) => {
      const courses = (response?.data ?? response)?.surgaltuud;
      if (!Array.isArray(courses)) throw new Error('Сургалтын мэдээлэл буруу байна.');
      if (!controller.signal.aborted) {
        setRequest({ status: 'ready', courses: courses.filter((item) => item?.surgalt?._id), error: '' });
      }
    }).catch((error) => {
      if (!controller.signal.aborted) setRequest({ status: 'error', courses: [], error: error.message });
    });
    return () => controller.abort();
  }, [memberId, token, retry]));

  return (
    <>
      {request.status === 'loading' && <CollectionState state="loading" title="Сургалт ачаалж байна…" />}
      {request.status === 'error' && (
        <CollectionState state="error" title="Сургалтыг ачаалж чадсангүй" detail={request.error}
          action={() => setRetry((value) => value + 1)} />
      )}
      {request.status === 'ready' && !request.courses.length && (
        <CollectionState state="empty" title="Бүртгүүлсэн сургалт алга"
          actionLabel="Бүх сургалт үзэх" action={onBrowse} />
      )}
      {request.courses.map(({ surgalt: course, suraltsagch }) => {
        const active = suraltsagch?.status === 'Худалдаж авсан';
        return (
          <View key={course._id} className="mb-3 overflow-hidden rounded-2xl border border-line bg-white">
            <Pressable accessibilityRole="button" accessibilityLabel={course.name || 'Сургалт'}
              onPress={() => onSelect(course._id)}
              className="flex-row items-center gap-3 p-4">
              {course.photo ? (
                <Image source={{ uri: SERVER_URL + '/upload/lms/' + encodeURIComponent(course.photo) }} className="h-14 w-14 rounded-xl bg-brand-50" />
              ) : (
                <View className="h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
                  <Ionicons name="book-outline" size={24} color="#3754bf" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900">{course.name || 'Сургалт'}</Text>
                <Text className={active ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-800'}>
                  {active ? 'Хичээл үзэх' : suraltsagch?.status || 'Идэвхжээгүй'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#475569" />
            </Pressable>
          </View>
        );
      })}
    </>
  );
}
