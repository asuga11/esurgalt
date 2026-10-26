import React from 'react';
import { Text, View } from 'react-native';

export default function QuizScreen() {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <Text className="text-2xl font-extrabold text-slate-900">Сорил</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-500">
        Энд шалгалт, сорил, асуултууд гарч ирнэ.
      </Text>

      <View className="mt-5 rounded-2xl bg-amber-50 p-4">
        <Text className="text-lg font-bold text-amber-700">Сорил 1</Text>
        <Text className="mt-1 text-sm text-slate-600">
          10 асуулттай богино шалгалт
        </Text>
      </View>

      <View className="mt-3 rounded-2xl bg-slate-50 p-4">
        <Text className="text-lg font-bold text-slate-800">Сорил 2</Text>
        <Text className="mt-1 text-sm text-slate-600">
          Дунд шатны тест
        </Text>
      </View>
    </View>
  );
}