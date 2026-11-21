const activityLimit = 80;

const examNotices = {
  'Хуваарилсан': 'Сорил хуваарилагдсан',
  'Дууссан': 'Сорил дууссан',
};
const courseNotices = {
  'Хүсэлт илгээсэн': 'Сургалтын хүсэлт хүлээгдэж байна',
  'Худалдаж авсан': 'Сургалтын эрх идэвхжсэн',
};

function makeNotice(kind, record, status, messages, fallback) {
  const title = typeof status === 'string' && Object.hasOwn(messages, status) ? messages[status] : null;
  if (!record?._id || !title) return null;
  const targetId = String(record._id);
  return {
    id: `${kind}:${targetId}:${status}`,
    targetId,
    kind,
    title,
    name: typeof record.name === 'string' && record.name.trim() ? record.name : fallback,
    read: false,
  };
}

export function collectNotices(exams, courses) {
  return [
    ...exams.map((entry) => makeNotice('exam', entry?.shalgalt, entry?.info?.examStatus, examNotices, 'Сорил')),
    ...courses.map((entry) => makeNotice('course', entry?.surgalt, entry?.suraltsagch?.status, courseNotices, 'Сургалт')),
  ].filter(Boolean);
}

export function mergeNotices(existing, incoming) {
  const known = new Set(existing.map(({ id }) => id));
  const added = incoming.filter(({ id }) => {
    if (known.has(id)) return false;
    known.add(id);
    return true;
  });
  return added.length ? [...added, ...existing].slice(0, activityLimit) : existing;
}

export function readStoredNotices(raw) {
  const entries = JSON.parse(raw || '[]');
  if (!Array.isArray(entries)) return [];
  return entries.filter((entry) => entry && ['exam', 'course'].includes(entry.kind) &&
    ['id', 'targetId', 'title', 'name'].every((key) => typeof entry[key] === 'string' && entry[key]) &&
    typeof entry.read === 'boolean').slice(0, activityLimit);
}
