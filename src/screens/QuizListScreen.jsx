import React, { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import PageIntro from '../components/PageIntro';
import CollectionState from '../components/CollectionState';
import FormInput from '../components/FormInput';
import BottomNavigationBar from '../components/BottomNavigationBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const EXAM_TYPE = 'ЭЕШ-ын сорил';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function QuizListScreen({ navigation }) {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [retry, setRetry] = useState(0);
  const loadExams = () => setRetry((value) => value + 1);
  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    API.getExamsByType(EXAM_TYPE, token, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setExams(items.sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)));
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, retry]));

  const terms = query.trim().toLocaleLowerCase('mn').split(/\s+/).filter(Boolean);
  const filtered = exams.filter(({ name, lessonName }) =>
    terms.every((term) => `${name || ''} ${lessonName || ''}`.toLocaleLowerCase('mn').includes(term))
  );

  return (
    <ScreenWrapper
      scroll
      bottomBar={<BottomNavigationBar active="quiz" navigation={navigation} />}
    >
      <PageIntro title="ЭЕШ-ын сорил" icon="document-text-outline" />

      <Pressable accessibilityRole="button" accessibilityLabel="QR код уншуулах"
        onPress={() => navigation.navigate('QRScanner')}
        className="mb-4 min-h-[58px] flex-row items-center gap-3 rounded-[20px] border border-brand-200 bg-brand-50 px-3">
        <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-brand-700">
          <Ionicons name="qr-code-outline" size={21} color="#ffffff" />
        </View>
        <Text className="min-w-0 flex-1 font-extrabold text-brand-950">QR кодоор сорилд орох</Text>
        <Ionicons name="arrow-forward" size={19} color="#2b459f" />
      </Pressable>

      {!loading && !error && exams.length > 0 && (
        <View className="mb-3">
          <FormInput icon="search-outline" label="Сорил хайх" value={query} onChangeText={setQuery} placeholder="Нэр эсвэл хичээлээр хайх" />
          <Text accessibilityLiveRegion="polite" className="text-sm font-semibold text-slate-600">
            {filtered.length} / {exams.length} сорил
          </Text>
        </View>
      )}
      {loading ? (
        <CollectionState state="loading" title="ЭЕШ-ын сорил ачаалж байна…" />
      ) : error ? (
        <CollectionState state="error" title="Сорил ачаалж чадсангүй" detail={error} action={loadExams} />
      ) : exams.length === 0 ? (
        <CollectionState state="empty" title="Одоогоор ЭЕШ-ын сорил алга"
          actionLabel="Шинэчилж шалгах" action={loadExams} />
      ) : filtered.length === 0 ? (
        <CollectionState state="empty" title="Хайлттай тохирох сорил олдсонгүй"
          actionLabel="Хайлт арилгах" action={() => setQuery('')} />
      ) : (
        <View className="gap-3">
          {filtered.map((exam) => {
            const date = formatDate(exam?.examDate);
            return (
              <Pressable
                key={exam?._id}
                accessibilityRole="button"
                accessibilityLabel={exam.name || 'ЭЕШ-ын сорил'}
                onPress={() => navigation.navigate('Quiz', { examId: exam?._id })}
                className="rounded-[22px] border border-line bg-white p-4 active:bg-brand-50"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-lg font-extrabold text-ink">
                      {exam?.name || 'ЭЕШ-ын сорил'}
                    </Text>
                    {!!exam?.lessonName && (
                      <Text className="mt-1 text-sm font-semibold text-brand-700">
                        {exam.lessonName}
                      </Text>
                    )}
                  </View>
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-50"><Ionicons name="arrow-forward" size={19} color="#2b459f" /></View>
                </View>

                <View className="mt-4 flex-row flex-wrap gap-x-5 gap-y-2">
                  {!!exam?.examTime && (
                    <Text className="text-sm text-slate-600">
                      <Ionicons name="time-outline" size={14} color="#64748b" />{' '}
                      {exam.examTime} минут
                    </Text>
                  )}
                  {!!date && (
                    <Text className="text-sm text-slate-600">
                      <Ionicons name="calendar-outline" size={14} color="#64748b" /> {date}
                    </Text>
                  )}
                </View>

                <View className="mt-3 flex-row">
                  <Text className={`rounded-full px-2.5 py-1 text-xs font-bold ${exam.isActive === false
                    ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                    {exam.isActive === false ? 'Хаалттай' : 'Нээлттэй'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

    </ScreenWrapper>
  );
}
