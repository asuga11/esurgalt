import React, { useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useLearningActivity } from '../context/LearningActivityContext';

export default function HeaderActions({ navigation, currentRoute }) {
  const { user } = useAuth();
  const { unread } = useLearningActivity();
  const [failedPhoto, setFailedPhoto] = useState(null);
  const photo = typeof user?.image === 'string' && /^https?:\/\//i.test(user.image) ? user.image : null;
  const initials = [user?.lastname, user?.firstname]
    .filter((name) => typeof name === 'string' && name.trim())
    .map((name) => name.trim().charAt(0).toUpperCase())
    .join('');
  const profileSelected = currentRoute === 'Profile';
  const notificationsSelected = currentRoute === 'Notifications';

  const open = (name) => {
    if (currentRoute === name) return;
    if (Platform.OS === 'web') document.activeElement?.blur?.();
    navigation.navigate(name, undefined, { pop: true });
  };

  return (
    <View className="ml-2 mr-2 flex-row items-center gap-1">
      <Pressable accessibilityRole="button" accessibilityLabel="Профайл"
        aria-current={profileSelected ? 'page' : undefined} onPress={() => open('Profile')}
        className={`h-11 w-11 items-center justify-center rounded-full ${profileSelected ? 'bg-brand-100' : 'active:bg-slate-100'}`}>
        {photo && photo !== failedPhoto ? (
          <Image source={{ uri: photo }} onError={() => setFailedPhoto(photo)}
            className="h-8 w-8 rounded-full bg-brand-50" />
        ) : (
          <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-700">
            {initials
              ? <Text className="text-xs font-extrabold text-white">{initials}</Text>
              : <Ionicons name="person" size={17} color="#ffffff" />}
          </View>
        )}
      </Pressable>

      <Pressable accessibilityRole="button" accessibilityLabel={unread ? `Мэдэгдэл, ${unread} уншаагүй` : 'Мэдэгдэл'}
        aria-current={notificationsSelected ? 'page' : undefined} onPress={() => open('Notifications')}
        className={`relative h-11 w-11 items-center justify-center rounded-full ${notificationsSelected ? 'bg-brand-100' : 'bg-slate-100 active:bg-brand-100'}`}>
        <Ionicons name={notificationsSelected || unread ? 'notifications' : 'notifications-outline'} size={21} color="#2b459f" />
        {unread > 0 && (
          <Text className="absolute right-0 top-0 min-w-[18px] rounded-full border border-white bg-rose-700 px-0.5 text-center text-[10px] font-bold leading-4 text-white">
            {unread}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
