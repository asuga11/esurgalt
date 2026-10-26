import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
}) {
  const baseClass =
    'mt-3 items-center justify-center rounded-2xl px-4 py-4 active:opacity-80';

  const variantClass =
    variant === 'outline'
      ? 'border border-brand-600 bg-white'
      : variant === 'danger'
      ? 'bg-red-600'
      : 'bg-brand-600';

  const textClass =
    variant === 'outline'
      ? 'text-brand-600'
      : 'text-white';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      className={`${baseClass} ${variantClass} ${loading || disabled ? 'opacity-60' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#4f46e5' : '#ffffff'} />
      ) : (
        <Text className={`text-base font-bold ${textClass}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}