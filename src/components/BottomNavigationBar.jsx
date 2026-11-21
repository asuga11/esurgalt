import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const items = [
  { key: 'home', route: 'Main', label: 'Нүүр', icon: 'grid' },
  { key: 'training', route: 'Training', label: 'Сургалт', icon: 'library' },
  { key: 'quiz', route: 'QuizList', label: 'Сорил', icon: 'clipboard' },
  { key: 'scan', route: 'QRScanner', label: 'QR уншуулах', icon: 'qr-code' },
];

export default function BottomNavigationBar({ active, navigation }) {
  return (
    <View role="navigation" aria-label="Доод цэс" className="mx-3 mb-2 rounded-[22px] border border-line bg-white px-1.5 py-1.5">
      <View className="mx-auto w-full max-w-[820px] flex-row gap-1">
        {items.map(({ key, route, label, icon }) => {
          const selected = active === key;
          const scan = key === 'scan';
          return (
            <Pressable key={key} accessibilityRole="button" accessibilityLabel={label}
              accessibilityState={{ selected }} aria-current={selected ? 'page' : undefined}
              onPress={() => {
                if (selected) return;
                if (Platform.OS === 'web') document.activeElement?.blur?.();
                navigation.navigate(route, undefined, { pop: true, merge: true });
              }}
              className={`min-h-[54px] flex-1 items-center justify-center rounded-2xl px-0.5 py-1 ${selected ? 'bg-brand-50' : 'active:bg-slate-100'}`}>
              <View className={`h-7 min-w-[38px] items-center justify-center rounded-[10px] ${scan ? 'bg-brand-950' : selected ? 'bg-brand-100' : ''}`}>
                <Ionicons name={selected || scan ? icon : icon + '-outline'} size={19}
                  color={scan ? '#ffffff' : selected ? '#2b459f' : '#475569'} />
              </View>
              <Text className={`mt-0.5 text-center text-[11px] font-bold ${selected ? 'text-brand-800' : 'text-slate-600'}`}>
                {scan ? 'QR' : label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
