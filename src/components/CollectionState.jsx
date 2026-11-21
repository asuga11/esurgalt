import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomButton from './CustomButton';

export default function CollectionState({ state, title, detail, action, actionLabel = 'Дахин ачаалах' }) {
  const error = state === 'error';
  return (
    <View className={`mb-3 items-center rounded-[24px] border bg-white px-5 py-6 ${error ? 'border-rose-200' : 'border-line'}`}>
      {state === 'loading' ? (
        <ActivityIndicator size="large" color="#3754bf" />
      ) : (
        <View className={`h-12 w-12 items-center justify-center rounded-[17px] ${error ? 'bg-rose-50' : 'bg-brand-50'}`}>
            <Ionicons name={error ? 'alert-circle-outline' : 'folder-open-outline'} size={25} color={error ? '#be123c' : '#3754bf'} />
          </View>
      )}
      <Text accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite"
        className={`mt-3 text-center text-base font-bold ${error ? 'text-rose-800' : 'text-slate-800'}`}>{title}</Text>
      {!!detail && <Text className="mt-1 text-center leading-5 text-slate-600">{detail}</Text>}
      {!!action && <CustomButton title={actionLabel} variant="outline" onPress={action} />}
    </View>
  );
}
