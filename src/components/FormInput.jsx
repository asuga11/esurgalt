import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = false,
  accessory,
  icon,
  compact = false,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View className={compact ? "mb-2" : "mb-4"}>
      <Text className={compact ? "mb-1 text-sm font-semibold text-slate-700" : "mb-2 text-sm font-semibold text-slate-700"}>{label}</Text>
      <View className={`flex-row items-center rounded-[16px] border ${focused ? 'border-brand-600 bg-white' : 'border-line bg-canvas'} ${compact ? "min-h-[44px]" : "min-h-[52px]"}`}>
        {!!icon && (
          <View pointerEvents="none" className="pl-3">
            <Ionicons name={icon} size={19} color={focused ? '#2b459f' : '#64748b'} />
          </View>
        )}
        <TextInput
          className={`min-w-0 flex-1 pr-3 ${icon ? 'pl-2' : 'pl-4'} text-base text-slate-900 ${compact ? "py-2" : "py-3"}`}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          {...inputProps}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        />
        {accessory}
      </View>
    </View>
  );
}