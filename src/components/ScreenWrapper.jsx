import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenWrapper({ children, scroll = false, bottomBar, headerHidden = false, centered = false, pinnedHeader, scrollRef }) {
  return (
    <SafeAreaView
      edges={headerHidden ? ['top', 'left', 'right', 'bottom'] : ['left', 'right', 'bottom']}
      style={{ flex: 1, backgroundColor: '#f4f7fc' }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!!pinnedHeader && <View className="mx-auto w-full max-w-[852px] px-4 pt-2">{pinnedHeader}</View>}
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: pinnedHeader ? 8 : 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className={`mx-auto w-full max-w-[820px] ${centered ? 'my-auto' : ''}`}>{children}</View>
          </ScrollView>
        ) : (
          <View className="mx-auto w-full max-w-[820px] flex-1 justify-center px-4">{children}</View>
        )}
        {bottomBar}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
