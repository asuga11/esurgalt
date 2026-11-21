import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PageIntro({ title, description, icon }) {
  return (
    <View className="mb-4 flex-row items-center gap-3 rounded-[24px] border border-line bg-white px-4 py-4">
      <View className="h-12 w-12 items-center justify-center rounded-[17px] bg-brand-50">
        <Ionicons name={icon} size={24} color="#2b459f" />
      </View>
      <View className="min-w-0 flex-1">
        <Text accessibilityRole="header" className="text-[23px] font-extrabold leading-7 text-ink">{title}</Text>
        {!!description && <Text className="mt-1 text-sm leading-5 text-slate-600">{description}</Text>}
      </View>
    </View>
  );
}
