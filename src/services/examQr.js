export default function getExamFromQr(value) {
  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const match = url.pathname.match(/\/e\/([^/]+)\/?$/);
    if (!match) return null;
    const examId = decodeURIComponent(match[1]);
    return /^[a-z0-9_-]{1,128}$/i.test(examId) ? examId : null;
  } catch {
    return null;
  }
}
