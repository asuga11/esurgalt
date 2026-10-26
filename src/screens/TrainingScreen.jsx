import React from 'react';
import { Text, View } from 'react-native';

export default function TrainingScreen() {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <Text className="text-2xl font-extrabold text-slate-900">Сургалт</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-500">
        Энд сургалтын хичээл, материал, видео, тайлбарууд гарч ирнэ.
      </Text>

      <View className="mt-5 rounded-2xl bg-brand-50 p-4">
        <Text className="text-lg font-bold text-brand-700">Хичээл 1</Text>
        <Text className="mt-1 text-sm text-slate-600">
          React Native-ийн үндсэн ойлголтууд
        </Text>
      </View>

      <View className="mt-3 rounded-2xl bg-slate-50 p-4">
        <Text className="text-lg font-bold text-slate-800">Хичээл 2</Text>
        <Text className="mt-1 text-sm text-slate-600">
          Navigation, API, Login flow
        </Text>
      </View>
    </View>
  );
}