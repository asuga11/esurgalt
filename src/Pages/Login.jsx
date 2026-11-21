import { uploadBaseUrl } from "../config";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useContext, useMemo, useState } from "react";
import MainContext from "../Context/MainContext";
import { Link } from "react-router-dom";
import {
  XMarkIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

/* ------------------------------------------------------------------ */
/* Тогтмол утгууд                                                      */
/* ------------------------------------------------------------------ */

const IMG_BASE = `${uploadBaseUrl}/programfiles/`;
const ROLE_IMAGES = {
  Оюутан: "es_student.jpg",
  Сурагч: "es_suragch.jpg",
  Багш: "es_bagsh.jpg",
  Сургууль: "es_surguuli.jpg",
  "Их сургуулийн багш": "es_bagsh.jpg",
  Удирдлага: "es_education.jpg",
  Админ: "es_admin.jpg",
};

const BULEG = ["12", "11", "10"].flatMap((grade) =>
  ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж"].map((l) => `${grade}${l}`)
);

const STEPS = ["Хувийн мэдээлэл", "Нэвтрэх мэдээлэл", "Сургууль"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REG_RE = /^[А-ЯӨҮЁ]{2}\d{8}$/;

/* ------------------------------------------------------------------ */
/* Жижиг туслах компонентууд                                           */
/* (Login-ийн гадна тодорхойлсон тул бичих үед input focus алдагдахгүй) */
/* ------------------------------------------------------------------ */

const base =
  "w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-white";
const okBorder =
  "border-slate-200 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:focus:ring-blue-500/20";
const errBorder =
  "border-rose-400 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500/70 dark:focus:ring-rose-500/20";

const inputCls = (error, extra = "") =>
  `${base} ${error ? errBorder : okBorder} ${extra}`;

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 018-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

function Field({ id, label, error, hint, className = "", children }) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          <ExclamationCircleIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function IconInput({ icon: Icon, error, id, right, className = "", ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputCls(error, `pl-12 ${right ? "pr-12" : ""} ${className}`)}
        {...props}
      />
      {right}
    </div>
  );
}

function PasswordInput({ id, error, value, onChange, autoComplete, ...rest }) {
  const [show, setShow] = useState(false);
  return (
    <IconInput
      id={id}
      icon={LockClosedIcon}
      error={error}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      right={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Нууц үг нуух" : "Нууц үг харуулах"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-white"
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      }
      {...rest}
    />
  );
}

function PasswordStrength({ value }) {
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 6) s++;
    if (value.length >= 8) s++;
    if (/[A-ZА-Я]/.test(value) && /[a-zа-я]/.test(value)) s++;
    if (/\d/.test(value) && /[^A-Za-zА-Яа-я0-9]/.test(value)) s++;
    return s;
  }, [value]);

  if (!value) return null;
  const labels = ["Сул", "Дунд", "Сайн", "Маш сайн"];
  const colors = ["bg-rose-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];
  const idx = Math.max(0, score - 1);

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? colors[idx] : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Нууц үгийн хүч: {labels[idx]}
      </p>
    </div>
  );
}

function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Бүртгэлийн алхамууд">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            className="flex min-w-0 flex-1 flex-col gap-1.5"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={`h-1.5 rounded-full transition-colors ${
                done || active ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
            <span
              className={`flex items-center gap-1 truncate text-xs font-semibold ${
                active
                  ? "text-blue-700 dark:text-blue-300"
                  : done
                  ? "text-slate-600 dark:text-slate-300"
                  : "text-slate-400"
              }`}
            >
              {done && <CheckIcon className="h-3.5 w-3.5 shrink-0" />}
              <span className="truncate">{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Үндсэн компонент                                                    */
/* ------------------------------------------------------------------ */

export default function Login({ setSigInOpen, role }) {
  const { login, user, signup, addressState, surguuliState, getSurguuliAimag2 } =
    useContext(MainContext);

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({ email: "", password: "" });
  const [suragch, setSuragch] = useState({});
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [aimag, setAimag] = useState("");
  const [soum, setSoum] = useState([]);
  const [imgFailed, setImgFailed] = useState(false);

  const imageUrl = IMG_BASE + (ROLE_IMAGES[role] || ROLE_IMAGES["Сурагч"]);
  const isLogin = mode === "login";

  /* ---------- helpers ---------- */

  const closeDialog = () => setSigInOpen(false);

  const clearError = (key) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const setField = (key, value) => {
    setSuragch((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const onText = (key, transform) => (e) =>
    setField(key, transform ? transform(e.target.value) : e.target.value);

  const startRegister = () => {
    setSuragch({
      role: "suragch",
      onTugsult: "2023",
      isActive: true,
      status: "Суралцаж байгаа",
    });
    setConfirm("");
    setErrors({});
    setStep(0);
    setMode("register");
  };

  const backToLogin = () => {
    setSuragch({});
    setErrors({});
    setStep(0);
    setMode("login");
  };

  /* ---------- validation ---------- */

  const validate = (which) => {
    const e = {};
    const req = (k, msg) => {
      if (!String(suragch[k] || "").trim()) e[k] = msg;
    };

    if (which === "login") {
      if (!data.email.trim()) e.loginEmail = "Имэйл хаягаа оруулна уу";
      else if (!EMAIL_RE.test(data.email.trim()))
        e.loginEmail = "Имэйл хаяг буруу байна";
      if (!data.password) e.loginPassword = "Нууц үгээ оруулна уу";
    }

    if (which === 0) {
      req("lastname", "Овгоо оруулна уу");
      req("firstname", "Нэрээ оруулна уу");
      if (!suragch.regnum) e.regnum = "Регистрийн дугаараа оруулна уу";
      else if (!REG_RE.test(suragch.regnum))
        e.regnum = "2 үсэг + 8 цифр байна. Жишээ: УБ12345678";
      req("gender", "Хүйсээ сонгоно уу");
    }

    if (which === 1) {
      if (!suragch.email) e.email = "Имэйл хаягаа оруулна уу";
      else if (!EMAIL_RE.test(suragch.email.trim()))
        e.email = "Имэйл хаяг буруу байна";
      if (!suragch.phone1) e.phone1 = "Утасны дугаараа оруулна уу";
      else if (!/^\d{8}$/.test(suragch.phone1))
        e.phone1 = "Утасны дугаар 8 оронтой байна";
      if (!suragch.password) e.password = "Нууц үгээ оруулна уу";
      else if (suragch.password.length < 6)
        e.password = "Нууц үг дор хаяж 6 тэмдэгт байна";
      if (!confirm) e.confirm = "Нууц үгээ давтаж оруулна уу";
      else if (confirm !== suragch.password)
        e.confirm = "Нууц үг таарахгүй байна";
    }

    if (which === 2) {
      req("city", "Аймаг/хотоо сонгоно уу");
      req("soum", "Сум/дүүргээ сонгоно уу");
      req("surguuli", "Сургуулиа сонгоно уу");
      req("buleg", "Бүлгээ сонгоно уу");
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- actions ---------- */

  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (loading || !validate("login")) return;
    setLoading(true);
    try {
      await Promise.resolve(login(data.email.trim(), data.password, role));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async (ev) => {
    ev.preventDefault();
    if (loading || !validate(step)) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      await Promise.resolve(
        signup({ ...suragch, email: suragch.email.trim() })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 0) backToLogin();
    else {
      setErrors({});
      setStep((s) => s - 1);
    }
  };

  const onAimagChange = (e) => {
    const value = e.target.value;
    const selected = addressState.address.find((u) => u.aimagCity === value);
    setSoum(selected?.soumDistrict || []);
    setAimag(value);
    setSuragch((prev) => ({ ...prev, city: value, soum: "", surguuli: "" }));
    setErrors((prev) => ({ ...prev, city: undefined }));
  };

  const onSoumChange = (e) => {
    const value = e.target.value;
    if (value) getSurguuliAimag2(aimag, value);
    setSuragch((prev) => ({ ...prev, soum: value, surguuli: "" }));
    setErrors((prev) => ({ ...prev, soum: undefined }));
  };

  /* ---------- render ---------- */

  const schools = surguuliState?.surguuli || [];

  return (
    <Transition appear show={!user} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeDialog}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:px-6 sm:py-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-6 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-6 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-2xl ${
                  isLogin ? "sm:max-w-4xl" : "sm:max-w-2xl"
                }`}
              >
                <button
                  type="button"
                  onClick={closeDialog}
                  aria-label="Хаах"
                  className="absolute right-3 top-3 z-30 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-800 dark:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                <div className={isLogin ? "grid lg:grid-cols-2" : "grid"}>
                  {/* ---------- Зүүн талын зураг (зөвхөн нэвтрэх, desktop) ---------- */}
                  {isLogin && (
                    <div className="relative hidden min-h-[540px] overflow-hidden bg-gradient-to-br from-blue-700 to-blue-950 lg:block">
                      {!imgFailed && (
                        <img
                          src={imageUrl}
                          alt=""
                          loading="lazy"
                          onError={() => setImgFailed(true)}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                          <AcademicCapIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-extrabold">
                          e-Сургалтын систем
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-white/85">
                          Сургалт, сорил, шалгалтын нэгдсэн цахим орчин.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ---------- НЭВТРЭХ ---------- */}
                  {isLogin ? (
                    <div className="flex min-h-[540px] flex-col justify-center px-5 py-10 sm:px-10">
                      <form
                        onSubmit={handleLogin}
                        noValidate
                        className="mx-auto w-full max-w-sm"
                      >
                        <div className="mb-7 text-center">
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                            <UserIcon className="h-7 w-7" />
                          </div>
                          <Dialog.Title className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {role} нэвтрэх
                          </Dialog.Title>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Имэйл болон нууц үгээ оруулна уу
                          </p>
                        </div>

                        <div className="space-y-4">
                          <Field
                            id="login-email"
                            label="Имэйл хаяг"
                            error={errors.loginEmail}
                          >
                            <IconInput
                              id="login-email"
                              icon={EnvelopeIcon}
                              error={errors.loginEmail}
                              autoFocus
                              autoComplete="email"
                              inputMode="email"
                              type="email"
                              placeholder="example@mail.com"
                              value={data.email}
                              onChange={(e) => {
                                setData({ ...data, email: e.target.value });
                                clearError("loginEmail");
                              }}
                            />
                          </Field>

                          <Field
                            id="login-password"
                            label="Нууц үг"
                            error={errors.loginPassword}
                          >
                            <PasswordInput
                              id="login-password"
                              error={errors.loginPassword}
                              autoComplete="current-password"
                              placeholder="Нууц үгээ оруулна уу"
                              value={data.password}
                              onChange={(e) => {
                                setData({ ...data, password: e.target.value });
                                clearError("loginPassword");
                              }}
                            />
                          </Field>

                          <div className="flex justify-end">
                            <Link
                              onClick={closeDialog}
                              to="/resetpass"
                              className="rounded text-sm font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300"
                            >
                              Нууц үг мартсан уу?
                            </Link>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {loading ? (
                              <>
                                <Spinner /> Нэвтэрч байна...
                              </>
                            ) : (
                              "Нэвтрэх"
                            )}
                          </button>

                          {role === "Сурагч" && (
                            <>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                                Шинэ хэрэглэгч үү?
                                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                              </div>
                              <button
                                type="button"
                                onClick={startRegister}
                                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-6 py-3.5 text-sm font-bold text-orange-700 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300"
                              >
                                Бүртгүүлэх
                              </button>
                            </>
                          )}
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* ---------- БҮРТГЭЛ (алхам алхмаар) ---------- */
                    <form
                      onSubmit={handleNext}
                      noValidate
                      className="flex max-h-[92vh] flex-col"
                    >
                      <div className="border-b border-slate-100 px-5 pb-4 pt-5 dark:border-slate-800 sm:px-8">
                        <button
                          type="button"
                          onClick={backToLogin}
                          className="mb-3 inline-flex items-center gap-2 rounded text-sm font-semibold text-slate-500 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300"
                        >
                          <ArrowLeftIcon className="h-4 w-4" />
                          Нэвтрэх хэсэг рүү буцах
                        </button>
                        <Dialog.Title className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                          Сурагчаар бүртгүүлэх
                        </Dialog.Title>
                        <p className="mb-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Алхам {step + 1} / {STEPS.length} · Мэдээллээ үнэн зөв
                          бөглөнө үү
                        </p>
                        <Stepper current={step} />
                      </div>

                      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                        {/* Алхам 1 */}
                        {step === 0 && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field id="lastname" label="Овог" error={errors.lastname}>
                              <input
                                id="lastname"
                                autoFocus
                                autoComplete="family-name"
                                value={suragch.lastname || ""}
                                onChange={onText("lastname")}
                                className={inputCls(errors.lastname)}
                                aria-invalid={!!errors.lastname}
                              />
                            </Field>
                            <Field id="firstname" label="Нэр" error={errors.firstname}>
                              <input
                                id="firstname"
                                autoComplete="given-name"
                                value={suragch.firstname || ""}
                                onChange={onText("firstname")}
                                className={inputCls(errors.firstname)}
                                aria-invalid={!!errors.firstname}
                              />
                            </Field>
                            <Field
                              id="regnum"
                              label="Регистрийн дугаар"
                              error={errors.regnum}
                              hint="Жишээ: УБ12345678"
                            >
                              <input
                                id="regnum"
                                maxLength={10}
                                autoCapitalize="characters"
                                value={suragch.regnum || ""}
                                onChange={onText("regnum", (v) =>
                                  v.toUpperCase().replace(/\s/g, "")
                                )}
                                className={inputCls(errors.regnum)}
                                aria-invalid={!!errors.regnum}
                              />
                            </Field>
                            <Field id="gender" label="Хүйс" error={errors.gender}>
                              <select
                                id="gender"
                                value={suragch.gender || ""}
                                onChange={onText("gender")}
                                className={inputCls(errors.gender)}
                                aria-invalid={!!errors.gender}
                              >
                                <option value="">Сонгох</option>
                                <option value="Эрэгтэй">Эрэгтэй</option>
                                <option value="Эмэгтэй">Эмэгтэй</option>
                              </select>
                            </Field>
                          </div>
                        )}

                        {/* Алхам 2 */}
                        {step === 1 && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field
                              id="email"
                              label="Имэйл хаяг"
                              error={errors.email}
                              hint="Нэвтрэх үедээ энэ хаягийг ашиглана"
                              className="sm:col-span-2"
                            >
                              <IconInput
                                id="email"
                                icon={EnvelopeIcon}
                                error={errors.email}
                                autoFocus
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="example@mail.com"
                                value={suragch.email || ""}
                                onChange={onText("email")}
                              />
                            </Field>

                            <Field
                              id="phone1"
                              label="Утасны дугаар"
                              error={errors.phone1}
                              className="sm:col-span-2"
                            >
                              <IconInput
                                id="phone1"
                                icon={PhoneIcon}
                                error={errors.phone1}
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                maxLength={8}
                                placeholder="99112233"
                                value={suragch.phone1 || ""}
                                onChange={onText("phone1", (v) =>
                                  v.replace(/\D/g, "").slice(0, 8)
                                )}
                              />
                            </Field>

                            <Field
                              id="password"
                              label="Нууц үг"
                              error={errors.password}
                              hint="Дор хаяж 6 тэмдэгт"
                            >
                              <PasswordInput
                                id="password"
                                error={errors.password}
                                autoComplete="new-password"
                                value={suragch.password || ""}
                                onChange={onText("password")}
                              />
                              <PasswordStrength value={suragch.password || ""} />
                            </Field>

                            <Field
                              id="confirm"
                              label="Нууц үг давтах"
                              error={errors.confirm}
                            >
                              <PasswordInput
                                id="confirm"
                                error={errors.confirm}
                                autoComplete="new-password"
                                value={confirm}
                                onChange={(e) => {
                                  setConfirm(e.target.value);
                                  clearError("confirm");
                                }}
                              />
                            </Field>
                          </div>
                        )}

                        {/* Алхам 3 */}
                        {step === 2 && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field id="city" label="Аймаг / Хот" error={errors.city}>
                              <select
                                id="city"
                                autoFocus
                                value={suragch.city || ""}
                                onChange={onAimagChange}
                                className={inputCls(errors.city)}
                                aria-invalid={!!errors.city}
                              >
                                <option value="">Сонгох</option>
                                {addressState.address.map((el) => (
                                  <option key={el.aimagCity} value={el.aimagCity}>
                                    {el.aimagCity}
                                  </option>
                                ))}
                              </select>
                            </Field>

                            <Field
                              id="soum"
                              label="Сум / Дүүрэг"
                              error={errors.soum}
                              hint={!suragch.city ? "Эхлээд аймаг/хотоо сонгоно уу" : undefined}
                            >
                              <select
                                id="soum"
                                disabled={!suragch.city}
                                value={suragch.soum || ""}
                                onChange={onSoumChange}
                                className={inputCls(errors.soum)}
                                aria-invalid={!!errors.soum}
                              >
                                <option value="">Сонгох</option>
                                {soum.map((el) => (
                                  <option key={el.name} value={el.name}>
                                    {el.name}
                                  </option>
                                ))}
                              </select>
                            </Field>

                            <Field
                              id="surguuli"
                              label="Сургууль"
                              error={errors.surguuli}
                              hint={
                                !suragch.soum
                                  ? "Эхлээд сум/дүүргээ сонгоно уу"
                                  : schools.length === 0
                                  ? "Энэ сум/дүүрэгт бүртгэлтэй сургууль олдсонгүй"
                                  : undefined
                              }
                              className="sm:col-span-2"
                            >
                              <select
                                id="surguuli"
                                disabled={!suragch.soum || schools.length === 0}
                                value={suragch.surguuli || ""}
                                onChange={onText("surguuli")}
                                className={inputCls(errors.surguuli)}
                                aria-invalid={!!errors.surguuli}
                              >
                                <option value="">Сонгох</option>
                                {suragch.soum &&
                                  schools.map((el) => (
                                    <option key={el._id} value={el._id}>
                                      {el.ner}
                                    </option>
                                  ))}
                              </select>
                            </Field>

                            <Field id="buleg" label="Бүлэг" error={errors.buleg}>
                              <select
                                id="buleg"
                                value={suragch.buleg || ""}
                                onChange={onText("buleg")}
                                className={inputCls(errors.buleg)}
                                aria-invalid={!!errors.buleg}
                              >
                                <option value="">Сонгох</option>
                                {BULEG.map((el) => (
                                  <option key={el} value={el}>
                                    {el}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-between sm:px-8">
                        <button
                          type="button"
                          onClick={handleBack}
                          disabled={loading}
                          className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {step === 0 ? "Цуцлах" : "Өмнөх"}
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className={`flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${
                            step === STEPS.length - 1
                              ? "bg-orange-600 shadow-orange-600/20 hover:bg-orange-700 focus-visible:ring-orange-200"
                              : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700 focus-visible:ring-blue-300"
                          }`}
                        >
                          {loading ? (
                            <>
                              <Spinner /> Бүртгэж байна...
                            </>
                          ) : step === STEPS.length - 1 ? (
                            "Бүртгүүлэх"
                          ) : (
                            "Үргэлжлүүлэх"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}