import React, { useState } from 'react';
import API from '../services/api';
import AccountForm from '../components/AccountForm';
import FormInput from '../components/FormInput';

function readResetToken(value) {
  const input = value.trim();
  if (!input.includes('://')) return input;
  try {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    const token = url.pathname.match(/\/changepassword\/suragch\/([^/]+)\/?$/)?.[1];
    return token ? decodeURIComponent(token) : '';
  } catch {
    return '';
  }
}

export default function ResetPasswordScreen({ route, navigation }) {
  const [resetLink, setResetLink] = useState(route.params?.resetToken || '');
  const [password, setPassword] = useState('');

  const reset = async () => {
    const resetToken = readResetToken(resetLink);
    if (!resetToken) throw new Error('Имэйлээр ирсэн сэргээх холбоос эсвэл кодоо шалгана уу.');
    if (password.trim().length < 6) throw new Error('Нууц үг хамгийн багадаа 6 тэмдэгт байна.');
    await API.resetPassword({ resetToken, password });
    return {
      message: 'Нууц үг шинэчлэгдлээ.',
      actionLabel: 'Нэвтрэх хуудас руу буцах',
      action: () => navigation.popTo('Login'),
    };
  };

  return (
    <AccountForm title="Нууц үг шинэчлэх" icon="lock-closed-outline"
      description="Имэйлээр ирсэн холбоос эсвэл кодоо ашиглана уу." onSubmit={reset} submitLabel="Нууц үг шинэчлэх">
      {({ pending, clearError, submit }) => (
        <>
          <FormInput label="Сэргээх холбоос эсвэл код" value={resetLink} autoCapitalize="none" editable={!pending}
            onChangeText={(value) => { setResetLink(value); clearError(); }} />
          <FormInput label="Шинэ нууц үг" value={password} secureTextEntry autoComplete="new-password"
            autoCapitalize="none" editable={!pending} returnKeyType="go" onSubmitEditing={submit}
            onChangeText={(value) => { setPassword(value); clearError(); }} />
        </>
      )}
    </AccountForm>
  );
}
