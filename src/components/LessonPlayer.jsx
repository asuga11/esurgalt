import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import CustomButton from './CustomButton';
import YoutubePlayer from './YoutubePlayer';

function DirectVideo({ uri, onError }) {
  const player = useVideoPlayer(uri);
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (status === 'error') onError();
  }, [status, onError]);

  return (
    <VideoView player={player} style={{ width: '100%', height: '100%' }} nativeControls
      contentFit="contain" fullscreenOptions={{ enable: true, orientation: 'landscape' }} />
  );
}

export default function LessonPlayer({ route, navigation }) {
  const { media, title = 'Хичээл' } = route.params ?? {};
  const [full, setFull] = useState(false);
  const [error, setError] = useState('');
  const root = useRef(null);
  const isVideo = media?.kind === 'youtube' || media?.kind === 'video';

  useLayoutEffect(() => {
    if (Platform.OS !== 'web') navigation.setOptions({ orientation: full ? 'landscape' : 'portrait_up' });
  }, [full, navigation]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = root.current;
    let entered = false;
    const sync = () => {
      if (document.fullscreenElement === element) {
        entered = true;
      } else if (entered && !document.fullscreenElement) {
        entered = false;
        screen.orientation?.unlock?.();
        setFull(false);
      }
    };

    document.addEventListener('fullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      if (document.fullscreenElement === element) {
        screen.orientation?.unlock?.();
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const exitFullscreen = () => {
    setFull(false);
    if (Platform.OS === 'web' && document.fullscreenElement === root.current) {
      screen.orientation?.unlock?.();
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    if (full) {
      exitFullscreen();
      return;
    }

    setFull(true);
    if (Platform.OS === 'web') {
      const element = root.current;
      element?.requestFullscreen?.().then(async () => {
        if (document.fullscreenElement !== element) return;
        try {
          await screen.orientation?.lock?.('landscape');
          if (document.fullscreenElement !== element) screen.orientation?.unlock?.();
        } catch {
          // Browser fullscreen still works when rotation locking is unavailable.
        }
      }).catch(() => {});
    }
  };

  const close = () => {
    exitFullscreen();
    navigation.goBack();
  };

  const openSource = async () => {
    try {
      await Linking.openURL(media.url);
    } catch {
      setError('Видеоны холбоосыг нээж чадсангүй.');
    }
  };

  const onPlaybackError = React.useCallback(() => setError('Видеог тоглуулж чадсангүй.'), []);
  const fullscreenLabel = full ? 'Бүтэн дэлгэцээс гарах' : 'Бүтэн дэлгэцээр үзэх';

  return (
    <View ref={root} className="flex-1 bg-slate-950">
      <StatusBar style="light" hidden={full} />
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="min-h-[48px] flex-row items-center gap-2 px-3">
          <Pressable accessibilityRole="button" accessibilityLabel="Хичээл рүү буцах" onPress={close}
            className="h-11 w-11 items-center justify-center rounded-xl">
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </Pressable>
          <Text accessibilityRole="header" numberOfLines={1} className="flex-1 font-bold text-white">{title}</Text>
          {isVideo && (
            <Pressable accessibilityRole="button" accessibilityLabel={fullscreenLabel} onPress={toggleFullscreen}
              className="h-11 w-11 items-center justify-center rounded-xl">
              <Ionicons name={full ? 'contract-outline' : 'expand-outline'} size={23} color="#ffffff" />
            </Pressable>
          )}
        </View>

        {isVideo && (
          <View className={full
            ? 'min-h-0 flex-1 bg-black'
            : 'mx-auto mt-3 aspect-video w-full max-w-[960px] bg-black'}>
            {media.kind === 'youtube'
              ? <YoutubePlayer videoId={media.id} title={title} onError={onPlaybackError} />
              : <DirectVideo uri={media.url} onError={onPlaybackError} />}
          </View>
        )}

        {!!error && <Text accessibilityRole="alert" className="px-4 py-2 text-rose-300">{error}</Text>}
        {!full && media?.url && (
          <View className="mx-auto w-full max-w-[440px] px-4 pt-2">
            <CustomButton title={media.kind === 'youtube' ? 'YouTube дээр нээх' : 'Холбоосоор нээх'}
              variant="outline" compact onPress={openSource} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
