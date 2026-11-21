import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
  compact = false,
}) {
  const baseClass =
    `min-h-[48px] items-center justify-center rounded-[16px] px-4 active:opacity-80 ${compact ? 'mt-1 py-2' : 'mt-3 py-4'}`;

  const variantClass =
    variant === 'outline'
      ? 'border border-brand-200 bg-brand-50'
      : variant === 'danger'
      ? 'bg-rose-700'
      : 'bg-brand-700';

  const textClass =
    variant === 'outline'
      ? 'text-brand-800'
      : 'text-white';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: loading || disabled, busy: loading }}
      onPress={onPress}
      disabled={loading || disabled}
      className={`${baseClass} ${variantClass} ${loading || disabled ? 'opacity-[0.65]' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3754bf' : '#ffffff'} />
      ) : (
        <Text className={`text-base font-bold ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}