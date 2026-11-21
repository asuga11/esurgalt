import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function QuestionNavigator({ questions, current, blocked, onSelect }) {
  const [open, setOpen] = useState(false);
  const currentNumber = current + 1;
  return (
    <View className="mt-3 rounded-2xl border border-line bg-white px-3">
      <Pressable accessibilityRole="button" accessibilityLabel="Асуултын жагсаалт" accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)} className="min-h-[46px] flex-row items-center justify-between gap-2">
        <Text className="flex-1 font-bold text-slate-900">Асуулт {currentNumber} / {questions.length}</Text>
        <Ionicons name={open ? 'chevron-up' : 'grid-outline'} size={18} color="#2b459f" />
      </Pressable>
      {open && (
        <View className="flex-row flex-wrap gap-2 pb-3">
          {questions.map(({ id, state }, index) => {
            const selected = index === current;
            const label = state === 'saved' ? ' · хадгалсан' : state === 'draft' ? ' · ноорогтой' : '';
            const colors = selected ? 'bg-brand-700 border-brand-700'
              : state === 'saved' ? 'bg-emerald-50 border-emerald-400'
                : state === 'draft' ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-300';
            return (
              <Pressable key={id} accessibilityRole="button"
                accessibilityLabel={`Асуулт ${index + 1}${label}`}
                accessibilityState={{ selected, disabled: blocked }} disabled={blocked}
                onPress={() => { onSelect(index); setOpen(false); }}
                className={`h-11 min-w-[44px] items-center justify-center rounded-xl border px-2 ${colors}`}>
                <Text className={`font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>{index + 1}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
