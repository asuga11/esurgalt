export const SERVER_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://west.edu.mn:3000').replace(/\/+$/, '');
const API_VERSION = '/api/v1';
const REQUEST_TIMEOUT_MS = 15000;

const buildUrl = (path) => `${SERVER_URL}${API_VERSION}${path}`;

const getErrorMessage = (data, fallback) => [
  data?.message, data?.error, data?.msg, data?.errors?.[0]?.message,
].find((message) => typeof message === 'string' && message.trim()) || fallback;

const handleResponse = async (response, defaultMessage, allowFailure) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw Object.assign(new Error('Серверээс буруу хариу ирлээ.'), { status: response.status });
  }

  if (!response.ok || (!allowFailure && data?.success === false)) {
    throw Object.assign(new Error(getErrorMessage(data, defaultMessage)), { status: response.status });
  }

  return data;
};

const createHeaders = (token = null, isJson = true) => {
  const headers = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const normalizeId = (id, fieldName = 'ID') => {
  const value = String(id || '').trim();

  if (!value) {
    throw new Error(`${fieldName} хоосон байна`);
  }

  return encodeURIComponent(value);
};

const normalizeEmail = (email) => {
  const value = String(email || '').trim().toLowerCase();

  if (!value) {
    throw new Error('И-мэйл хоосон байна');
  }

  return value;
};

const request = async (path, { signal, allowFailure, ...options } = {}, defaultMessage = 'Хүсэлт амжилтгүй боллоо') => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path), { ...options, signal: controller.signal });
    return await handleResponse(response, defaultMessage, allowFailure);
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error?.name === 'AbortError') {
      throw new Error('Сервер хариу өгөх хугацаа хэтэрлээ');
    }

    if (error instanceof TypeError) {
      throw new Error('Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
};

const API = {
  createStudent: (studentData, token = null) =>
    request(
      '/suragch',
      {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify(studentData),
      },
      'Шинэ сурагч үүсгэхэд алдаа гарлаа'
    ),

  getStudentById: (id, token = null) =>
    request(
      `/suragch/${normalizeId(id, 'Сурагчийн ID')}`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      'Сурагчийн мэдээлэл авахад алдаа гарлаа'
    ),

  updateStudentById: (id, updateData, token = null) =>
    request(
      `/suragch/${normalizeId(id, 'Сурагчийн ID')}`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify(updateData),
      },
      'Сурагчийн мэдээлэл засахад алдаа гарлаа'
    ),

  login: (email, password) =>
    request(
      '/suragch/login',
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          email: normalizeEmail(email),
          loginName: normalizeEmail(email),
          password,
        }),
      },
      'Нэвтрэх хүсэлт амжилтгүй боллоо'
    ),

  register: (formData) =>
    request(
      '/suragch/register',
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(formData),
      },
      'Бүртгэл амжилтгүй боллоо'
    ),

  forgotPassword: (email) =>
    request(
      '/suragch/forgot-password',
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ email: normalizeEmail(email) }),
      },
      'Нууц үг сэргээх хүсэлт илгээхэд алдаа гарлаа'
    ),

  verifyEmail: (code, token = null) =>
    request(
      `/suragch/verification_get/${normalizeId(code, 'Баталгаажуулах код')}`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      'И-мэйл баталгаажуулахад алдаа гарлаа'
    ),

  resetPassword: ({ resetToken, password }, token = null) =>
    request(
      '/suragch/reset-password',
      {
        method: 'POST',
        headers: createHeaders(token),
        body: JSON.stringify({ password, resetToken }),
      },
      'Нууц үг солиход алдаа гарлаа'
    ),

  getBulegListBySchoolId: (schoolId, token = null, signal) =>
    request(
      `/suragch/buleg/${normalizeId(schoolId, 'Сургуулийн ID')}`,
      {
        method: 'GET',
        headers: createHeaders(token),
        signal,
      },
      'Бүлгийн жагсаалт авахад алдаа гарлаа'
    ),

  getStudentByEmail: (email, token = null) =>
    request(
      `/suragch/email/${encodeURIComponent(normalizeEmail(email))}`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      'И-мэйлээр сурагч хайхад алдаа гарлаа'
    ),

  findSchoolsByProvince: (provinceName, soumName = '', token = null, signal) =>
    request(
      `/surguuli/find/${encodeURIComponent(String(provinceName || '').trim())}/${encodeURIComponent(String(soumName || '').trim())}`,
      {
        method: 'GET',
        headers: createHeaders(token),
        signal,
      },
      'Аймгаар сургууль хайхад алдаа гарлаа'
    ),

  getExamById: (id, token, signal) =>
    request(
      `/shalgalt/${normalizeId(id, 'Сорилын ID')}`,
      { method: 'GET', headers: createHeaders(token, false), signal },
      'Сорилын мэдээлэл авахад алдаа гарлаа'
    ),

  async getExamsByType(examType, token, signal) {
    const exams = new Map();
    for (let page = 1; ; page += 1) {
      const response = await request(
        `/shalgalt/lists?examType=${encodeURIComponent(examType)}&sort=_id&page=${page}&limit=100`,
        { headers: createHeaders(token, false), signal },
        'Сорилын жагсаалт авахад алдаа гарлаа'
      );
      const data = response?.data ?? response;
      const items = data?.shalgalt ?? data?.exams ?? data?.content;
      if (!Array.isArray(items)) throw new Error('Сорилын жагсаалтын мэдээлэл буруу байна.');
      for (const exam of items) {
        const id = exam?._id ?? exam?.id;
        if (id && (!exam.examType || exam.examType === examType)) exams.set(id, { ...exam, _id: id });
      }
      const pageCount = Number(data.pagination?.pageCount);
      if (!Number.isSafeInteger(pageCount) || page >= pageCount) return [...exams.values()];
    }
  },

  async getMemberExam(examId, memberId, token, signal) {
    try {
      return await request(
        `/shalgalt/findOne/${normalizeId(examId, 'Сорилын ID')}/${normalizeId(memberId, 'Оролцогчийн ID')}`,
        { headers: createHeaders(token, false), signal, allowFailure: true },
        'Оролцогчийн сорил авахад алдаа гарлаа'
      );
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  async getMemberExamList(memberId, token, signal) {
    const response = await request(
      `/shalgalt/member/${normalizeId(memberId, 'Оролцогчийн ID')}`,
      { headers: createHeaders(token, false), signal },
      'Бүртгүүлсэн сорилуудыг ачаалж чадсангүй.'
    );
    const exams = (response?.data ?? response)?.shalgaltuud;
    if (!Array.isArray(exams)) throw new Error('Бүртгүүлсэн сорилуудын мэдээлэл буруу байна.');
    return exams;
  },

  async getExamQuestion(attemptId, token, signal) {
    const response = await request(
      `/shalgaltdun/${normalizeId(attemptId, 'Даалгаврын ID')}`,
      { headers: createHeaders(token, false), signal },
      'Асуулт ачаалж чадсангүй.'
    );
    const data = response?.data ?? response;
    const attempt = data?.shalgaltdun;
    if (!attempt?._id || String(attempt._id) !== String(attemptId) || !attempt.testsan_id?._id) {
      throw new Error('Асуултын дэлгэрэнгүй мэдээлэл олдсонгүй.');
    }
    return { ...attempt, tooZuv: data.tooZuv ?? attempt.tooZuv };
  },

  async getPublicCourses(signal) {
    const courses = new Map();
    for (let page = 1; ; page += 1) {
      const response = await request(
        `/surgalt?limit=100&page=${page}`,
        { signal },
        'Сургалтуудыг ачаалж чадсангүй.'
      );
      const data = response?.data ?? response;
      if (!Array.isArray(data?.surgalt)) throw new Error('Сургалтын жагсаалтын мэдээлэл буруу байна.');
      for (const course of data.surgalt) {
        if (course?._id) courses.set(course._id, course);
      }
      const pageCount = Number(data.pagination?.pageCount);
      if (!Number.isSafeInteger(pageCount) || page >= pageCount) return [...courses.values()];
    }
  },

  async getCourse(courseId, token, signal) {
    const response = await request(`/surgalt/${normalizeId(courseId, 'Сургалтын ID')}`, {
      headers: createHeaders(token, false),
      signal,
    }, 'Сургалт ачаалж чадсангүй.');
    const course = (response?.data ?? response)?.surgalt;
    if (!course?._id) throw new Error('Сургалтын мэдээлэл олдсонгүй.');
    return course;
  },

  requestCourseAccess: (courseId, member, token) =>
    request(`/surgalt/addMember/${normalizeId(courseId, 'Сургалтын ID')}`, {
      method: 'PUT',
      headers: createHeaders(token),
      body: JSON.stringify(member),
    }, 'Сургалтын хүсэлт илгээж чадсангүй.'),

  getMemberCourses: (memberId, token, signal) =>
    request(`/surgalt/member/${normalizeId(memberId, 'Сурагчийн ID')}`, {
      headers: createHeaders(token, false),
      signal,
    }, 'Сургалтын жагсаалт ачаалж чадсангүй.'),

  registerExamMember: (examId, memberData, token) =>
    request(
      `/shalgalt/addMember/${normalizeId(examId, 'Сорилын ID')}`,
      { method: 'PUT', headers: createHeaders(token), body: JSON.stringify(memberData) },
      'Сорилд бүртгүүлэхэд алдаа гарлаа'
    ),

  startExam: (examId, memberData, token) =>
    request(
      `/shalgalt/startTest/${normalizeId(examId, 'Сорилын ID')}`,
      { method: 'PUT', headers: createHeaders(token), body: JSON.stringify(memberData) },
      'Сорил эхлүүлэхэд алдаа гарлаа'
    ),

  saveExamWork: (attemptId, testId, studAnswers, token) =>
    request(
      `/shalgaltdun/working/${normalizeId(attemptId, 'Даалгаврын ID')}`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify({ testsan_id: testId, studAnswers }),
      },
      'Хариулт хадгалахад алдаа гарлаа'
    ),

  updateExamAnswer: (attemptId, answer, testId, token) =>
    request(
      `/shalgaltdun/updateStudAnswer/${normalizeId(attemptId, 'Даалгаврын ID')}`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify({ _id: answer?._id, value: answer?.value, testsan_id: testId }),
      },
      'Хариулт хадгалахад алдаа гарлаа'
    ),

  finishExam: (examId, memberId, token) =>
    request(
      `/shalgalt/updateMember/${normalizeId(examId, 'Сорилын ID')}`,
      {
        method: 'PUT',
        headers: createHeaders(token),
        body: JSON.stringify({ _id: memberId, examStatus: 'Дууссан' }),
      },
      'Сорил дуусгахад алдаа гарлаа'
    ),
};

export default API;
