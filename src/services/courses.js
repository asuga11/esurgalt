const currency = new Intl.NumberFormat('en-US');

function parseAmount(value) {
  const text = String(value ?? '').trim();
  if (!/^(?:\d+|\d{1,3}(?:[,\s]\d{3})+)(?:\.\d+)?(?:\s*₮)?$/.test(text)) return null;
  const amount = Number(text.replace(/[,\s₮]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

export function coursePricing(course) {
  if (course.isTulbur === false) return { amount: 0, previous: null };
  const listed = parseAmount(course.price);
  const sale = Number(course.sale);
  const discounted = sale > 0 ? parseAmount(course.info?.sellingPrice) : null;
  const amount = discounted ?? listed;
  const previous = listed !== null && amount !== null && amount < listed ? listed : null;
  return { amount, previous };
}

export function formatAmount(amount) {
  if (amount === null) return null;
  return amount === 0 ? 'Үнэгүй' : `${currency.format(amount)} ₮`;
}

export function findCourseEnrollment(response, courseId) {
  const courses = (response?.data ?? response)?.surgaltuud;
  if (!Array.isArray(courses)) throw new Error('Сургалтын эрх шалгаж чадсангүй.');
  return courses.find((item) => String(item?.surgalt?._id) === String(courseId)) ?? null;
}

export function getLessonMedia(source, baseUrl) {
  if (typeof source !== 'string' || !source.trim()) return null;
  try {
    const url = new URL(source.trim(), baseUrl + '/');
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be'].includes(url.hostname)) {
      const segments = url.pathname.split('/').filter(Boolean);
      const candidate = url.hostname === 'youtu.be'
        ? segments[0]
        : url.searchParams.get('v') || (['embed', 'shorts', 'live'].includes(segments[0]) ? segments[1] : null);
      if (candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
        return { kind: 'youtube', id: candidate, url: `https://www.youtube.com/watch?v=${candidate}` };
      }
    }
    if (/\.(mp4|m4v|webm|mov|m3u8|mpd)$/i.test(url.pathname)) {
      return { kind: 'video', url: url.toString() };
    }
    return { kind: 'link', url: url.toString() };
  } catch {
    return null;
  }
}
