import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ChoiceTabs({ label, options, value, onChange }) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label}
      className="mb-4 flex-row gap-1 rounded-[20px] border border-line bg-white p-1.5">
      {options.map(([key, title]) => {
        const selected = value === key;
        return (
          <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected }}
            aria-selected={selected} onPress={() => onChange(key)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-[14px] px-2 py-1 ${selected ? 'bg-brand-950' : 'active:bg-brand-50'}`}>
            <Text className={`text-center text-sm font-bold ${selected ? 'text-white' : 'text-slate-700'}`}>{title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
