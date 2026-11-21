import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenWrapper from '../components/ScreenWrapper';
import CollectionState from '../components/CollectionState';
import InlineNotice from '../components/InlineNotice';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import API, { SERVER_URL } from '../services/api';
import { coursePricing, findCourseEnrollment, formatAmount, getLessonMedia } from '../services/courses';

function PaymentDetails({ course, amount, submitted, busy, error, onRequest, onRefresh }) {
  const [confirm, setConfirm] = useState(false);
  const fields = [
    ['Мөнгөн дүн', formatAmount(amount)],
    ['Банк', course.tulbur_bank],
    ['Дансны дугаар', course.tulbur_dans],
    ['Данс эзэмшигч', course.tulbur_ezen],
    ['Гүйлгээний утга', course.tulbur_utga],
  ];
  return (
    <View className="mb-4 rounded-[24px] border border-brand-200 bg-brand-50 p-4">
      <Text accessibilityRole="header" className="text-lg font-extrabold text-brand-950">Сургалт худалдаж авах</Text>
      {submitted && <Text accessibilityLiveRegion="polite" className="mt-2 font-bold text-brand-900">Хүсэлт илгээсэн · Эрх идэвхжихийг хүлээж байна</Text>}
      <Text className="mt-2 leading-6 text-slate-700">
        Төлбөрөө доорх данс руу шилжүүлж, сургалтын эрх идэвхжүүлэх хүсэлт илгээнэ үү.
      </Text>
      <View className="mt-2">
        {fields.map(([label, value]) => (value == null || value === '' ? null : (
          <View key={label} className="border-b border-brand-100 py-2">
            <Text className="text-sm text-slate-600">{label}</Text>
            <Text selectable className="font-bold text-slate-900">{String(value)}</Text>
          </View>
        )))}
      </View>
      {!!course.tulbur_info && <Text className="mt-3 leading-6 text-slate-700">{course.tulbur_info}</Text>}
      {!!error && <View className="mt-3"><InlineNotice message={error} /></View>}
      {submitted ? (
        <CustomButton title="Эрх шинэчлэх" variant="outline" onPress={onRefresh} />
      ) : confirm ? (
        <>
          <Text className="mt-4 font-semibold text-slate-900">Төлбөрийн мэдээллээ шалгасан бол хүсэлтээ илгээнэ үү.</Text>
          <CustomButton title="Хүсэлт баталгаажуулах" loading={busy} onPress={onRequest} />
          <CustomButton title="Буцах" variant="outline" disabled={busy} onPress={() => setConfirm(false)} />
        </>
      ) : (
        <CustomButton title="Худалдан авах хүсэлт илгээх" onPress={() => setConfirm(true)} />
      )}
    </View>
  );
}

function CourseDetails({ courseId, user, token, navigation }) {
  const memberId = user?._id || user?.id;
  const [course, setCourse] = useState(null);
  const [courseError, setCourseError] = useState('');
  const [access, setAccess] = useState({ status: 'loading', enrollment: null });
  const [attempt, setAttempt] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const sending = useRef(false);
  const reload = () => setAttempt((value) => value + 1);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setCourseError('');
    setAccess({ status: 'loading', enrollment: null });
    API.getCourse(courseId, token, controller.signal).then((result) => {
      if (!controller.signal.aborted) setCourse(result);
    }).catch((error) => {
      if (!controller.signal.aborted) setCourseError(error.message || 'Сургалт ачаалж чадсангүй.');
    });
    if (memberId && token) {
      API.getMemberCourses(memberId, token, controller.signal).then((response) => {
        if (controller.signal.aborted) return;
        const enrollment = findCourseEnrollment(response, courseId);
        setAccess({ status: 'ready', enrollment });
      }).catch(() => {
        if (!controller.signal.aborted) setAccess({ status: 'error', enrollment: null });
      });
    } else {
      setAccess({ status: 'error', enrollment: null });
    }
    return () => controller.abort();
  }, [courseId, memberId, token, attempt]));

  if (!course || courseError) {
    return (
      <ScreenWrapper scroll>
        {courseError ? (
          <CollectionState state="error" title="Сургалт ачаалж чадсангүй" detail={courseError} action={reload} />
        ) : <CollectionState state="loading" title="Сургалт ачаалж байна…" />}
      </ScreenWrapper>
    );
  }

  const memberStatus = access.enrollment?.suraltsagch?.status;
  const owned = memberStatus === 'Худалдаж авсан';
  const free = course.isTulbur === false;
  const canWatch = free || owned;
  const waiting = !owned && (submitted || memberStatus === 'Хүсэлт илгээсэн');
  const { amount, previous } = coursePricing(course);
  const hasPaymentDetails = course.isTulbur === true && amount > 0 &&
    [course.tulbur_bank, course.tulbur_dans, course.tulbur_ezen].every((value) => String(value ?? '').trim());
  const preview = getLessonMedia(course.video, SERVER_URL);
  const memberLessons = access.enrollment?.surgalt?.lessons;
  const lessons = Array.isArray(memberLessons) && owned && memberLessons.length
    ? memberLessons : course.lessons;
  const ordered = Array.isArray(lessons)
    ? lessons.filter((lesson) => lesson && lesson.isActive !== false).sort((a, b) => Number(a.number) - Number(b.number))
    : [];

  const submitRequest = async () => {
    if (sending.current || !memberId || !token || waiting || canWatch || !hasPaymentDetails || access.status !== 'ready') return;
    sending.current = true;
    setBusy(true);
    setPurchaseError('');
    try {
      await API.requestCourseAccess(courseId, {
        _id: memberId,
        member_name: user.butenNer || user.name || [user.lastname, user.firstname].filter(Boolean).join(' '),
        member_role: 'suragch',
        member_school: user.surguuli?._id || user.surguuli_id || (typeof user.surguuli === 'string' ? user.surguuli : ''),
        member_class: user.angi?.butenNer || user.angi?.name || (typeof user.angi === 'string' ? user.angi : user.class || ''),
        startTime: new Date().toISOString().slice(0, 10),
        tulbur: amount,
        status: 'Хүсэлт илгээсэн',
      }, token);
      setSubmitted(true);
    } catch (error) {
      setPurchaseError(error.message || 'Сургалтын хүсэлт илгээж чадсангүй.');
      reload();
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <View className="mb-4 overflow-hidden rounded-[26px] border border-line bg-white">
        {!!course.photo && (
          <Image source={{ uri: SERVER_URL + '/upload/lms/' + encodeURIComponent(course.photo) }}
            className="aspect-video w-full bg-brand-50" resizeMode="cover" />
        )}
        <View className="p-4">
          {!!course.angilal_id?.name && <Text className="font-semibold text-brand-700">{course.angilal_id.name}</Text>}
          <Text accessibilityRole="header" className="mt-1 text-2xl font-extrabold text-slate-900">{course.name || 'Сургалт'}</Text>
          <View className="mt-3 flex-row flex-wrap items-baseline gap-2 rounded-[16px] bg-canvas px-3 py-2">
            <Text className="font-semibold text-slate-600">Үнэ</Text>
            {previous !== null && <Text className="text-sm text-slate-600 line-through">{formatAmount(previous)}</Text>}
            <Text className="text-xl font-extrabold text-ink">{formatAmount(amount) ?? 'Тодорхойгүй'}</Text>
          </View>
          {owned && <Text className="mt-1 font-semibold text-emerald-700">Үзэх эрх идэвхтэй</Text>}
          {!!preview && <CustomButton title="Танилцуулга үзэх" variant="outline" onPress={() => navigation.navigate('Lesson', { title: 'Танилцуулга', media: preview })} />}
        </View>
      </View>

      {!free && access.status === 'loading' && (
        <ActivityIndicator accessibilityLabel="Үзэх эрх шалгаж байна" color="#3754bf" />
      )}
      {!free && access.status === 'error' && (
        <View className="mb-4 rounded-2xl bg-rose-50 p-4">
          <Text accessibilityRole="alert" className="text-rose-800">Сургалтын эрх шалгаж чадсангүй.</Text>
          <CustomButton title="Дахин шалгах" variant="outline" onPress={reload} />
        </View>
      )}
      {access.status === 'ready' && !canWatch && (hasPaymentDetails || waiting) && (
        <PaymentDetails course={course} amount={amount} submitted={waiting} busy={busy} error={purchaseError} onRequest={submitRequest}
          onRefresh={() => { setPurchaseError(''); reload(); }} />
      )}
      {access.status === 'ready' && !canWatch && !hasPaymentDetails && !waiting && (
        <Text className="mb-4 rounded-2xl bg-amber-50 p-4 text-amber-900">Төлбөрийн мэдээлэл одоогоор байхгүй байна.</Text>
      )}
      {!!purchaseError && (access.status !== 'ready' || canWatch || !(hasPaymentDetails || waiting)) &&
        <InlineNotice message={purchaseError} />}

      <View className="rounded-[24px] border border-line bg-white p-4">
        <Text accessibilityRole="header" className="mb-2 text-lg font-extrabold text-slate-900">Хичээлүүд</Text>
        {!ordered.length && <Text className="py-2 text-slate-600">Хичээл хараахан нэмэгдээгүй байна.</Text>}
        {ordered.map((lesson, index) => {
          const title = lesson.lessonName || lesson.name || 'Хичээл ' + (index + 1);
          const media = canWatch ? getLessonMedia(lesson.url, SERVER_URL) : null;
          return (
            <Pressable key={lesson._id || index} accessibilityRole="button" accessibilityLabel={title}
              accessibilityState={{ disabled: !media }} disabled={!media}
              onPress={() => navigation.navigate('Lesson', { title, media })}
              className="min-h-[52px] flex-row items-center gap-3 border-b border-slate-100 py-2">
              <Ionicons name={media ? 'play-circle-outline' : canWatch ? 'videocam-off-outline' : 'lock-closed-outline'}
                size={23} color={media ? '#3754bf' : '#64748b'} />
              <View className="flex-1">
                <Text className="font-semibold text-slate-900">{title}</Text>
                {!!lesson.lessonTime && <Text className="text-sm text-slate-500">{lesson.lessonTime}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}

export default function CourseScreen({ route, navigation }) {
  const { user, token } = useAuth();
  const courseId = route.params?.courseId;
  if (!courseId) return <ScreenWrapper scroll><Text>Сургалтын мэдээлэл олдсонгүй.</Text></ScreenWrapper>;
  return <CourseDetails key={courseId} courseId={courseId} user={user} token={token} navigation={navigation} />;
}
