import React, { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { usePreventRemove } from '@react-navigation/native';
import { ActivityIndicator, AppState, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import API, { SERVER_URL } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import QuestionNavigator from '../components/QuestionNavigator';
import InlineNotice from '../components/InlineNotice';
import CustomButton from '../components/CustomButton';
import ScreenWrapper from '../components/ScreenWrapper';

const unwrap = (response) => response?.data || response || {};
const getExam = (response) => {
  const data = unwrap(response);
  return data?.shalgalt || data?.exam || data;
};
const getMemberExam = (response) => {
  const data = unwrap(response);
  return data?.memberExam || data;
};
const decodeMarkup = (html = '') => String(html ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");

const plainText = (html = '') =>
  decodeMarkup(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (entity, code) => Number(code) <= 0x10ffff ? String.fromCodePoint(Number(code)) : entity)
    .replace(/[ \t]+/g, ' ')
    .trim();
const extractImageUris = (html = '') => {
  const sources = [...decodeMarkup(html).matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  return sources.flatMap(([, source]) => {
    try {
      const url = new URL(source, SERVER_URL + '/');
      return ['https:', 'http:'].includes(url.protocol) ? [url.toString()] : [];
    } catch {
      return [];
    }
  });
};
const formatTime = (seconds) => {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const rest = Math.max(0, seconds) % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};
const schoolName = (school) =>
  typeof school === 'string' ? school : school?.ner || school?.name || '';

export default function QuizScreen({ route, navigation }) {
  const examId = route?.params?.examId;
  return <QuizAttempt key={examId} examId={examId} navigation={navigation} />;
}

function QuizAttempt({ examId, navigation }) {
  const { user, token } = useAuth();
  const userId = user?._id || user?.id;
  const [exam, setExam] = useState(null);
  const [memberExam, setMemberExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const questionScroll = useRef(null);
  const [drafts, setDrafts] = useState({});
  const [leaveAction, setLeaveAction] = useState(null);
  const [questions, setQuestions] = useState({});
  const [questionError, setQuestionError] = useState(null);
  const [questionRetry, setQuestionRetry] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const deadline = useRef(null);
  const pendingAnswer = useRef(null);
  const finishing = useRef(false);
  const finishedByTimer = useRef(false);
  const enrollmentPending = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const [reloading, setReloading] = useState(0);

  const loadMemberExam = useCallback(async (signal) => {
    if (!examId || !userId || !token) return null;
    let response;
    try {
      response = await API.getMemberExam(examId, userId, token, signal);
    } catch (error) {
      if (signal?.aborted || error.status === 401 || error.status === 403) throw error;
      const exams = await API.getMemberExamList(userId, token, signal);
      if (exams.some((item) => String(item?.shalgalt?._id) === String(examId))) throw error;
    }
    const result = getMemberExam(response);
    const member = result?.info?.examStatus ? result : null;
    if (!signal?.aborted) setMemberExam(member);
    return member;
  }, [examId, token, userId]);

  useEffect(() => {
    const controller = new AbortController();
    if (!examId || !token) {
      setError('Сорилын холбоос эсвэл нэвтрэх мэдээлэл дутуу байна.');
      setLoading(false);
      return;
    }

    async function loadExam() {
      setLoading(true);
      setError('');
      setExam(null);
      setMemberExam(null);
      setActiveIndex(0);
      setQuestions({});
      setQuestionError(null);
      setRemainingSeconds(null);
      deadline.current = null;
      finishedByTimer.current = false;
      try {
        const [response] = await Promise.all([
          API.getExamById(examId, token, controller.signal),
          loadMemberExam(controller.signal),
        ]);
        const examData = getExam(response);
        if (!examData?._id) throw new Error('Сорилын мэдээлэл олдсонгүй. Холбоосоо шалгана уу.');
        if (!controller.signal.aborted) setExam(examData);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason?.message || 'Сорил ачаалж чадсангүй.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadExam();
    return () => controller.abort();
  }, [examId, loadMemberExam, token, reloading]);

  const attempts = useMemo(() => {
    return Array.isArray(memberExam?.shalgaltdun) ? memberExam.shalgaltdun.filter((item) => item?._id) : [];
  }, [memberExam]);
  const attemptId = attempts[activeIndex]?._id;
  useEffect(() => {
    questionScroll.current?.scrollTo({ y: 0, animated: false });
  }, [attemptId]);

  const currentQuestion = questions[attemptId] ?? null;
  const draft = drafts[attemptId];
  const savedText = String(currentQuestion?.studAnswers?.[0]?.value ?? '');
  const textAnswer = draft?.text ?? savedText;
  const answerValues = draft?.fields ?? {};
  const hasDrafts = Object.keys(drafts).length > 0;
  const hasQuestion = Boolean(currentQuestion);
  const questionType = currentQuestion?.testsan_id?.testType || '';
  const examStatus = memberExam?.info?.examStatus || '';
  const isClosed = (memberExam?.shalgalt?.isActive ?? exam?.isActive) === false;
  const isWorking = examStatus === 'Ажиллаж байна';
  const progress = attempts.map((item) => questions[item._id] || item);
  const isAnswered = (item) => {
    const type = item.testsan_id?.testType;
    return type !== 'Текст' && item.studAnswers?.some((answer) =>
      ['Нэг сонголттой', 'Олон сонголттой'].includes(type) || String(answer.value ?? '').trim()
    );
  };
  const answeredCount = progress.filter(isAnswered).length;
  const answerableCount = progress.filter((item) => item.testsan_id?.testType !== 'Текст').length;
  const answerDisabled = saving || remainingSeconds === 0;

  const loadQuestion = useCallback(async (id, signal) => {
    const question = await API.getExamQuestion(id, token, signal);
    if (!signal?.aborted) setQuestions((current) => ({ ...current, [id]: question }));
    return question;
  }, [token]);

  useEffect(() => {
    if (!isWorking || !attemptId || !token || hasQuestion) return;
    const controller = new AbortController();
    setQuestionError(null);
    loadQuestion(attemptId, controller.signal).catch((reason) => {
      if (!controller.signal.aborted) setQuestionError({ attemptId, message: reason.message });
    });
    return () => controller.abort();
  }, [isWorking, attemptId, token, loadQuestion, hasQuestion, questionRetry]);


  const finishExam = async (automatic = false) => {
    const memberId = memberExam?.info?.member_id || userId;
    if (!isWorking || finishing.current || !examId || !memberId || !token) return;
    finishing.current = true;
    setConfirming(false);
    setSaving(true);
    setError('');
    try {
      const saved = await pendingAnswer.current;
      if (saved === false && !automatic) return;
      await API.finishExam(examId, memberId, token);
      setDrafts({});
      setLeaveAction(null);
      setMemberExam((current) => ({ ...current, info: { ...current.info, examStatus: 'Дууссан' } }));
    } catch (reason) {
      setError(reason?.message || 'Сорил дуусгахад алдаа гарлаа.');
    } finally {
      finishing.current = false;
      setSaving(false);
    }
  };

  const expire = useEffectEvent(() => finishExam(true));
  const duration = memberExam?.info?.memberTime;
  useEffect(() => {
    if (loading || !isWorking || duration == null || String(duration).trim() === '') return;
    const milliseconds = Number(duration);
    if (!Number.isFinite(milliseconds)) return;
    const reportedDeadline = Date.now() + Math.max(0, milliseconds);
    deadline.current = Math.min(deadline.current ?? reportedDeadline, reportedDeadline);

    const sync = () => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0 && !finishedByTimer.current) {
        finishedByTimer.current = true;
        expire();
      }
    };
    sync();
    const interval = setInterval(sync, 1000);
    const appState = AppState.addEventListener('change', (state) => { if (state === 'active') sync(); });
    return () => { clearInterval(interval); appState?.remove(); };
  }, [duration, isWorking, loading]);

  const saveAnswer = (operation, clearDraft = false) => {
    if (pendingAnswer.current || finishing.current || answerDisabled || !attemptId) return;
    setSaving(true);
    setError('');
    pendingAnswer.current = Promise.resolve().then(operation).then(async () => {
      if (clearDraft) updateDraft(attemptId, null);
      try {
        await loadQuestion(attemptId);
      } catch {
        setQuestionError({ attemptId, message: 'Хариулт хадгалагдлаа. Асуултаа дахин ачаална уу.' });
      }
      return true;
    }).catch((reason) => {
      setError(reason?.message || 'Хариултыг хадгалж чадсангүй.');
      return false;
    }).finally(() => {
      pendingAnswer.current = null;
      if (!finishing.current) setSaving(false);
    });
  };

  const handleRegister = async () => {
    if (enrollmentPending.current || isClosed) return;
    if (!userId || !token) {
      setError('Сорилд орохын тулд сурагчийн эрхээр нэвтэрнэ үү.');
      return;
    }

    const allowedAimag = Array.isArray(exam?.aimag) ? exam.aimag : [];
    if (allowedAimag.length && !allowedAimag.includes(user?.city)) {
      setError('Таны аймаг энэ сорилд хамрагдах боломжгүй байна.');
      return;
    }

    const role = user?.role || 'suragch';
    const name = user?.butenNer || user?.name || `${user?.lastname || ''} ${user?.firstname || ''}`.trim();
    const school = schoolName(user?.surguuli || user?.school?.name);
    const memberData = {
      _id: userId,
      member_name: name,
      member_role: role,
      member_school: school,
      member_class: user?.angi?.butenNer || user?.angi?.name || user?.buleg?.ner || (typeof user?.buleg === 'string' ? user.buleg : ''),
      startTime: '',
      endTime: '',
      examStatus: 'Хуваарилсан',
    };

    try {
      enrollmentPending.current = true;
      setJoining(true);
      setError('');
      await API.registerExamMember(examId, memberData, token);
      if (!await loadMemberExam()) throw new Error('Бүртгэлийн төлөв шинэчлэгдээгүй байна. Дахин ачаална уу.');
    } catch (joinError) {
      if (String(joinError?.message).includes('Бүртгэлтэй')) {
        try {
          if (await loadMemberExam()) return;
        } catch {
          // Keep the original registration error below.
        }
      }
      setError(joinError?.message || 'Сорилд бүртгүүлэхэд алдаа гарлаа.');
    } finally {
      enrollmentPending.current = false;
      setJoining(false);
    }
  };

  const handleStart = async () => {
    if (enrollmentPending.current) return;
    const info = memberExam?.info;
    const memberId = info?.member_id || userId;
    if (!info || !memberId || !token) return;
    if ((memberExam?.shalgalt?.isActive ?? exam?.isActive) === false) {
      setError('Сорил одоогоор эхлээгүй байна.');
      return;
    }

    try {
      enrollmentPending.current = true;
      setStarting(true);
      setError('');
      await API.startExam(examId, {
        _id: memberId,
        member_name: info.member_name,
        member_role: info.member_role,
        member_school: info.member_school,
        member_class: info.member_class,
        startTime: '0',
        endTime: '0',
        examStatus: 'Ажиллаж байна',
      }, token);
      deadline.current = null;
      setRemainingSeconds(null);
      finishedByTimer.current = false;
      const started = await loadMemberExam();
      if (started?.info?.examStatus !== 'Ажиллаж байна') throw new Error('Сорилын төлөв шинэчлэгдээгүй байна. Дахин ачаална уу.');
    } catch (startError) {
      setError(startError?.message || 'Сорил эхлүүлэхэд алдаа гарлаа.');
    } finally {
      enrollmentPending.current = false;
      setStarting(false);
    }
  };

  const saveChoice = async (choice) => {
    if (!currentQuestion || answerDisabled) return;
    const answers = currentQuestion.studAnswers || [];
    let nextAnswers;
    if (questionType === 'Олон сонголттой') {
      const existing = answers.findIndex((item) => item._id === choice._id);
      nextAnswers = [...answers];
      if (existing >= 0) nextAnswers.splice(existing, 1);
      else nextAnswers.push({ _id: choice._id, value: '' });
      const max = Number(currentQuestion?.tooZuv || currentQuestion?.testsan_id?.tooZuv || 0);
      if (max > 0 && nextAnswers.length > max) {
        setError(`Энэ асуултад ${max} хариулт сонгоно уу.`);
        return;
      }
    } else {
      nextAnswers = [{ _id: choice._id, value: '' }];
    }

    saveAnswer(() => API.saveExamWork(currentQuestion._id, currentQuestion.testsan_id?._id, nextAnswers, token));
  };

  const saveWrittenAnswer = () => {
    if (!currentQuestion) return;
    const testId = currentQuestion.testsan_id?._id;
    const existing = currentQuestion.studAnswers?.[0];
    saveAnswer(() => existing?._id
      ? API.updateExamAnswer(currentQuestion._id, { _id: existing._id, value: textAnswer }, testId, token)
      : API.saveExamWork(currentQuestion._id, testId, [questionType === 'Эсээ' ? { _id: testId, value: textAnswer } : { value: textAnswer }], token), true);
  };

  const openFields = currentQuestion?.studAnswers?.length
    ? currentQuestion.studAnswers : currentQuestion?.testsan_id?.answers ?? [];

  const saveOpenAnswers = () => {
    if (!currentQuestion) return;
    const testId = currentQuestion.testsan_id?._id;
    saveAnswer(async () => {
      if (!currentQuestion.studAnswers?.length) {
        await API.saveExamWork(currentQuestion._id, testId, openFields.map(({ _id, answer }) => ({
          _id, answer, value: answerValues[_id] ?? '',
        })), token);
        return;
      }
      for (const answer of openFields) {
        if (!(answer._id in answerValues) || answerValues[answer._id] === String(answer.value ?? '')) continue;
        await API.updateExamAnswer(currentQuestion._id, { _id: answer._id, value: answerValues[answer._id] }, testId, token);
      }
    }, true);
  };

  const updateDraft = (id, nextDraft) => {
    setDrafts((current) => {
      const next = { ...current };
      if (nextDraft) next[id] = nextDraft;
      else delete next[id];
      return next;
    });
  };

  const changeText = (value) => updateDraft(attemptId, value === savedText ? null : { text: value });
  const changeOpenField = (id, value, savedValue) => {
    const fields = { ...answerValues };
    if (value === savedValue) delete fields[id];
    else fields[id] = value;
    updateDraft(attemptId, Object.keys(fields).length ? { fields } : null);
  };

  usePreventRemove(isWorking && (hasDrafts || saving), ({ data }) => {
    if (saving || pendingAnswer.current) {
      setError('Хариулт хадгалагдаж байна. Түр хүлээнэ үү.');
      return;
    }
    setLeaveAction(data.action);
  });

  const retryQuestion = () => {
    setQuestions((current) => {
      const next = { ...current };
      delete next[attemptId];
      return next;
    });
    setQuestionRetry((count) => count + 1);
  };
  const selectQuestion = (index) => {
    if (saving || pendingAnswer.current || index < 0 || index >= attempts.length) return;
    setError('');
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="items-center">
          <ActivityIndicator size="large" color="#3754bf" />
          <Text className="mt-3 text-slate-600">Сорил ачаалж байна...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error && !exam) {
    return (
      <ScreenWrapper scroll>
        <View className="rounded-3xl border border-rose-200 bg-white p-6">
          <Text className="text-xl font-extrabold text-slate-900">Сорил нээгдсэнгүй</Text>
          <Text className="mt-2 text-rose-700">{error}</Text>
          <CustomButton title="Дахин ачаалах" onPress={() => setReloading((value) => value + 1)} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!memberExam) {
    return (
      <ScreenWrapper scroll>
        <View className="rounded-[28px] border border-line bg-white p-6 shadow-card">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
            <Ionicons name="document-text-outline" size={28} color="#3754bf" />
          </View>
          <Text className="mt-4 text-2xl font-extrabold text-slate-900">{exam?.name || 'Сорил'}</Text>
          <Text className="mt-2 text-slate-600">{exam?.examTime || '—'} минут · {exam?.listTests?.length || '—'} даалгавар</Text>
          {!!exam?.introduction && <Text className="mt-4 leading-6 text-slate-600">{plainText(exam.introduction)}</Text>}
          {!!error && (
            <>
              <Text accessibilityRole="alert" className="mt-4 text-sm text-rose-700">{error}</Text>
              <CustomButton title="Төлөв шинэчлэх" variant="outline" onPress={() => setReloading((value) => value + 1)} />
            </>
          )}
          {isClosed && <Text className="mt-4 font-bold text-amber-800">Сорил одоогоор хаалттай байна.</Text>}
          <CustomButton title="Сорилд бүртгүүлэх" onPress={handleRegister} loading={joining} disabled={isClosed} />
        </View>
      </ScreenWrapper>
    );
  }

  if (examStatus === 'Хуваарилсан') {
    return (
      <ScreenWrapper scroll>
        <View className="rounded-[28px] border border-line bg-white p-6 shadow-card">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
            <Ionicons name="checkmark-circle-outline" size={30} color="#3754bf" />
          </View>
          <Text className="mt-4 text-2xl font-extrabold text-slate-900">{memberExam.shalgalt?.name || exam?.name}</Text>
          <Text className="mt-2 text-slate-600">{memberExam.shalgalt?.examTime || exam?.examTime || '—'} минутын сорил</Text>
          {!!memberExam.shalgalt?.introduction && (
            <View className="mt-5 rounded-2xl bg-slate-50 p-4">
              <Text className="mb-2 font-bold text-slate-700">Заавар</Text>
              <Text className="leading-6 text-slate-600">{plainText(memberExam.shalgalt.introduction)}</Text>
            </View>
          )}
          {!!error && (
            <>
              <Text accessibilityRole="alert" className="mt-4 text-sm text-rose-700">{error}</Text>
              <CustomButton title="Төлөв шинэчлэх" variant="outline" onPress={() => setReloading((value) => value + 1)} />
            </>
          )}
          {isClosed && <Text className="mt-4 font-bold text-amber-800">Сорил одоогоор хаалттай байна.</Text>}
          <CustomButton title="Сорил эхлүүлэх" onPress={handleStart} loading={starting} disabled={isClosed} />
        </View>
      </ScreenWrapper>
    );
  }

  if (examStatus === 'Дууссан') {
    return (
      <ScreenWrapper scroll>
        <View className="items-center rounded-[28px] border border-emerald-200 bg-white p-7 shadow-card">
          <Ionicons name="checkmark-done-circle" size={58} color="#059669" />
          <Text className="mt-4 text-2xl font-extrabold text-slate-900">Сорил дууссан</Text>
          <Text className="mt-2 text-center leading-6 text-slate-600">Таны хариулт хадгалагдсан байна.</Text>
          <CustomButton title="Сорилын жагсаалт" variant="outline" onPress={() => navigation.navigate('QuizList', undefined, { pop: true })} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!isWorking) {
    return (
      <ScreenWrapper scroll>
        <View className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <Text className="font-bold text-amber-900">Сорилын төлөв: {examStatus}</Text>
          <CustomButton title="Төлөв шинэчлэх" variant="outline" onPress={() => setReloading((value) => value + 1)} />
        </View>
      </ScreenWrapper>
    );
  }

  const pinnedHeader = (
    <View className="rounded-[20px] bg-brand-950 px-4 py-3">
        <Text className="text-sm font-semibold text-brand-100">{memberExam.shalgalt?.name || exam?.name}</Text>
        <View className="mt-1 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold text-brand-200">Үлдсэн хугацаа</Text>
            <Text className={`mt-1 text-2xl font-extrabold ${remainingSeconds !== null && remainingSeconds <= 60 ? 'text-amber-200' : 'text-white'}`}>{remainingSeconds === null ? '—:—' : formatTime(remainingSeconds)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-brand-200">Хариулсан</Text>
            <Text className="mt-1 text-lg font-bold text-white">{answeredCount}/{answerableCount}</Text>
          </View>
        </View>
        <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
          <View style={{ width: `${answerableCount ? (answeredCount / answerableCount) * 100 : 0}%` }} className="h-full rounded-full bg-orange-300" />
        </View>
      </View>
  );
  return (
    <ScreenWrapper scroll pinnedHeader={pinnedHeader} scrollRef={questionScroll}>
      <InlineNotice message={error} />

      {attempts.length > 0 && (
        <QuestionNavigator current={activeIndex} blocked={saving} onSelect={selectQuestion}
          questions={progress.map((item) => ({
            id: item._id,
            state: drafts[item._id] ? 'draft' : isAnswered(item) ? 'saved' : '',
          }))} />
      )}

      {questionError && questionError.attemptId === attemptId ? (
        <View className="mt-3 rounded-3xl border border-rose-200 bg-white p-5">
          <Text accessibilityRole="alert" className="text-rose-700">{questionError.message || 'Асуулт ачаалж чадсангүй.'}</Text>
          <CustomButton title="Асуулт дахин ачаалах" onPress={retryQuestion} />
        </View>
      ) : attemptId && !currentQuestion ? (
        <ActivityIndicator size="large" color="#3754bf" accessibilityLabel="Асуулт ачаалж байна" />
      ) : currentQuestion ? (
        <View className="mt-3 rounded-[24px] border border-line bg-white p-4">
          <View className="mb-4 flex-row flex-wrap items-center justify-between gap-2">
            <Text className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{questionType || 'Даалгавар'}</Text>
            {!!draft && <Text className="text-xs font-bold text-amber-800">Хадгалаагүй ноорог</Text>}
          </View>
          <Text className="text-lg font-bold leading-7 text-slate-900">{plainText(currentQuestion.testsan_id?.question || 'Асуултын текст олдсонгүй')}</Text>
          {extractImageUris(currentQuestion.testsan_id?.question).map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} resizeMode="contain" className="mt-3 h-56 w-full rounded-xl bg-slate-50" />
          ))}

          {(questionType === 'Нэг сонголттой' || questionType === 'Олон сонголттой') && (
            <View className="mt-5">
              {(currentQuestion.testsan_id?.answers || []).map((choice, index) => {
                const selected = (currentQuestion.studAnswers || []).some((answer) => answer._id === choice._id);
                return (
                  <TouchableOpacity
                    key={choice._id || index}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: answerDisabled }}
                    disabled={answerDisabled}
                    onPress={() => saveChoice(choice)}
                    className={`mb-3 flex-row items-start rounded-2xl border p-4 ${selected ? 'border-brand-500 bg-brand-50' : 'border-line bg-white'}`}
                  >
                    <View className={`mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'}`}>
                      {selected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </View>
                    <View className="flex-1">
                      {!!plainText(choice.answer || '') && <Text className="leading-6 text-slate-800">{plainText(choice.answer || '')}</Text>}
                      {extractImageUris(choice.answer).map((uri, imageIndex) => (
                        <Image key={`${uri}-${imageIndex}`} source={{ uri }} resizeMode="contain" className="mt-2 h-32 w-full rounded-lg bg-slate-50" />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {['Нөхөх', 'Эсээ'].includes(questionType) && (
            <View className="mt-5">
              <TextInput
                accessibilityLabel="Сорилын хариулт"
                editable={!answerDisabled}
                value={textAnswer}
                onChangeText={changeText}
                multiline={questionType === 'Эсээ'}
                textAlignVertical={questionType === 'Эсээ' ? 'top' : 'center'}
                placeholder={questionType === 'Эсээ' ? 'Эсээгээ бичнэ үү...' : 'Хариултаа бичнэ үү...'}
                className={`rounded-2xl border border-line bg-slate-50 px-4 text-base text-slate-900 ${questionType === 'Эсээ' ? 'min-h-40 py-4' : 'h-14'}`}
              />
              <CustomButton title="Хариулт хадгалах" onPress={saveWrittenAnswer} loading={saving} disabled={answerDisabled || !draft} />
            </View>
          )}

          {questionType === 'Задгай даалгавар' && (
            <View className="mt-5">
              {openFields.length ? openFields.map((answer, index) => (
                <View key={answer._id || index} className="mb-3">
                  <Text className="mb-1 text-sm font-semibold text-slate-600">{plainText(answer.answer || `Хариулт ${index + 1}`)}</Text>
                  <TextInput
                    accessibilityLabel={plainText(answer.answer || 'Хариулт ' + (index + 1))}
                    editable={!answerDisabled}
                    value={answerValues[answer._id] ?? (currentQuestion.studAnswers?.length ? String(answer.value ?? '') : '')}
                    onChangeText={(value) => changeOpenField(answer._id, value, currentQuestion.studAnswers?.length ? String(answer.value ?? '') : '')}
                    placeholder="Хариултаа оруулна уу"
                    className="h-14 rounded-2xl border border-line bg-slate-50 px-4 text-base text-slate-900"
                  />
                </View>
              )) : (
                <Text className="leading-6 text-slate-600">Хариулах талбар олдсонгүй.</Text>
              )}
              <CustomButton title="Хариулт хадгалах" onPress={saveOpenAnswers} loading={saving} disabled={answerDisabled || !draft} />
            </View>
          )}

          {questionType === 'Текст' && (
            <View className="mt-4 rounded-2xl bg-slate-50 p-4">
              <Text className="text-sm leading-6 text-slate-600">Энэ хэсэг нь тайлбар мэдээлэл байна.</Text>
            </View>
          )}

          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              accessibilityRole="button"
              disabled={saving || activeIndex <= 0}
              onPress={() => selectQuestion(activeIndex - 1)}
              className={`flex-1 items-center rounded-2xl py-3 ${activeIndex <= 0 ? 'bg-slate-100' : 'bg-slate-800'}`}
            >
              <Text className={`font-bold ${activeIndex <= 0 ? 'text-slate-400' : 'text-white'}`}>Өмнөх</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={saving || activeIndex >= attempts.length - 1}
              onPress={() => selectQuestion(activeIndex + 1)}
              className={`flex-1 items-center rounded-2xl py-3 ${activeIndex >= attempts.length - 1 ? 'bg-slate-100' : 'bg-brand-600'}`}
            >
              <Text className={`font-bold ${activeIndex >= attempts.length - 1 ? 'text-slate-400' : 'text-white'}`}>Дараах</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-slate-600">Сорилын даалгавар ачаалагдсангүй.</Text>
          <CustomButton title="Дахин ачаалах" variant="outline" onPress={() => setReloading((value) => value + 1)} />
        </View>
      )}

      <CustomButton title="Сорил дуусгах" variant="danger" onPress={() => setConfirming(true)} loading={saving} />
      {confirming && (
        <ConfirmDialog title="Сорилыг дуусгах уу?"
          message={hasDrafts ? 'Хадгалаагүй ноорог байна. Зөвхөн хадгалсан хариулт илгээгдэнэ.' : 'Хадгалсан хариултыг илгээнэ.'}
          cancelLabel="Үргэлжлүүлэх" confirmLabel="Дуусгах"
          onCancel={() => setConfirming(false)} onConfirm={() => finishExam()} />
      )}
      {leaveAction && (
        <ConfirmDialog title="Сорилоос гарах уу?"
          message="Хадгалаагүй нооргууд устах бөгөөд сорилын хугацаа үргэлжилнэ."
          cancelLabel="Сорилдоо үлдэх" confirmLabel="Сорилоос гарах" onCancel={() => setLeaveAction(null)}
          onConfirm={() => { setLeaveAction(null); navigation.dispatch(leaveAction); }} />
      )}
    </ScreenWrapper>
  );
}
