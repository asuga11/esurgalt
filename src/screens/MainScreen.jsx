// src/screens/MainScreen.jsx

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

const trainingList = [
  {
    id: 1,
    title: 'React Native үндэс',
    description: 'Component, props, state, navigation',
    progress: 80,
    lessons: 12,
    color: 'bg-blue-100',
    badge: 'Шинэ',
  },
  {
    id: 2,
    title: 'API ба Login System',
    description: 'Fetch, token, auth context',
    progress: 55,
    lessons: 8,
    color: 'bg-emerald-100',
    badge: 'Үргэлжилж байна',
  },
  {
    id: 3,
    title: 'UI / UX дизайн',
    description: 'Tailwind, card, spacing, color',
    progress: 25,
    lessons: 6,
    color: 'bg-violet-100',
    badge: 'Эхлээгүй',
  },
];

const quizList = [
  {
    id: 1,
    title: 'React Native анхан шат',
    questions: 10,
    score: 90,
    status: 'Өгсөн',
  },
  {
    id: 2,
    title: 'Navigation ба API',
    questions: 15,
    score: null,
    status: 'Өгөөгүй',
  },
  {
    id: 3,
    title: 'Tailwind UI сорил',
    questions: 20,
    score: 75,
    status: 'Өгсөн',
  },
];

function ProgressBar({ progress }) {
  return (
    <View className="mt-3">
      <View className="h-3 overflow-hidden rounded-full bg-slate-200">
        <View
          style={{ width: `${progress}%` }}
          className="h-3 rounded-full bg-brand-600"
        />
      </View>
      <Text className="mt-1 text-right text-xs font-semibold text-slate-500">
        {progress}%
      </Text>
    </View>
  );
}

function TrainingCard({ item }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-card"
    >
      <View className="flex-row items-start justify-between">
        <View className={`h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
          <Text className="text-2xl">📘</Text>
        </View>

        <View className="rounded-full bg-brand-100 px-3 py-1">
          <Text className="text-xs font-bold text-brand-700">{item.badge}</Text>
        </View>
      </View>

      <Text className="mt-4 text-xl font-extrabold text-slate-900">
        {item.title}
      </Text>

      <Text className="mt-2 text-sm leading-6 text-slate-500">
        {item.description}
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-slate-600">
          {item.lessons} хичээл
        </Text>

        <Text className="text-sm font-bold text-brand-600">
          Дэлгэрэнгүй →
        </Text>
      </View>

      <ProgressBar progress={item.progress} />
    </TouchableOpacity>
  );
}

function QuizCard({ item }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-card"
    >
      <View className="flex-row items-start justify-between">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
          <Text className="text-2xl">📝</Text>
        </View>

        <View
          className={`rounded-full px-3 py-1 ${
            item.status === 'Өгсөн'
              ? 'bg-emerald-100'
              : 'bg-slate-200'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              item.status === 'Өгсөн'
                ? 'text-emerald-700'
                : 'text-slate-700'
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-xl font-extrabold text-slate-900">
        {item.title}
      </Text>

      <Text className="mt-2 text-sm text-slate-500">
        {item.questions} асуулттай сорил
      </Text>

      <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Оноо
          </Text>
          <Text className="mt-1 text-lg font-extrabold text-slate-900">
            {item.score !== null ? `${item.score}%` : '-'}
          </Text>
        </View>

        <TouchableOpacity className="rounded-2xl bg-brand-600 px-4 py-2">
          <Text className="font-bold text-white">
            {item.status === 'Өгсөн' ? 'Дахин өгөх' : 'Эхлэх'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function MainScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('training');

  const totalProgress = useMemo(() => {
    const total = trainingList.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(total / trainingList.length);
  }, []);

  return (
    <ScreenWrapper scroll>
      <View className="mb-5 rounded-3xl bg-brand-600 p-5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-sm font-semibold text-brand-100">
              Тавтай морил 👋
            </Text>

            <Text className="mt-2 text-3xl font-extrabold text-white">
              E-Surgalt
            </Text>

            <Text className="mt-2 text-sm leading-6 text-brand-100">
              Өнөөдрийн сургалтаа үргэлжлүүлж, сорилуудаа өгнө үү.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="h-14 w-14 items-center justify-center rounded-full bg-white/20"
          >
            <Text className="text-2xl">👤</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-5 rounded-2xl bg-white/10 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-brand-100">
              Нийт ахиц
            </Text>
            <Text className="text-lg font-extrabold text-white">
              {totalProgress}%
            </Text>
          </View>

          <View className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
            <View
              style={{ width: `${totalProgress}%` }}
              className="h-3 rounded-full bg-white"
            />
          </View>
        </View>
      </View>

      <View className="mb-5 flex-row rounded-3xl border border-slate-200 bg-white p-2 shadow-card">
        <TouchableOpacity
          onPress={() => setActiveTab('training')}
          className={`flex-1 rounded-2xl py-3 ${
            activeTab === 'training'
              ? 'bg-brand-600'
              : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center text-sm font-bold ${
              activeTab === 'training'
                ? 'text-white'
                : 'text-slate-600'
            }`}
          >
            Сургалт
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('quiz')}
          className={`flex-1 rounded-2xl py-3 ${
            activeTab === 'quiz'
              ? 'bg-brand-600'
              : 'bg-transparent'
          }`}
        >
          <Text
            className={`text-center text-sm font-bold ${
              activeTab === 'quiz'
                ? 'text-white'
                : 'text-slate-600'
            }`}
          >
            Сорил
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'training' ? (
        <View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-slate-900">
              Миний сургалтууд
            </Text>

            <TouchableOpacity>
              <Text className="font-bold text-brand-600">Бүгд</Text>
            </TouchableOpacity>
          </View>

          {trainingList.map((item) => (
            <TrainingCard key={item.id} item={item} />
          ))}
        </View>
      ) : (
        <View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-extrabold text-slate-900">
              Миний сорилууд
            </Text>

            <TouchableOpacity>
              <Text className="font-bold text-brand-600">Бүгд</Text>
            </TouchableOpacity>
          </View>

          {quizList.map((item) => (
            <QuizCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScreenWrapper>
  );
}