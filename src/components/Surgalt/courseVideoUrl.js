import { uploadBaseUrl } from "../../config";

const filename = /^[^/\\:?#]+(?:[?#].*)?$/;
const videoExtension = /\.(?:mp4|m4v|webm|mov|ogv|m3u8|mpd)(?:[?#]|$)/i;
const schoolUploadHosts = new Set(["west.edu.mn", "west.edu.mn:3000", "e-surgalt.west.edu.mn"]);

export function courseVideoUrl(value, lessonType) {
  if (typeof value !== "string" || !value.trim()) return null;

  const source = value.trim();
  try {
    const upload = new URL(`${uploadBaseUrl}/`, window.location.href);
    let url;
    if (source.startsWith("surgalt/videos/")) {
      url = new URL(source, upload);
    } else if (filename.test(source) && (lessonType === false || (lessonType !== true && videoExtension.test(source)))) {
      url = new URL(`surgalt/videos/${source}`, upload);
    } else {
      url = new URL(source, `${upload.origin}/`);
    }
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.pathname.startsWith("/upload/") && (url.origin === upload.origin || schoolUploadHosts.has(url.host))) {
      const media = new URL(upload);
      media.pathname += url.pathname.slice("/upload/".length);
      media.search = url.search;
      media.hash = url.hash;
      return media.href;
    }
    return url.href;
  } catch {
    return null;
  }
}
