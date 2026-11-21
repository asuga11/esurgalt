import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import CollectionState from '../components/CollectionState';
import InlineNotice from '../components/InlineNotice';
import FormInput from '../components/FormInput';
import { CameraView, useCameraPermissions } from 'expo-camera';
import CustomButton from '../components/CustomButton';
import ScreenWrapper from '../components/ScreenWrapper';
import BottomNavigationBar from '../components/BottomNavigationBar';
import getExamFromQr from '../services/examQr';

export default function QRScannerScreen({ navigation }) {
  const isFocused = useIsFocused();
  const scanLocked = useRef(false);
  const [manualUrl, setManualUrl] = useState('');
  const { height: screenHeight } = useWindowDimensions();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [cameraKey, setCameraKey] = useState(0);
  const [permissionError, setPermissionError] = useState('');
  const previewHeight = Math.min(390, Math.max(250, screenHeight * 0.44));

  const bottomBar = <BottomNavigationBar active="scan" navigation={navigation} />;

  const openExam = (value, fromCamera = false) => {
    if (!isFocused || scanLocked.current) return;
    const examId = getExamFromQr(value);

    if (!examId) {
      if (fromCamera) setScanned(true);
      setScanMessage('Сорилын QR код эсвэл холбоосоо шалгана уу.');
      return;
    }

    scanLocked.current = true;
    setScanned(true);
    setScanMessage('');
    navigation.replace('Quiz', { examId });
  };

  const restartCamera = () => {
    scanLocked.current = false;
    setCameraError('');
    setCameraReady(false);
    setTorchEnabled(false);
    setScanned(false);
    setScanMessage('');
    setCameraKey((key) => key + 1);
  };

  useEffect(() => {
    if (!isFocused) {
      scanLocked.current = false;
      setScanned(false);
      setCameraReady(false);
      setTorchEnabled(false);
    }
  }, [isFocused]);

  const manualEntry = (
    <View className="mt-4 rounded-2xl border border-line bg-white p-4">
      <FormInput icon="link-outline" label="Сорилын холбоос" value={manualUrl} onChangeText={(value) => {
        setManualUrl(value);
        setScanMessage('');
      }} keyboardType="url" autoCapitalize="none" placeholder="https://…/e/…" returnKeyType="go" onSubmitEditing={() => { if (manualUrl.trim()) openExam(manualUrl); }} />
      {!!scanMessage && <Text accessibilityRole="alert" className="text-rose-700">{scanMessage}</Text>}
      <CustomButton title="Холбоосоор нээх" variant="outline" disabled={!manualUrl.trim()} onPress={() => openExam(manualUrl)} />
    </View>
  );

  if (!permission) {
    return (
      <ScreenWrapper scroll bottomBar={bottomBar}>
        <CollectionState state="loading" title="Камерын зөвшөөрөл шалгаж байна…" />
        {manualEntry}
      </ScreenWrapper>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper scroll bottomBar={bottomBar}>
        <View className="rounded-[24px] border border-line bg-white p-5">
          <View className="mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
            <Ionicons name="camera-outline" size={28} color="#3754bf" />
          </View>
          <Text className="mt-4 text-center text-xl font-extrabold text-slate-900">Камерын зөвшөөрөл хэрэгтэй</Text>
          <Text className="mt-3 text-center leading-6 text-slate-600">
            {permission.canAskAgain
              ? 'Сорилын QR кодыг уншуулахын тулд камер ашиглах зөвшөөрөл өгнө үү.'
              : 'Камерын зөвшөөрөл хаалттай байна. Төхөөрөмжийн Settings хэсгээс аппын Camera зөвшөөрлийг асаана уу.'}
          </Text>
          <InlineNotice message={permissionError} />
          <CustomButton
            title={permission.canAskAgain ? 'Камер зөвшөөрөх' : 'Камерын тохиргоо нээх'}
            onPress={async () => {
              setPermissionError('');
              try {
                if (permission.canAskAgain) await requestPermission();
                else await Linking.openSettings();
              } catch {
                setPermissionError('Камерын зөвшөөрлийг нээж чадсангүй. Сорилын холбоосоо оруулж болно.');
              }
            }}
          />
          {!permission.canAskAgain && <CustomButton title="Зөвшөөрөл дахин шалгах" variant="outline"
            onPress={() => getPermission().catch(() => setPermissionError('Зөвшөөрөл шалгаж чадсангүй.'))} />}
        </View>
        {manualEntry}
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll bottomBar={bottomBar}>
      <View className="flex-1 rounded-[30px] border border-line bg-white p-4 shadow-card">
        <View className="flex-row items-center">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
            <Ionicons name="qr-code-outline" size={25} color="#3754bf" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xl font-extrabold text-slate-900">Сорилын QR</Text>
            <Text className="mt-1 text-sm text-slate-500">Камераа код руу чиглүүлнэ үү</Text>
          </View>
          <View className={`rounded-full px-3 py-1.5 ${cameraError ? 'bg-rose-50' : cameraReady ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <Text className={`text-xs font-bold ${cameraError ? 'text-rose-700' : cameraReady ? 'text-emerald-700' : 'text-amber-700'}`}>
              {cameraError ? 'Камерын алдаа' : cameraReady ? 'Уншуулахад бэлэн' : 'Камер асаж байна'}
            </Text>
          </View>
        </View>

        <View style={{ height: previewHeight }} className="relative mt-4 overflow-hidden rounded-[28px] bg-slate-950">
          {cameraError ? (
            <View className="flex-1 items-center justify-center px-6">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-rose-500/15">
                <Ionicons name="videocam-off-outline" size={28} color="#fda4af" />
              </View>
              <Text className="mt-4 text-center text-base font-bold text-white">Камерын дүрс нээгдсэнгүй</Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-300">{cameraError}</Text>
              <TouchableOpacity onPress={restartCamera} className="mt-5 rounded-2xl bg-brand-500 px-5 py-3">
                <Text className="font-bold text-white">Дахин оролдох</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {isFocused && <CameraView
                key={cameraKey}
                style={{ width: '100%', height: previewHeight }}
                facing="back"
                enableTorch={torchEnabled}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : ({ data }) => openExam(data, true)}
                onCameraReady={() => setCameraReady(true)}
                onMountError={(event) => {
                  setCameraReady(false);
                  setCameraError(event?.message || 'Камер нээгдсэнгүй. Permission-ээ шалгаад дахин оролдоно уу.');
                }}
              />}
              <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                <View className="h-56 w-56">
                  <View className="absolute left-2 right-2 top-1/2 h-[2px] bg-brand-300/70" />
                  <View style={{ position: 'absolute', top: 0, left: 0, width: 34, height: 34, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#a5b4fc', borderTopLeftRadius: 14 }} />
                  <View style={{ position: 'absolute', top: 0, right: 0, width: 34, height: 34, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#a5b4fc', borderTopRightRadius: 14 }} />
                  <View style={{ position: 'absolute', bottom: 0, left: 0, width: 34, height: 34, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#a5b4fc', borderBottomLeftRadius: 14 }} />
                  <View style={{ position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#a5b4fc', borderBottomRightRadius: 14 }} />
                  {!cameraReady && (
                    <View className="absolute inset-0 items-center justify-center">
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text className="mt-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">Камер асаж байна...</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={torchEnabled ? 'Гэрэл унтраах' : 'Гэрэл асаах'}
                disabled={!cameraReady}
                onPress={() => setTorchEnabled((enabled) => !enabled)}
                className={`absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full ${cameraReady ? 'bg-slate-950/70' : 'bg-slate-950/40'}`}
              >
                <Ionicons name={torchEnabled ? 'flash' : 'flash-outline'} size={21} color="#ffffff" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className={`mt-4 flex-row items-start rounded-2xl p-4 ${scanMessage ? 'bg-rose-50' : 'bg-brand-50'}`}>
          <Ionicons name={scanMessage ? 'alert-circle-outline' : 'information-circle-outline'} size={20} color={scanMessage ? '#e11d48' : '#3754bf'} />
          <Text className={`ml-2 flex-1 text-sm leading-5 ${scanMessage ? 'text-rose-800' : 'text-brand-800'}`}>
            {scanMessage || 'Сорилын QR кодыг хүрээнд тааруулна уу. Уншмагц сорилын холбоос нээгдэнэ.'}
          </Text>
        </View>
        {scanned && (
          <CustomButton title="Дахин уншуулах" onPress={() => { scanLocked.current = false; setScanned(false); setScanMessage(''); }} />
        )}
      </View>
      {manualEntry}
    </ScreenWrapper>
  );
}
