import React from 'react';
import { Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from './CustomButton';

export default function ConfirmDialog({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950/60 px-4">
        <View accessibilityViewIsModal className="w-full max-w-[420px] rounded-[24px] border border-line bg-white p-5">
          <Text accessibilityRole="header" className="text-xl font-extrabold text-ink">{title}</Text>
          <Text className="mt-2 leading-6 text-slate-600">{message}</Text>
          <CustomButton title={cancelLabel} onPress={onCancel} />
          <CustomButton title={confirmLabel} variant="danger" onPress={onConfirm} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
