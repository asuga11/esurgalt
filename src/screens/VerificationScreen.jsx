import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AccountForm from '../components/AccountForm';
import FormInput from '../components/FormInput';

export default function VerificationScreen({ navigation }) {
  const [code, setCode] = useState('');
  const { token, refreshUser } = useAuth();

  const verify = async () => {
    if (!code.trim()) throw new Error('Баталгаажуулах кодоо оруулна уу.');
    await API.verifyEmail(code.trim(), token);
    if (token) await refreshUser().catch(() => {});
    return {
      message: 'Имэйл баталгаажлаа.',
      actionLabel: 'Буцах',
      action: () => navigation.goBack(),
    };
  };

  return (
    <AccountForm title="Имэйл баталгаажуулах" icon="shield-checkmark-outline"
      description="Имэйлээр ирсэн баталгаажуулах кодоо оруулна уу." onSubmit={verify} submitLabel="Баталгаажуулах">
      {({ pending, clearError, submit }) => (
        <FormInput label="Баталгаажуулах код" value={code} autoCapitalize="none" autoComplete="one-time-code"
          onChangeText={(value) => { setCode(value); clearError(); }} editable={!pending}
          returnKeyType="go" onSubmitEditing={submit} />
      )}
    </AccountForm>
  );
}
