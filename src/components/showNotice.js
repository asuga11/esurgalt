import { Alert, Platform } from 'react-native';

export default function showNotice(title, message, actions) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    actions?.[0]?.onPress?.();
    return;
  }
  Alert.alert(title, message, actions);
}
