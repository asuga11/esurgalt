import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
import CollectionState from '../components/CollectionState';
import InlineNotice from '../components/InlineNotice';
import PageIntro from '../components/PageIntro';
import ScreenWrapper from '../components/ScreenWrapper';

const LOCATION_OPTIONS = {
  'Улаанбаатар': ['Багануур', 'Багахангай', 'Баянгол', 'Баянзүрх', 'Налайх', 'Сонгинохайрхан', 'Сүхбаатар', 'Хан-Уул', 'Чингэлтэй'],
  'Архангай': ['Батцэнгэл', 'Булган', 'Жаргалант', 'Ихтамир', 'Өгийнуур', 'Өлзийт', 'Өндөр-Улаан', 'Тариат', 'Төвшрүүлэх', 'Хайрхан', 'Хангай', 'Хашаат', 'Хотонт', 'Цахир', 'Цэнхэр', 'Цэцэрлэг', 'Чулуут', 'Эрдэнэбулган', 'Эрдэнэмандал'],
  'Баян-Өлгий': ['Алтай', 'Алтанцөгц', 'Баяннуур', 'Бугат', 'Булган', 'Буянт', 'Дэлүүн', 'Ногооннуур', 'Сагсай', 'Толбо', 'Улаанхус', 'Цагааннуур', 'Цэнгэл', 'Өлгий'],
  'Баянхонгор': ['Баацагаан', 'Баян-Овоо', 'Баян-Өндөр', 'Баянбулаг', 'Баянговь', 'Баянлиг', 'Баянхонгор', 'Баянцагаан', 'Богд', 'Бөмбөгөр', 'Бууцагаан', 'Галуут', 'Гурванбулаг', 'Жаргалант', 'Жинст', 'Заг', 'Өлзийт', 'Хүрээмарал', 'Шинэжинст', 'Эрдэнэцогт'],
  'Булган': ['Баян-Агт', 'Баяннуур', 'Бугат', 'Булган', 'Бүрэгхангай', 'Гурванбулаг', 'Дашинчилэн', 'Могод', 'Орхон', 'Рашаант', 'Сайхан', 'Сэлэнгэ', 'Тэшиг', 'Хангал', 'Хишиг-Өндөр', 'Хутаг-Өндөр'],
  'Говь-Алтай': ['Алтай', 'Баян-Уул', 'Бигэр', 'Бугат', 'Дарви', 'Дэлгэр', 'Есөнбулаг', 'Жаргалан', 'Тайшир', 'Тонхил', 'Төгрөг', 'Халиун', 'Хөхморьт', 'Цогт', 'Цээл', 'Чандмань', 'Шарга', 'Эрдэнэ'],
  'Говьсүмбэр': ['Баянтал', 'Сүмбэр', 'Шивээговь'],
  'Дархан-Уул': ['Дархан', 'Орхон', 'Хонгор', 'Шарын гол'],
  'Дорноговь': ['Айраг', 'Алтанширээ', 'Даланжаргалан', 'Дэлгэрэх', 'Замын-Үүд', 'Иххэт', 'Мандах', 'Өргөн', 'Сайхандулаан', 'Сайншанд', 'Улаанбадрах', 'Хатанбулаг', 'Хөвсгөл', 'Эрдэнэ'],
  'Дорнод': ['Баяндун', 'Баянтүмэн', 'Баян-Уул', 'Булган', 'Гурванзагал', 'Дашбалбар', 'Матад', 'Сэргэлэн', 'Халхгол', 'Хөлөнбуйр', 'Хэрлэн', 'Цагаан-Овоо', 'Чойбалсан', 'Чулуунхороот'],
  'Дундговь': ['Адаацаг', 'Баянжаргалан', 'Говь-Угтаал', 'Гурвансайхан', 'Дэлгэрхангай', 'Дэлгэрцогт', 'Дэрэн', 'Луус', 'Өлзийт', 'Өндөршил', 'Сайхан-Овоо', 'Сайнцагаан', 'Хулд', 'Цагаандэлгэр', 'Эрдэнэдалай'],
  'Завхан': ['Алдархаан', 'Асгат', 'Баянтэс', 'Баянхайрхан', 'Дөрвөлжин', 'Завханмандал', 'Идэр', 'Их-Уул', 'Нөмрөг', 'Отгон', 'Сантмаргац', 'Сонгино', 'Тосонцэнгэл', 'Түдэвтэй', 'Тэлмэн', 'Тэс', 'Улиастай', 'Ургамал', 'Цагаанхайрхан', 'Цагаанчулуут', 'Цэцэн-Уул', 'Шилүүстэй', 'Эрдэнэхайрхан', 'Яруу'],
  'Орхон': ['Баян-Өндөр', 'Жаргалант'],
  'Өвөрхангай': ['Арвайхээр', 'Баруунбаян-Улаан', 'Бат-Өлзий', 'Баянгол', 'Баян-Өндөр', 'Богд', 'Бүрд', 'Гучин-Ус', 'Есөнзүйл', 'Зүүнбаян-Улаан', 'Нарийнтээл', 'Өлзийт', 'Сант', 'Тарагт', 'Төгрөг', 'Уянга', 'Хайрхандулаан', 'Хархорин', 'Хужирт'],
  'Өмнөговь': ['Баяндалай', 'Баян-Овоо', 'Булган', 'Гурвантэс', 'Даланзадгад', 'Мандал-Овоо', 'Манлай', 'Ноён', 'Номгон', 'Сэврэй', 'Ханбогд', 'Ханхонгор', 'Хүрмэн', 'Цогт-Овоо', 'Цогтцэций'],
  'Сүхбаатар': ['Асгат', 'Баяндэлгэр', 'Дарьганга', 'Мөнххаан', 'Наран', 'Онгон', 'Сүхбаатар', 'Түвшинширээ', 'Түмэнцогт', 'Уулбаян', 'Халзан', 'Эрдэнэцагаан'],
  'Сэлэнгэ': ['Алтанбулаг', 'Баруунбүрэн', 'Баянгол', 'Ерөө', 'Жавхлант', 'Зүүнбүрэн', 'Мандал', 'Орхон', 'Орхонтуул', 'Сайхан', 'Сант', 'Сүхбаатар', 'Түшиг', 'Хүдэр', 'Хушаат', 'Цагааннуур', 'Шаамар'],
  'Төв': ['Алтанбулаг', 'Аргалант', 'Архуст', 'Батсүмбэр', 'Баян', 'Баяндэлгэр', 'Баянжаргалан', 'Баян-Өнжүүл', 'Баянхангай', 'Баянцагаан', 'Баянцогт', 'Баянчандмань', 'Борнуур', 'Бүрэн', 'Дэлгэрхаан', 'Жаргалант', 'Заамар', 'Зуунмод', 'Лүн', 'Мөнгөнморьт', 'Өндөрширээт', 'Сэргэлэн', 'Сүмбэр', 'Угтаалцайдам', 'Цээл', 'Эрдэнэ', 'Эрдэнэсант'],
  'Увс': ['Баруунтуруун', 'Бөхмөрөн', 'Давст', 'Завхан', 'Зүүнговь', 'Зүүнхангай', 'Малчин', 'Наранбулаг', 'Өлгий', 'Өмнөговь', 'Өндөрхангай', 'Сагил', 'Тариалан', 'Түргэн', 'Тэс', 'Улаангом', 'Ховд', 'Хяргас', 'Цагаанхайрхан'],
  'Ховд': ['Алтай', 'Булган', 'Буянт', 'Дарви', 'Дөргөн', 'Дуут', 'Жаргалант', 'Зэрэг', 'Манхан', 'Мөнххайрхан', 'Мөст', 'Мянгад', 'Үенч', 'Ховд', 'Цэцэг', 'Чандмань', 'Эрдэнэбүрэн'],
  'Хөвсгөл': ['Алаг-Эрдэнэ', 'Арбулаг', 'Баянзүрх', 'Бүрэнтогтох', 'Галт', 'Жаргалант', 'Их-Уул', 'Мөрөн', 'Рашаант', 'Ренчинлхүмбэ', 'Тариалан', 'Тосонцэнгэл', 'Төмөрбулаг', 'Түнэл', 'Улаан-Уул', 'Ханх', 'Цагааннуур', 'Цагаан-Уул', 'Цагаан-Үүр', 'Цэцэрлэг', 'Чандмань-Өндөр', 'Шинэ-Идэр', 'Эрдэнэбулган'],
  'Хэнтий': ['Батноров', 'Батширээт', 'Баян-Адарга', 'Баянмөнх', 'Баян-Овоо', 'Баянхутаг', 'Биндэр', 'Бор-Өндөр', 'Галшар', 'Дархан', 'Дадал', 'Дэлгэрхаан', 'Жаргалтхаан', 'Мөрөн', 'Норовлин', 'Өмнөдэлгэр', 'Хэрлэн', 'Цэнхэрмандал'],
};

const getListFromResponse = (result) => {
  const response = result?.data ?? result;
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.surguuli)) return response.surguuli;
  if (Array.isArray(response?.schools)) return response.schools;
  if (Array.isArray(response?.buleg)) return response.buleg;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getItemId = (item) =>
  String(item?._id || item?.id || item?.value || item?.ner || item?.name || item || '').trim();

const getItemLabel = (item) =>
  String(item?.ner || item?.name || item?.label || item?.title || item || '').trim();

const getSchoolSoum = (school) =>
  normalizeText(
    school?.soum ||
      school?.duureg ||
      school?.district ||
      school?.sum ||
      school?.location?.soum ||
      school?.location?.district
  );

function OptionButton({ label, selected, disabled = false, onPress }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`mb-2 rounded-2xl border px-4 py-3 ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-line bg-slate-50'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-sm font-bold ${selected ? 'text-brand-700' : 'text-slate-800'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DropdownSection({
  title,
  value,
  placeholder,
  options,
  open,
  onToggle,
  onSelect,
  disabled = false,
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700">{title}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={value ? title + ': ' + value : title}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={onToggle}
        className={`rounded-2xl border border-line bg-slate-50 px-4 py-4 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <View className="flex-row items-center justify-between gap-2">
          <Text className={`flex-1 text-base font-semibold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {value || placeholder}
          </Text>
          <Text className="text-base font-bold text-slate-500">{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {open && (
        <View className="mt-2 rounded-2xl border border-line bg-white p-2">
          {options.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={value === option}
              onPress={() => onSelect(option)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [schoolError, setSchoolError] = useState('');
  const [bulegError, setBulegError] = useState('');
  const schoolRequest = useRef(null);
  const groupRequest = useRef(null);
  useEffect(() => () => {
    schoolRequest.current?.abort();
    groupRequest.current?.abort();
  }, []);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [bulegLoading, setBulegLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [bulegList, setBulegList] = useState([]);
  const [openPicker, setOpenPicker] = useState(null);

  const [form, setForm] = useState({
    image: 'no image',
    lastname: '',
    firstname: '',
    gender: '',
    regnum: '',
    phone1: '',
    phone2: '',
    social1: '',
    social2: '',
    email: '',
    password: '',
    city: '',
    soum: '',
    surguuli: '',
    angi: '',
    buleg: '',
    onTugsult: '',
    role: 'suragch',
  });

  const aimagList = useMemo(() => Object.keys(LOCATION_OPTIONS), []);
  const soumList = form.city ? LOCATION_OPTIONS[form.city] || [] : [];
  const visibleSchools = useMemo(() => {
    const selectedSoum = normalizeText(form.soum);

    if (!selectedSoum) return schools;

    return schools.filter((school) => !getSchoolSoum(school) || getSchoolSoum(school) === selectedSoum);
  }, [form.soum, schools]);

  const setField = (key, value) => {
    setStatus(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const loadBulegList = async (schoolId) => {
    if (!schoolId) return;
    groupRequest.current?.abort();
    const controller = new AbortController();
    groupRequest.current = controller;

    try {
      setBulegLoading(true);
      setBulegError('');
      const response = await API.getBulegListBySchoolId(schoolId, null, controller.signal);
      if (controller.signal.aborted) return;
      setBulegList(getListFromResponse(response));
    } catch (error) {
      if (controller.signal.aborted) return;
      setBulegList([]);
      setBulegError(error?.message || 'Бүлгийн жагсаалт авахад алдаа гарлаа.');
    } finally {
      if (!controller.signal.aborted) setBulegLoading(false);
    }
  };

  const loadSchools = async (city, soum) => {
    schoolRequest.current?.abort();
    const controller = new AbortController();
    schoolRequest.current = controller;
    try {
      setSchoolLoading(true);
      setSchoolError('');
      const response = await API.findSchoolsByProvince(city, soum, null, controller.signal);
      if (controller.signal.aborted) return;
      const foundSchools = getListFromResponse(response);
      setSchools(foundSchools);

    } catch (error) {
      if (controller.signal.aborted) return;
      setSchools([]);
      setSchoolError(error?.message || 'Сургууль хайхад алдаа гарлаа.');
    } finally {
      if (!controller.signal.aborted) setSchoolLoading(false);
    }
  };

  const handleSelectAimag = (aimag) => {
    setStatus(null);
    setSchoolError('');
    setBulegError('');
    schoolRequest.current?.abort();
    groupRequest.current?.abort();
    setSchoolLoading(false);
    setBulegLoading(false);
    setForm((prev) => ({
      ...prev,
      city: aimag,
      soum: '',
      surguuli: '',
      buleg: '',
    }));
    setSchools([]);
    setBulegList([]);
    setOpenPicker(null);
  };

  const handleSelectSoum = async (soum) => {
    setStatus(null);
    setBulegError('');
    groupRequest.current?.abort();
    setBulegLoading(false);
    setSchools([]);
    setForm((prev) => ({
      ...prev,
      soum,
      surguuli: '',
      buleg: '',
    }));
    setBulegList([]);
    setOpenPicker(null);
    await loadSchools(form.city, soum);
  };

  const handleSelectSchool = async (school) => {
    setStatus(null);
    const schoolId = getItemId(school);

    setForm((prev) => ({
      ...prev,
      surguuli: schoolId,
      buleg: '',
    }));
    setBulegList([]);
    await loadBulegList(schoolId);
  };

  const handleSelectBuleg = (buleg) => {
    setField('buleg', getItemId(buleg));
  };

  const handleRegister = async () => {
    if (loading || status?.success) return;
    if (!form.lastname.trim() || !form.firstname.trim()) {
      setStatus({ message: 'Овог нэрээ оруулна уу.' });
      return;
    }

    if (!validateEmail(form.email.trim())) {
      setStatus({ message: 'Зөв и-мэйл оруулна уу.' });
      return;
    }

    if (form.password.trim().length < 6) {
      setStatus({ message: 'Нууц үг хамгийн багадаа 6 тэмдэгт байна.' });
      return;
    }

    if (!form.city.trim()) {
      setStatus({ message: 'Аймаг / хотоо сонгоно уу.' });
      return;
    }

    if (!form.soum.trim()) {
      setStatus({ message: 'Сум / дүүргээ сонгоно уу.' });
      return;
    }

    if (!form.surguuli.trim()) {
      setStatus({ message: 'Сургуулиа сонгоно уу.' });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);
      await register({
        ...form,
        lastname: form.lastname.trim(),
        firstname: form.firstname.trim(),
        gender: form.gender.trim(),
        regnum: form.regnum.trim(),
        phone1: form.phone1.trim(),
        phone2: form.phone2.trim(),
        social1: form.social1.trim(),
        social2: form.social2.trim(),
        email: form.email.trim(),
        password: form.password,
        city: form.city.trim(),
        soum: form.soum.trim(),
        surguuli: form.surguuli.trim(),
        angi: form.angi.trim(),
        buleg: form.buleg.trim(),
        onTugsult: form.onTugsult.trim(),
        role: 'suragch',
      });

      setStatus({ success: true, message: 'Бүртгэл үүслээ. Имэйлээр ирсэн баталгаажуулах кодоо шалгана уу.' });
    } catch (error) {
      setStatus({ message: error?.message || 'Бүртгэл амжилтгүй боллоо.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <View className="mx-auto w-full max-w-[620px] rounded-[26px] border border-line bg-white p-4 shadow-card">
        <PageIntro title="Сурагчийн бүртгэл" icon="person-add-outline" />
        <FormInput editable={!loading && !status?.success} label="Овог" value={form.lastname} onChangeText={(v) => setField('lastname', v)} placeholder="Овог" />
        <FormInput editable={!loading && !status?.success} label="Нэр" value={form.firstname} onChangeText={(v) => setField('firstname', v)} placeholder="Нэр" />
        <FormInput editable={!loading && !status?.success} label="Хүйс" value={form.gender} onChangeText={(v) => setField('gender', v)} placeholder="Эрэгтэй / Эмэгтэй" />
        <FormInput editable={!loading && !status?.success} label="Регистр" value={form.regnum} onChangeText={(v) => setField('regnum', v)} placeholder="ПД50321016" autoCapitalize="characters" />
        <FormInput editable={!loading && !status?.success} label="Утас 1" value={form.phone1} onChangeText={(v) => setField('phone1', v)} placeholder="90100689" keyboardType="phone-pad" />
        <FormInput editable={!loading && !status?.success} label="Утас 2" value={form.phone2} onChangeText={(v) => setField('phone2', v)} placeholder="88439911" keyboardType="phone-pad" />
        <FormInput editable={!loading && !status?.success} label="Facebook" value={form.social1} onChangeText={(v) => setField('social1', v)} placeholder="Facebook нэр" />
        <FormInput editable={!loading && !status?.success} label="Instagram" value={form.social2} onChangeText={(v) => setField('social2', v)} placeholder="Instagram нэр" />
        <FormInput editable={!loading && !status?.success} label="Имэйл хаяг" autoComplete="email" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput editable={!loading && !status?.success} label="Нууц үг" autoComplete="new-password" value={form.password} onChangeText={(v) => setField('password', v)} placeholder="******" secureTextEntry autoCapitalize="none" />

        <Text accessibilityRole="header" className="mb-3 mt-2 text-lg font-extrabold text-slate-900">Сургуулийн мэдээлэл</Text>
        <DropdownSection title="Аймаг / Хот" value={form.city} placeholder="Аймаг / хот сонгох"
          options={aimagList} open={openPicker === 'city'} onToggle={() => setOpenPicker(openPicker === 'city' ? null : 'city')}
          onSelect={handleSelectAimag} disabled={loading || status?.success} />
        <DropdownSection title="Сум / Дүүрэг" value={form.soum} placeholder="Сум / дүүрэг сонгох"
          options={soumList} open={openPicker === 'soum'} onToggle={() => setOpenPicker(openPicker === 'soum' ? null : 'soum')}
          onSelect={handleSelectSoum} disabled={!form.city || loading || status?.success} />

        {!!form.soum && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-slate-700">
              Сургууль {schoolLoading ? '(ачаалж байна…)' : ''}
            </Text>

            {visibleSchools.map((school, index) => {
              const schoolId = getItemId(school);
              const schoolName = getItemLabel(school);
              const selected = form.surguuli === schoolId;

              return (
                <TouchableOpacity
                  key={`${schoolId}-${index}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={loading || status?.success}
                  onPress={() => handleSelectSchool(school)}
                  className={`mb-2 rounded-2xl border px-4 py-3 ${
                    selected ? 'border-brand-600 bg-brand-50' : 'border-line bg-slate-50'
                  }`}
                >
                  <Text className={`font-bold ${selected ? 'text-brand-700' : 'text-slate-900'}`}>
                    {schoolName || 'Нэргүй сургууль'}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {schoolError ? (
              <CollectionState state="error" title="Сургууль ачаалж чадсангүй" detail={schoolError}
                action={() => loadSchools(form.city, form.soum)} />
            ) : !schoolLoading && !visibleSchools.length ? (
              <Text className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Сонгосон сум / дүүрэгт сургууль олдсонгүй.
              </Text>
            ) : null}
          </View>
        )}

        <FormInput editable={!loading && !status?.success} label="Анги" value={form.angi} onChangeText={(v) => setField('angi', v)} placeholder="12" />
        <FormInput editable={!loading && !status?.success} label="Бүлэг" value={form.buleg} onChangeText={(v) => setField('buleg', v)} placeholder={bulegLoading ? 'Уншиж байна...' : 'A'} />

        {!!bulegError && <CollectionState state="error" title="Бүлэг ачаалж чадсангүй" detail={bulegError}
          action={() => loadBulegList(form.surguuli)} />}
        {bulegList.map((buleg, index) => {
          const bulegId = getItemId(buleg);
          const bulegName = getItemLabel(buleg);
          const selected = form.buleg === bulegId;

          return (
            <TouchableOpacity
              key={`${bulegId}-${index}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={loading || status?.success}
              onPress={() => handleSelectBuleg(buleg)}
              className={`mt-2 rounded-2xl border px-4 py-3 ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-line bg-slate-50'
              }`}
            >
              <Text className={`font-bold ${selected ? 'text-brand-700' : 'text-slate-900'}`}>
                {bulegName || bulegId}
              </Text>
            </TouchableOpacity>
          );
        })}

        <FormInput editable={!loading && !status?.success} label="Төгсөлт" value={form.onTugsult} onChangeText={(v) => setField('onTugsult', v)} placeholder="2026" />

        <InlineNotice message={status?.message} success={status?.success} />
        {status?.success ? (
          <CustomButton title="Имэйл баталгаажуулах" onPress={() => navigation.replace('Verification')} />
        ) : (
          <CustomButton title="Бүртгүүлэх" onPress={handleRegister} loading={loading} />
        )}

        <TouchableOpacity accessibilityRole="button" className="mt-3 min-h-[44px] items-center justify-center" onPress={() => navigation.popTo('Login')}>
          <Text className="text-sm font-bold text-brand-600">Нэвтрэх хуудас руу буцах</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
