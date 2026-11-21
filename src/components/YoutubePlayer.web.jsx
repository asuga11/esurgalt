import React from 'react';

export default function YoutubePlayer({ videoId, title, onError }) {
  return (
    <iframe
      title={title}
      src={`https://www.youtube.com/embed/${videoId}?playsinline=1`}
      style={{ width: '100%', height: '100%', border: 0 }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      onError={onError}
    />
  );
}
