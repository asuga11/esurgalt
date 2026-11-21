import React, { useMemo } from 'react';
import { applicationId } from 'expo-application';
import { WebView } from 'react-native-webview';

export default function YoutubePlayer({ videoId, onError }) {
  const uri = `https://www.youtube.com/embed/${videoId}?playsinline=1`;
  const source = useMemo(() => ({
    uri,
    headers: applicationId ? { Referer: `https://${applicationId.toLowerCase()}/` } : undefined,
  }), [uri]);

  return (
    <WebView
      source={source}
      style={{ flex: 1, backgroundColor: '#020617' }}
      scrollEnabled={false}
      allowsInlineMediaPlayback
      allowsFullscreenVideo
      javaScriptEnabled
      domStorageEnabled
      onShouldStartLoadWithRequest={({ url, isTopFrame }) => isTopFrame === false || url === uri || url === 'about:blank'}
      onError={onError}
      onHttpError={onError}
    />
  );
}
