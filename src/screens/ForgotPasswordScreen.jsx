import React, { useState } from 'react';
import API from '../services/api';
import AccountForm from '../components/AccountForm';
import FormInput from '../components/FormInput';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const sendRequest = async () => {
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Зөв имэйл хаяг оруулна уу.');
    await API.forgotPassword(address);
    return {
      message: 'Сэргээх хүсэлт илгээгдлээ. Имэйлээ шалгана уу.',
      actionLabel: 'Нууц үг шинэчлэх',
      action: () => navigation.navigate('ResetPassword'),
    };
  };

  return (
    <AccountForm title="Нууц үг сэргээх" icon="mail-outline" description="Бүртгэлтэй имэйл хаягаа оруулна уу."
      onSubmit={sendRequest} submitLabel="Илгээх">
      {({ pending, clearError, submit }) => (
        <FormInput label="Имэйл хаяг" value={email} placeholder="ner@example.mn"
          onChangeText={(value) => { setEmail(value); clearError(); }} onSubmitEditing={submit}
          returnKeyType="send" editable={!pending} autoComplete="email" keyboardType="email-address" autoCapitalize="none" />
      )}
    </AccountForm>
  );
}
