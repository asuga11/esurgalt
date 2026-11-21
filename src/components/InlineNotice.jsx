import React from 'react';
import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function InlineNotice({ message, success = false }) {
  if (!message) return null;
  return (
    <View className={`mb-3 flex-row items-start gap-2 rounded-xl px-3 py-2.5 ${success ? 'bg-emerald-50' : 'bg-rose-50'}`}>
      <Ionicons name={success ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={19}
        color={success ? '#047857' : '#be123c'} />
      <Text accessibilityRole={success ? undefined : 'alert'} accessibilityLiveRegion="polite"
        className={`flex-1 text-sm leading-5 ${success ? 'text-emerald-900' : 'text-rose-900'}`}>{message}</Text>
    </View>
  );
}
