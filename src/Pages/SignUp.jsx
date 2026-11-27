import { useContext, useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  AcademicCapIcon,
  ArrowRightEndOnRectangleIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CheckIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
  PresentationChartBarIcon,
  ShieldCheckIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import MainContext from "../Context/MainContext";
import campusPhoto from "../assets/hero-alsiin.jpg";
import logo from "../assets/esurgalt-logo.png";

const roles = [
  { label: "Сурагч", icon: BookOpenIcon },
  { label: "Оюутан", icon: AcademicCapIcon },
  { label: "Багш", icon: PresentationChartBarIcon },
  { label: "Сургууль", icon: BuildingOffice2Icon },
  { label: "Их сургуулийн багш", icon: BuildingLibraryIcon, wide: true },
  { label: "Удирдлага", icon: UserIcon },
  { label: "Админ", icon: ShieldCheckIcon },
];

function RolePicker({ role, onChange, pending }) {
  return (
    <fieldset disabled={pending} className="min-w-0">
      <legend className="mb-2 text-sm font-extrabold">Хэрэглэгчийн төрөл</legend>
      <div className="grid grid-cols-2 gap-1.5 min-[390px]:grid-cols-3 sm:grid-cols-4 sm:gap-2">
        {roles.map(({ label, icon: Icon, wide }) => (
          <label key={label} className={wide ? "relative col-span-2 min-w-0" : "relative min-w-0"}>
            <input
              type="radio"
              name="user-role"
              value={label}
              checked={role === label}
              onChange={() => onChange(label)}
              className="peer sr-only"
            />
            <span className="flex h-full min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-2.5 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-orange-400 peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-900 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 sm:min-h-17 sm:flex-col sm:gap-1.5 sm:px-2 sm:text-center dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:peer-checked:border-orange-500/80 dark:peer-checked:bg-orange-950/60 dark:peer-checked:text-orange-200">
              <Icon aria-hidden="true" className="size-[1.125rem] shrink-0 sm:size-5" />
              <span className="min-w-0 leading-tight [overflow-wrap:anywhere]">{label}</span>
              {role === label && <CheckIcon aria-hidden="true" className="absolute top-2 right-2 hidden size-3.5 sm:block" />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SignInPhoto() {
  return (
    <figure className="relative isolate h-[clamp(5.25rem,16svh,11rem)] min-w-0 overflow-hidden bg-slate-900 lg:sticky lg:top-[calc(4rem+1px)] lg:h-[calc(100dvh-4rem-1px)]">
      <img
        src={campusPhoto}
        alt="МУИС-ийн Баруун бүсийн сургуулийн барилга"
        width={1455}
        height={965}
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 -z-20 size-full scale-105 object-cover object-[50%_58%] lg:origin-bottom lg:scale-[1.41] lg:object-center"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[12px] [mask-image:linear-gradient(to_top,black_8%,transparent_78%)] lg:backdrop-blur-[18px]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-slate-950/25" />
      <figcaption className="absolute inset-x-0 bottom-0 grid justify-items-start gap-1 px-5 pb-6 text-sm font-bold text-white sm:px-8 lg:gap-2.5 lg:px-10 lg:pb-10 lg:text-xl xl:px-14">
        <img
          src={logo}
          alt="e-Surgalt"
          width={1511}
          height={362}
          className="h-auto w-32 drop-shadow-[0_2px_5px_rgba(2,6,23,0.65)] sm:w-40 lg:w-56"
        />
        <span>МУИС · Баруун бүсийн сургууль</span>
      </figcaption>
    </figure>
  );
}

const createStudentDraft = () => ({
  role: "suragch",
  lastname: "",
  firstname: "",
  regnum: "",
  gender: "",
  email: "",
  password: "",
  phone1: "",
  city: "",
  soum: "",
  surguuli: "",
  buleg: "",
  onTugsult: "2023",
  isActive: true,
  status: "Суралцаж байгаа",
});

const SignUp = () => {
  const {
    login,
    signup,
    addressState,
    surguuliState,
    getSurguuliAimag2,
  } = useContext(MainContext);

  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [suragch, setSuragch] = useState(createStudentDraft);
  const [role, setRole] = useState("Сурагч");
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const isUniversityStudent = role === "Оюутан";
  const isUniversityTeacher = role === "Их сургуулийн багш";
  const identifierType = isUniversityStudent || isUniversityTeacher ? "text" : "email";
  const identifierLabel = isUniversityTeacher ? "Утасны дугаар эсвэл имэйл" : isUniversityStudent ? "Нэвтрэх нэр" : "Имэйл хаяг";
  const IdentifierIcon = isUniversityTeacher ? PhoneIcon : isUniversityStudent ? UserIcon : EnvelopeIcon;

  const changeSuragch = (prop) => (event) => {
    setSuragch({ ...suragch, [prop]: event.target.value });
  };
  const { isSigningIn, setIsSigningIn } = useOutletContext();
  const focusOnModeChange = useRef(false);
  const [pending, setPending] = useState(false);
  const soum = addressState.address?.find(({ aimagCity }) => aimagCity === suragch.city)?.soumDistrict || [];

  useEffect(() => {
    if (!focusOnModeChange.current) return;
    focusOnModeChange.current = false;
    document.getElementById("page-title")?.focus();
  }, [isSigningIn]);

  const changeMode = (signingIn) => {
    setSignInError("");
    setShowPassword(false);
    if (!signingIn) setSuragch(createStudentDraft());
    focusOnModeChange.current = true;
    setIsSigningIn(signingIn);
  };

  const submit = async (event, action) => {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      await action();
    } finally {
      setPending(false);
    }
  };
  const selectRole = (next) => {
    setRole(next);
    setSignInError("");
    setShowPassword(false);
  };

  const changeCredential = (field) => (event) => {
    setCredentials({ ...credentials, [field]: event.target.value });
    setSignInError("");
  };

  const signIn = async () => {
    setSignInError("");
    setShowPassword(false);
    let identifier = credentials.identifier.trim();
    let phone;
    if (isUniversityTeacher) {
      if (identifier.includes("@")) {
        if (!/^[^\s@]+@[^\s@]+$/.test(identifier)) {
          setSignInError("Имэйл хаягаа шалгана уу.");
          return;
        }
      } else {
        phone = identifier.replace(/[\s()-]/g, "").replace(/^\+976(?=\d{8}$)/, "");
        if (!/^\d{8}$/.test(phone)) {
          setSignInError("8 оронтой утасны дугаараа оруулна уу.");
          return;
        }
        identifier = phone;
      }
    }
    const error = await login(identifier, credentials.password, role, { inlineError: true, phone });
    if (error) setSignInError(error);
  };
  const [buleg] = useState([
    "12А",
    "12Б",
    "12В",
    "12Г",
    "12Д",
    "12Е",
    "12Ё",
    "12Ж",
    "11А",
    "11Б",
    "11В",
    "11Г",
    "11Д",
    "11Е",
    "11Ё",
    "11Ж",
    "10А",
    "10Б",
    "10В",
    "10Г",
    "10Д",
    "10Е",
    "10Ё",
    "10Ж",
  ]);
  return (
    <div className="grid w-full min-w-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] bg-slate-50 dark:bg-slate-950 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:grid-rows-1">
      <SignInPhoto />
      <div className="relative z-10 -mt-4 flex min-w-0 flex-col items-center justify-center rounded-t-3xl bg-white px-5 pt-5 pb-20 dark:bg-slate-950 sm:px-8 sm:pt-8 lg:mt-0 lg:rounded-none lg:bg-gradient-to-br lg:from-orange-50/65 lg:via-white lg:to-slate-50 lg:px-11 lg:py-10 dark:lg:from-slate-900 dark:lg:via-slate-950 dark:lg:to-slate-950">
        {isSigningIn ? (
          <form
            key="sign-in"
            aria-busy={pending}
            aria-labelledby="page-title"
            onSubmit={(event) => submit(event, signIn)}
            className="w-full max-w-[29rem]"
          >
            <div className="space-y-3 sm:space-y-4">
              <RolePicker role={role} onChange={selectRole} pending={pending} />

              <div>
                <label htmlFor="login-identifier" className="mb-2 block text-sm font-extrabold">
                  {identifierLabel}
                </label>
                <div className="relative">
                  <IdentifierIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                  <input
                    id="login-identifier"
                    name="username"
                    type={identifierType}
                    inputMode={identifierType}
                    placeholder={isUniversityTeacher ? "Утасны дугаар эсвэл имэйл" : undefined}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={credentials.identifier}
                    onChange={changeCredential("identifier")}
                    readOnly={pending}
                    className="app-field min-h-12 bg-white/95 pl-11 dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1">
                <label htmlFor="loggingPassword" className="self-center text-sm font-extrabold">Нууц үг</label>
                <div className="relative col-span-2 row-start-2">
                  <LockClosedIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                  <input
                    id="loggingPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={credentials.password}
                    onChange={changeCredential("password")}
                    readOnly={pending}
                    className="app-field min-h-12 bg-white/95 pr-13 pl-11 dark:bg-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                    aria-controls="loggingPassword"
                    disabled={pending}
                    className="app-icon-button absolute top-1/2 right-1 -translate-y-1/2 disabled:opacity-60"
                  >
                    {showPassword ? <EyeSlashIcon aria-hidden="true" className="size-5" /> : <EyeIcon aria-hidden="true" className="size-5" />}
                  </button>
                </div>
                <Link to="/resetpass" className="col-start-2 row-start-1 inline-flex min-h-10 items-center justify-self-end rounded-md text-sm font-extrabold text-orange-800 hover:underline dark:text-orange-300">
                  Нууц үг сэргээх
                </Link>
              </div>

              {signInError && (
                <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/55 dark:text-red-200">
                  <ExclamationCircleIcon aria-hidden="true" className="size-5 shrink-0" />
                  <p className="min-w-0 [overflow-wrap:anywhere]">{signInError}</p>
                </div>
              )}

              <button type="submit" disabled={pending} className="app-button-primary min-h-12 w-full text-base">
                {pending ? (
                  <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                ) : <ArrowRightEndOnRectangleIcon aria-hidden="true" className="size-5" />}
                {pending ? "Нэвтэрч байна…" : "Нэвтрэх"}
              </button>
            </div>
            {role === "Сурагч" && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-200 pt-2 dark:border-slate-800 sm:mt-5">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Шинэ сурагч уу?</p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => changeMode(false)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-extrabold text-orange-800 hover:bg-orange-100/65 disabled:opacity-60 dark:text-orange-300 dark:hover:bg-orange-950/60"
                >
                  <UserPlusIcon aria-hidden="true" className="size-5" />
                  Бүртгүүлэх
                </button>
              </div>
            )}
          </form>
        ) : (
          <form
            key="registration"
            aria-busy={pending}
            aria-labelledby="page-title"
            onSubmit={(event) => submit(event, () => signup(suragch))}
            className="w-full max-w-2xl"
          >
            <fieldset disabled={pending} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-sm font-extrabold">Сурагчийн мэдээлэл</legend>
              <div>
                <label
                  htmlFor="student-register-lastname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Овог
                </label>
                <input
                  id="student-register-lastname"
                  onChange={changeSuragch("lastname")}
                  value={suragch.lastname}
                  type="text"
                  className="app-field"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="student-register-firstname"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Нэр
                </label>
                <input
                  id="student-register-firstname"
                  onChange={changeSuragch("firstname")}
                  value={suragch.firstname}
                  type="text"
                  className="app-field"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="student-register-regnum"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Регистр
                </label>
                <input
                  id="student-register-regnum"
                  onChange={changeSuragch("regnum")}
                  value={suragch.regnum}
                  type="text"
                  className="app-field"
                  placeholder=""
                  required
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="student-register-gender"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Хүйс
                </label>
                <select
                  onChange={changeSuragch("gender")}
                  value={suragch.gender}
                  id="student-register-gender"
                  className="app-field"
                >
                  <option value="">Сонгох</option>
                  {["Эрэгтэй", "Эмэгтэй"].map((el, index) => (
                    <option key={index} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="student-register-email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Имэйл хаяг
                </label>
                <input
                  id="student-register-email"
                  onChange={changeSuragch("email")}
                  value={suragch.email}
                  type="email"
                  autoComplete="email"
                  className="app-field"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="student-register-password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Нууц үг
                </label>
                <input
                  id="student-register-password"
                  onChange={changeSuragch("password")}
                  value={suragch.password}
                  type="password"
                  autoComplete="new-password"
                  className="app-field"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="student-register-phone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Утас
                </label>
                <input
                  id="student-register-phone"
                  onChange={changeSuragch("phone1")}
                  value={suragch.phone1}
                  type="tel"
                  autoComplete="tel"
                  className="app-field"
                  placeholder=""
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="student-register-city"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Аймаг/Хот
                </label>
                <select
                  id="student-register-city"
                  onChange={(e) => {
                    setSuragch({ ...suragch, city: e.target.value, soum: "", surguuli: "" });
                  }}
                  value={suragch.city}
                  className="app-field"
                >
                  <option value="">Сонгох</option>
                  {addressState.address?.map((el, index) => (
                    <option key={index} value={el.aimagCity}>
                      {el.aimagCity}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="student-register-soum"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Сум/Дүүрэг
                </label>
                <select
                  id="student-register-soum"
                  onChange={(e) => {
                    if (e.target.value) getSurguuliAimag2(suragch.city, e.target.value);

                    setSuragch({
                      ...suragch,
                      soum: e.target.value,
                      surguuli: "",
                    });
                  }}
                  value={suragch.soum}
                  disabled={!suragch.city}
                  className="app-field"
                >
                  <option value="">Сонгох</option>
                  {soum.map((el, index) => (
                    <option key={index} value={el.name}>
                      {el.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="student-register-school"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Сургууль
                </label>
                <select
                  id="student-register-school"
                  value={suragch.surguuli}
                  disabled={!suragch.soum}
                  onChange={(e) => {
                    setSuragch({
                      ...suragch,
                      surguuli: e.target.value,
                    });
                  }}
                  className="app-field"
                >
                  <option value="">Сонгох</option>
                  {surguuliState.surguuli?.map((el, index) => (
                    <option key={index} value={el._id}>
                      {el.ner}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="student-register-class"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Бүлэг
                </label>
                <select
                  id="student-register-class"
                  value={suragch.buleg}
                  onChange={changeSuragch("buleg")}
                  className="app-field"
                >
                  <option value="">Сонгох</option>
                  {buleg.map((el, index) => (
                    <option key={index} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:justify-end">
              <button type="button" disabled={pending} onClick={() => changeMode(true)} className="app-button-secondary">
                Нэвтрэх хэсэг
              </button>
              <button type="submit" disabled={pending} className="app-button-primary">
                {pending ? "Бүртгэж байна…" : "Бүртгүүлэх"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
