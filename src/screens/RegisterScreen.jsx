import React, { useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CustomButton from '../components/CustomButton';
import FormInput from '../components/FormInput';
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

const getListFromResponse = (response) => {
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
      disabled={disabled}
      onPress={onPress}
      className={`mb-2 rounded-2xl border px-4 py-3 ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-slate-50'
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
        disabled={disabled}
        onPress={onToggle}
        className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <View className="flex-row items-center justify-between">
          <Text className={`text-base font-semibold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
            {value || placeholder}
          </Text>
          <Text className="text-base font-bold text-slate-500">{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {open && (
        <View className="mt-2 rounded-2xl border border-slate-200 bg-white p-2">
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

function OptionSection({ title, children }) {
  const [open, setOpen] = useState(false);
  const options = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      onPress: async () => {
        await child.props.onPress?.();
        setOpen(false);
      },
    });
  });

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-slate-700">{title}</Text>
      <TouchableOpacity
        onPress={() => setOpen((current) => !current)}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-slate-600">
            {open ? 'Сонголтуудыг хаах' : 'Сонгох'}
          </Text>
          <Text className="text-base font-bold text-slate-500">{open ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {open && <View className="mt-2 rounded-2xl border border-slate-200 bg-white p-2">{options}</View>}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [bulegLoading, setBulegLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [bulegList, setBulegList] = useState([]);
  const [selectedSchoolName, setSelectedSchoolName] = useState('');
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

    const matched = schools.filter((school) => getSchoolSoum(school) === selectedSoum);
    return matched.length ? matched : schools;
  }, [form.soum, schools]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const loadBulegList = async (schoolId) => {
    if (!schoolId) return;

    try {
      setBulegLoading(true);
      const response = await API.getBulegListBySchoolId(schoolId);
      setBulegList(getListFromResponse(response));
    } catch (error) {
      setBulegList([]);
      Alert.alert('Алдаа', error?.message || 'Бүлгийн жагсаалт авахад алдаа гарлаа');
    } finally {
      setBulegLoading(false);
    }
  };

  const loadSchools = async (city, soum) => {
    try {
      setSchoolLoading(true);
      const response = await API.findSchoolsByProvince(city, soum);
      const foundSchools = getListFromResponse(response);
      setSchools(foundSchools);

      if (!foundSchools.length) {
        Alert.alert('Мэдээлэл', 'Сонгосон байршилд сургууль олдсонгүй');
      }
    } catch (error) {
      setSchools([]);
      Alert.alert('Алдаа', error?.message || 'Сургууль хайхад алдаа гарлаа');
    } finally {
      setSchoolLoading(false);
    }
  };

  const handleSelectAimag = (aimag) => {
    setForm((prev) => ({
      ...prev,
      city: aimag,
      soum: '',
      surguuli: '',
      buleg: '',
    }));
    setSchools([]);
    setSelectedSchoolName('');
    setBulegList([]);
    setOpenPicker(null);
  };

  const handleSelectSoum = async (soum) => {
    setForm((prev) => ({
      ...prev,
      soum,
      surguuli: '',
      buleg: '',
    }));
    setSelectedSchoolName('');
    setBulegList([]);
    setOpenPicker(null);
    await loadSchools(form.city, soum);
  };

  const handleSelectSchool = async (school) => {
    const schoolId = getItemId(school);
    const schoolName = getItemLabel(school);

    setForm((prev) => ({
      ...prev,
      surguuli: schoolId,
      buleg: '',
    }));
    setSelectedSchoolName(schoolName);
    setBulegList([]);
    await loadBulegList(schoolId);
  };

  const handleSelectBuleg = (buleg) => {
    setField('buleg', getItemId(buleg));
  };

  const handleRegister = async () => {
    if (!form.lastname.trim() || !form.firstname.trim()) {
      Alert.alert('Анхаар', 'Овог нэрээ оруулна уу');
      return;
    }

    if (!validateEmail(form.email.trim())) {
      Alert.alert('Анхаар', 'Зөв и-мэйл оруулна уу');
      return;
    }

    if (form.password.trim().length < 6) {
      Alert.alert('Анхаар', 'Нууц үг хамгийн багадаа 6 тэмдэгт байна');
      return;
    }

    if (!form.city.trim()) {
      Alert.alert('Анхаар', 'Аймаг / хотоо сонгоно уу');
      return;
    }

    if (!form.soum.trim()) {
      Alert.alert('Анхаар', 'Сум / дүүргээ сонгоно уу');
      return;
    }

    if (!form.surguuli.trim()) {
      Alert.alert('Анхаар', 'Сургуулиа сонгоно уу');
      return;
    }

    try {
      setLoading(true);
      const response = await register({
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
        password: form.password.trim(),
        city: form.city.trim(),
        soum: form.soum.trim(),
        surguuli: form.surguuli.trim(),
        angi: form.angi.trim(),
        buleg: form.buleg.trim(),
        onTugsult: form.onTugsult.trim(),
        role: 'suragch',
      });

      Alert.alert('Амжилттай', response?.message || 'Бүртгэл амжилттай үүслээ', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Алдаа', error?.message || 'Бүртгэл амжилтгүй боллоо');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scroll>
      <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
        <Text className="text-center text-3xl font-extrabold text-slate-900">Бүртгүүлэх</Text>
        <Text className="mt-2 mb-5 text-center text-sm text-slate-500">
          Аймаг, сум, сургуулиа дарааллаар нь сонгоод бүртгэлээ үүсгэнэ үү.
        </Text>

        <FormInput label="Овог" value={form.lastname} onChangeText={(v) => setField('lastname', v)} placeholder="Овог" />
        <FormInput label="Нэр" value={form.firstname} onChangeText={(v) => setField('firstname', v)} placeholder="Нэр" />
        <FormInput label="Хүйс" value={form.gender} onChangeText={(v) => setField('gender', v)} placeholder="Эрэгтэй / Эмэгтэй" />
        <FormInput label="Регистр" value={form.regnum} onChangeText={(v) => setField('regnum', v)} placeholder="ПД50321016" autoCapitalize="characters" />
        <FormInput label="Утас 1" value={form.phone1} onChangeText={(v) => setField('phone1', v)} placeholder="90100689" keyboardType="phone-pad" />
        <FormInput label="Утас 2" value={form.phone2} onChangeText={(v) => setField('phone2', v)} placeholder="88439911" keyboardType="phone-pad" />
        <FormInput label="Social 1" value={form.social1} onChangeText={(v) => setField('social1', v)} placeholder="Facebook нэр" />
        <FormInput label="Social 2" value={form.social2} onChangeText={(v) => setField('social2', v)} placeholder="Instagram нэр" />
        <FormInput label="И-мэйл" value={form.email} onChangeText={(v) => setField('email', v)} placeholder="example@gmail.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput label="Нууц үг" value={form.password} onChangeText={(v) => setField('password', v)} placeholder="******" secureTextEntry autoCapitalize="none" />

        <OptionSection title="Аймаг / Хот">
          {aimagList.map((aimag) => (
            <OptionButton
              key={aimag}
              label={aimag}
              selected={form.city === aimag}
              onPress={() => handleSelectAimag(aimag)}
            />
          ))}
        </OptionSection>

        {!!form.city && (
          <OptionSection title="Сум / Дүүрэг">
            {soumList.map((soum) => (
              <OptionButton
                key={soum}
                label={soum}
                selected={form.soum === soum}
                onPress={() => handleSelectSoum(soum)}
              />
            ))}
          </OptionSection>
        )}

        {!!form.soum && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-slate-700">
              Сургууль {schoolLoading ? '(уншиж байна...)' : ''}
            </Text>

            {visibleSchools.map((school, index) => {
              const schoolId = getItemId(school);
              const schoolName = getItemLabel(school);
              const selected = form.surguuli === schoolId;

              return (
                <TouchableOpacity
                  key={`${schoolId}-${index}`}
                  onPress={() => handleSelectSchool(school)}
                  className={`mb-2 rounded-2xl border px-4 py-3 ${
                    selected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Text className={`font-bold ${selected ? 'text-brand-700' : 'text-slate-900'}`}>
                    {schoolName || 'Нэргүй сургууль'}
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500">{schoolId}</Text>
                </TouchableOpacity>
              );
            })}

            {!schoolLoading && !visibleSchools.length && (
              <Text className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Сонгосон сум / дүүрэгт сургууль олдсонгүй.
              </Text>
            )}
          </View>
        )}

        {!!selectedSchoolName && (
          <Text className="mb-4 text-sm font-semibold text-brand-700">
            Сонгосон сургууль: {selectedSchoolName}
          </Text>
        )}

        <FormInput label="Анги" value={form.angi} onChangeText={(v) => setField('angi', v)} placeholder="12" />
        <FormInput label="Бүлэг" value={form.buleg} onChangeText={(v) => setField('buleg', v)} placeholder={bulegLoading ? 'Уншиж байна...' : 'A'} />

        {bulegList.map((buleg, index) => {
          const bulegId = getItemId(buleg);
          const bulegName = getItemLabel(buleg);
          const selected = form.buleg === bulegId;

          return (
            <TouchableOpacity
              key={`${bulegId}-${index}`}
              onPress={() => handleSelectBuleg(buleg)}
              className={`mt-2 rounded-2xl border px-4 py-3 ${
                selected ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <Text className={`font-bold ${selected ? 'text-brand-700' : 'text-slate-900'}`}>
                {bulegName || bulegId}
              </Text>
            </TouchableOpacity>
          );
        })}

        <FormInput label="Төгсөлт" value={form.onTugsult} onChangeText={(v) => setField('onTugsult', v)} placeholder="2026" />

        <CustomButton title="Бүртгүүлэх" onPress={handleRegister} loading={loading} />

        <TouchableOpacity className="mt-4 items-center" onPress={() => navigation.navigate('Login')}>
          <Text className="text-sm font-bold text-brand-600">Нэвтрэх хуудас руу буцах</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
