import React, { useCallback, useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import API, { SERVER_URL } from '../services/api';
import CollectionState from './CollectionState';
import FormInput from './FormInput';
import CustomButton from './CustomButton';
import InlineNotice from './InlineNotice';
import { coursePricing, formatAmount } from '../services/courses';

const priceFilters = [['all', 'Бүгд'], ['free', 'Үнэгүй'], ['paid', 'Төлбөртэй']];
const normalize = (value) => String(value ?? '').normalize('NFC').toLocaleLowerCase('mn-MN');

function CourseCard({ course, onSelect, wide }) {
  const [failedPhoto, setFailedPhoto] = useState(null);
  const category = course.angilal_id?.name;
  const lessonCount = course.info?.countLesson ?? course.lessons?.length;
  const { amount, previous } = coursePricing(course);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={course.name || 'Сургалтын дэлгэрэнгүй'}
      onPress={() => onSelect(course._id)}
      className={`mb-3 overflow-hidden rounded-[22px] border border-line bg-white active:bg-brand-50 ${wide ? '' : 'flex-row items-center gap-3 p-3'}`}>
      <View className={`items-center justify-center overflow-hidden bg-brand-50 ${wide ? 'aspect-video w-full' : 'h-20 w-[94px] rounded-[15px]'}`}>
        {course.photo && failedPhoto !== course.photo ? (
          <Image source={{ uri: SERVER_URL + '/upload/lms/' + encodeURIComponent(course.photo) }}
            resizeMode="cover" onError={() => setFailedPhoto(course.photo)} className="absolute inset-0 h-full w-full" />
        ) : (
          <Ionicons name="library-outline" size={wide ? 36 : 26} color="#2b459f" />
        )}
      </View>
      <View className={`min-w-0 flex-1 ${wide ? 'p-4' : '' }`}>
        {!!category && <Text className="mb-1 text-sm font-semibold text-brand-700">{category}</Text>}
        <Text accessibilityRole="header" className="text-base font-extrabold text-slate-900">{course.name || 'Сургалт'}</Text>
        <View className="mt-1 flex-row flex-wrap items-center gap-x-3 gap-y-1">
          {lessonCount != null && <Text className="text-sm text-slate-600">{lessonCount} хичээл</Text>}
        </View>
        <View className="mt-2 flex-row flex-wrap items-center gap-x-2">
          {previous !== null && <Text className="text-sm text-slate-600 line-through">{formatAmount(previous)}</Text>}
          <Text className="text-sm font-extrabold text-brand-800">{formatAmount(amount) ?? 'Үнэ тодорхойгүй'}</Text>
        </View>
      </View>
      {!wide && <Ionicons name="chevron-forward" size={16} color="#64748b" />}
    </Pressable>
  );
}

export default function CourseCatalog({ onSelect, query, setQuery, priceFilter, setPriceFilter }) {
  const [request, setRequest] = useState({ status: 'loading', courses: [], error: '' });
  const [attempt, setAttempt] = useState(0);
  const { width } = useWindowDimensions();
  const retry = () => setAttempt((value) => value + 1);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setRequest((current) => ({ ...current, status: current.courses.length ? 'ready' : 'loading', error: '' }));
    API.getPublicCourses(controller.signal).then((courses) => {
      if (!controller.signal.aborted) setRequest({ status: 'ready', courses, error: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) setRequest((current) => ({ ...current, status: 'error', error: error.message }));
    });
    return () => controller.abort();
  }, [attempt]));

  if (request.status === 'loading') {
    return <CollectionState state="loading" title="Сургалтуудыг ачаалж байна…" />;
  }

  if (request.status === 'error' && !request.courses.length) {
    return <CollectionState state="error" title="Сургалтуудыг ачаалж чадсангүй" detail={request.error}
      action={retry} />;
  }

  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const filtering = terms.length > 0 || priceFilter !== 'all';
  const clear = () => {
    setQuery('');
    setPriceFilter('all');
  };
  const matches = request.courses.filter((course) => {
    const { amount } = coursePricing(course);
    const matchesPrice = priceFilter === 'all' || (priceFilter === 'free' ? amount === 0 : amount > 0 || course.isTulbur === true);
    if (!matchesPrice) return false;
    const searchable = normalize(`${course.name || ''} ${course.angilal_id?.name || ''}`);
    return terms.every((term) => searchable.includes(term));
  });

  return (
    <>
      {!!request.error && (
        <View className="mb-3">
          <InlineNotice message={request.error} />
          <CustomButton title="Дахин ачаалах" variant="outline" compact onPress={retry} />
        </View>
      )}
      {request.courses.length > 0 && (
        <>
          <FormInput icon="search-outline" label="Сургалт хайх" value={query} onChangeText={setQuery}
            placeholder="Нэр эсвэл ангиллаар хайх" returnKeyType="search"
            accessory={query ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Хайлтын үг арилгах"
                onPress={() => setQuery('')} className="h-11 w-11 items-center justify-center">
                <Ionicons name="close-circle-outline" size={22} color="#475569" />
              </Pressable>
            ) : null} />
          <View className="mb-3 flex-row flex-wrap gap-2">
            {priceFilters.map(([value, label]) => (
              <Pressable key={value} accessibilityRole="button" accessibilityLabel={'Үнэ: ' + label}
                accessibilityState={{ selected: priceFilter === value }} onPress={() => setPriceFilter(value)}
                className={`min-h-[44px] justify-center rounded-xl border px-3 py-2 ${priceFilter === value ? 'border-brand-700 bg-brand-950' : 'border-line bg-white'}`}>
                <Text className={`font-semibold ${priceFilter === value ? 'text-white' : 'text-slate-800'}`}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      {matches.length ? (
        <>
          <Text accessibilityLiveRegion="polite" className="mb-3 text-sm font-semibold text-slate-600">{matches.length} сургалт</Text>
          <View className={width >= 700 ? 'flex-row flex-wrap justify-between' : ''}>
            {matches.map((course) => (
              <View key={course._id} className={width >= 700 ? 'w-[48.5%]' : 'w-full'}>
                <CourseCard course={course} onSelect={onSelect} wide={width >= 700} />
              </View>
            ))}
          </View>
        </>
      ) : (
        <CollectionState state="empty"
          title={filtering ? 'Тохирох сургалт олдсонгүй' : 'Одоогоор сургалт алга'}
          actionLabel={filtering ? 'Шүүлтүүр арилгах' : 'Шинэчилж шалгах'}
          action={filtering ? clear : retry} />
      )}
    </>
  );
}
