const BASE_URL = 'http://west.edu.mn:3000';
const API_VERSION = '/api/v1';

const buildUrl = (path) => `${BASE_URL}${API_VERSION}${path}`;

const parseJsonSafely = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {
      success: false,
      message: text || 'Серверээс буруу хариу ирлээ',
    };
  }
};

const getErrorMessage = (data, fallback) =>
  data?.message ||
  data?.error ||
  data?.msg ||
  (Array.isArray(data?.errors) ? data.errors[0]?.message : null) ||
  fallback;

const handleResponse = async (response, defaultMessage) => {
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, defaultMessage));
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

const request = async (path, options = {}, defaultMessage = 'Хүсэлт амжилтгүй боллоо') => {
  const response = await fetch(buildUrl(path), options);
  return handleResponse(response, defaultMessage);
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

  getBulegListBySchoolId: (schoolId, token = null) =>
    request(
      `/suragch/buleg/${normalizeId(schoolId, 'Сургуулийн ID')}`,
      {
        method: 'GET',
        headers: createHeaders(token),
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

  findSchoolsByProvince: (provinceName, soumName = '', token = null) =>
    request(
      `/surguuli/find/${encodeURIComponent(String(provinceName || '').trim())}/${encodeURIComponent(String(soumName || '').trim())}`,
      {
        method: 'GET',
        headers: createHeaders(token),
      },
      'Аймгаар сургууль хайхад алдаа гарлаа'
    ),
};

export default API;
