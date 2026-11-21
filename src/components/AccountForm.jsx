import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import ScreenWrapper from './ScreenWrapper';
import PageIntro from './PageIntro';
import InlineNotice from './InlineNotice';
import CustomButton from './CustomButton';

export default function AccountForm({ title, description, icon, submitLabel, onSubmit, children }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const locked = useRef(false);

  const submit = async () => {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError('');
    try {
      setResult(await onSubmit());
    } catch (reason) {
      setError(reason?.message || 'Хүсэлт илгээж чадсангүй.');
    } finally {
      locked.current = false;
      setPending(false);
    }
  };

  return (
    <ScreenWrapper scroll centered>
      <View className="mx-auto w-full max-w-[480px]">
        <PageIntro title={title} description={description} icon={icon} />
        <View className="rounded-[24px] border border-line bg-white p-4">
          {result ? (
            <>
              <InlineNotice success message={result.message} />
              <CustomButton title={result.actionLabel} onPress={result.action} />
            </>
          ) : (
            <>
              {children({ pending, clearError: () => setError(''), submit })}
              <InlineNotice message={error} />
              <CustomButton title={submitLabel} onPress={submit} loading={pending} />
            </>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}
