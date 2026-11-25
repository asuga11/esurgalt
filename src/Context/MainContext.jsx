import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "../AxiosDB";
import { toast } from "react-hot-toast";

const MainContext = React.createContext();

function readSessionUser(token) {
  if (!token) return null;

  try {
    const user = jwtDecode(token);
    return user.role && (!user.exp || user.exp * 1000 > Date.now()) ? user : null;
  } catch {
    return null;
  }
}

export const MainStore = ({ children }) => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const { state: navigationState } = useLocation();
  useEffect(() => {
    checkLogin();
    getAngilal();
    getSorilType();
    getAddress();
  }, []);

  const [user, setUser] = useState(() => readSessionUser(token));
  useEffect(() => {
    if (token && user) getAnaliz();
    else setAnaliz({});
  }, [token, user?.role]);
  const [suragch1, setSuragch1] = useState({
    success: false,
    suragch: {},
  });
  const [expTime, setExpTime] = useState({
    success: false,
    logoutTime: 60000,
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") === "dark" ? "dark" : "light");
  let [sigInOpen, setSigInOpen] = useState(false);

  // ------------- surguuli -------------
  const [surguuliState, setSurguuliState] = useState({
    success: false,
    surguuli: [],
    pagination: {},
  });
  // ------- Suragch --------------
  const [suragchState, setSuragchState] = useState({
    suragch: [],
    success: false,
    pagination: {},
  });
  const [suragchStateOne, setSuragchStateOne] = useState({
    suragch: {},
    success: false,
  });
  // student
  const [studentStateOne, setStudentStateOne] = useState({
    student: {},
    success: false,
  });
  const [studOne, setstudOne] = useState(null);
  //  ------- angi -----------
  const [angiState, setAngiState] = useState({
    success: false,
    content: [],
  });
  // -----  Shalgalt ----------
  const [examState, setExamState] = useState({
    shalgalt: [],
    success: false,
    pagination: {},
  });
  const [dunMember, setDunMember] = useState({
    shalgaltdun: {},
    success: false,
  });
  const [dunAllState, setDunAllState] = useState({
    success: true,
    shalgalt: null,
    shalgaltdun: [],
  });
  const [shalgaltOne, setShalgaltOne] = useState({
    shalgalt: {},
    success: false,
    listTests: [],
    count: 0,
  });
  const [openDunState, setOpenDunState] = useState({
    success: false,
    shalgaltduns: [],
    oroltsogchToo: 0,
  });
  const [memberExamOne, setMemberExamOne] = useState({
    success: false,
    info: {},
    shalgalt: {},
    shalgaltdun: [],
  });
  // --------------TESTS ----------------
  const [testSanState, setTestSanState] = useState({
    testsan: [],
    success: false,
  });
  const [testOnestate, setTestOneState] = useState({});
  const memberExamRequest = useRef(null);
  const questionRequest = useRef(null);

  const [hicheelState, setHicheelState] = useState({
    content: [],
    success: false,
  });
  // -----  Bagsh ----------
  const [bagshState, setBagshState] = useState({
    bagsh: [],
    success: false,
    pagination: {},
  });
  const [bagshStateOne, setBagshStateOne] = useState({
    bagsh: {},
    success: false,
  });
  const [teacherOne, setTeacherOne] = useState({
    teachr: {},
    success: false,
  });
  // -----  Surgalt ----------
  const [surgaltState, setsurgaltState] = useState({
    surgalt: [],
    success: false,
    pagination: {},
  });
  const [angilalState, setangilalState] = useState({
    angilal: [],
    success: false,
  });
  const [sorilType, setsorilType] = useState({
    content: [],
    success: false,
  });
  const [addressState, setAddressState] = useState({
    address: [],
    success: false,
  });
  const [lesson, setlesson] = useState({});
  const [surgaltStateOne, setsurgaltStateOne] = useState(null);
  const [suragchSurgalt, setsuragchSurgalt] = useState({
    surgaltuud: [],
  });
  const [analiz, setAnaliz] = useState({});

  // analiz
  const getAnaliz = () => {
    axios
      .get(`analiz/niit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (localStorage.getItem("token") === token) setAnaliz(res.data?.niit);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // shalgalt
  const getFeaturedExams = useCallback((signal) => {
    return axios.get("shalgalt/lists", {
      params: { examType: "Олимпиад", sort: "createdAt" },
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  }, [token]);
  const getSuragch = (sid) => {
    axios
      .get(`suragch/${sid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSuragch1(res.data);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ---------------------------------------------------------------------
  const checkLogin = () => {
    if (readSessionUser(token)) getExpTime(token);
    else logout();
  };

  useEffect(() => {
    if (!token || !user?.id) return;
    if (user.role === "suragch") getSuragchOne(user.id);
    if (user.role === "Student") getStudentOne(user.id);
    if (user.role === "bagsh") getBagshOne(user.id);
    if (user.role === "teacher") getTeacherOne(user.id);
  }, [token, user?.id, user?.role]);

  const clearProfiles = useCallback(() => {
    setSuragchStateOne({ suragch: {}, success: false });
    setStudentStateOne({ student: {}, success: false });
    setBagshStateOne({ bagsh: {}, success: false });
    setTeacherOne({ teachr: {}, success: false });
  }, []);

  const activateSession = useCallback((sessionToken, timing) => {
    const sessionUser = readSessionUser(sessionToken);
    if (!sessionUser) return false;

    if (localStorage.getItem("token") !== sessionToken) clearProfiles();
    localStorage.setItem("token", sessionToken);
    localStorage.setItem("user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    setExpTime(timing ?? { success: false, logoutTime: 0 });
    return true;
  }, [clearProfiles]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // ----------------- System ----------------
  const getExpTime = (token1) => {
    token1 &&
      axios
        .get(`settings/loginTime`, {
          headers: {
            Authorization: `Bearer ${token1}`,
          },
        })
        .then((res) => {
          if (localStorage.getItem("token") !== token1) return;
          if (res.data.logoutTime <= 0) {
            logout();
            return;
          }
          setExpTime({ ...res.data });
        })
        .catch((error) => {
          if (localStorage.getItem("token") !== token1) return;
          if (error.response.data.error === "jwt expired") {
            logout();
            navigate("/");
          }
          toast.error(error.response.data.error);
        });
  };
  // ---------- Auth---------------
  const login = (identifier, password, role, { inlineError = false, phone } = {}) => {
    let url =
      role === "Сурагч"
        ? "suragch/login"
        : role === "Багш"
        ? "bagsh/login"
        : role === "Оюутан"
        ? "students/login"
        : role === "Удирдлага"
        ? "hereglegch/login"
        : role === "Сургууль"
        ? "surguuli/login"
        : role === "Их сургуулийн багш"
        ? "teachers/login"
        : role === "Админ"
        ? "users/login"
        : "";
    return axios
      .post(url, {
        email: identifier,
        loginName: identifier,
        password,
        ...(role === "Их сургуулийн багш" && phone ? { phone, phone1: phone } : {}),
      })
      .then((res) => {
        if (!activateSession(res.data?.token)) throw new Error("Invalid session");
        getExpTime(res.data.token);
        const from = navigationState?.from;
        const returnTo = from?.pathname === "/control" || from?.pathname?.startsWith("/control/") || /^\/e\/[^/]+$/.test(from?.pathname || "");
        navigate(returnTo ? from : "/control", { replace: true });
        toast.success("Амжилттай");
      })
      .catch((error) => {
        const message = error.response?.data?.error;
        const loginError = typeof message === "string" && message.trim() ? message : "Нэвтрэхэд алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.";
        if (!inlineError) toast.error(loginError);
        return loginError;
      });
  };
  const signup = (data) => {
    return axios
      .post(`suragch/register`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        // navigate("/verification/suragch");
        return login(data.email, data.password, "Сурагч");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    clearProfiles();
    setExpTime({ success: false, logoutTime: 0 });
  };

  // ------- email verif ------------------
  const emailVerif = (code) => {
    return axios
      .get(`suragch/verification_get/${code}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success(res?.data?.user);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ------- forgot pass ------------------
  const forgotPass = (email) => {
    return axios
      .post(
        `suragch/forgot-password/`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Email хаягаа шалгана уу.");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ------- forgot pass ------------------
  const changePass = (password, resetToken) => {
    return axios
      .post(
        `suragch/reset-password/`,
        { password, resetToken },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        navigate("/login");
        toast.success("Амжилттай");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ------- Basgh ------------------
  const addBagsh = (data) => {
    axios
      .post(`bagsh/register`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getBagshSurguuli(data.surguuli);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const updateBagsh = (data) => {
    axios
      .put(`bagsh/${data._id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getBagshSurguuli(res.data.bagsh.surguuli);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const deleteBagsh = (id) => {
    axios
      .delete(`bagsh/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getBagshSurguuli(res.data.bagsh.surguuli);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getBagshSurguuli = (sid) => {
    axios
      .get(`bagsh/s_id/${sid}?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setBagshState({ ...res.data });
      })
      .catch((error) => {
        toast.error(error.response.data.error);
      });
  };
  const getBagshOne = (bid, token1) => {
    const requestToken = token1 || token;
    axios
      .get(`bagsh/${bid}`, {
        headers: {
          Authorization: `Bearer ${requestToken}`,
        },
      })
      .then((res) => {
        if (localStorage.getItem("token") !== requestToken) return;
        setBagshStateOne({ ...res.data });
      })
      .catch((error) => {
        if (localStorage.getItem("token") === requestToken) toast.error(error.response.data.error);
      });
  };
  // ----- teacher ------------------
  const getTeacherOne = (bid, token1) => {
    const requestToken = token1 || token;
    axios
      .get(`teachers/${bid}`, {
        headers: {
          Authorization: `Bearer ${requestToken}`,
        },
      })
      .then((res) => {
        if (localStorage.getItem("token") !== requestToken) return;
        setTeacherOne({ ...res.data });
      })
      .catch((error) => {
        if (localStorage.getItem("token") === requestToken) toast.error(error.response.data.error);
      });
  };
  // ---- Surguuli ------------------
  const updateSurguuli = (data) => {
    axios
      .put(`surguuli/${data._id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getSurguuliAimag(data.aimag);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const changePassword = (id, pass) => {
    axios
      .post(
        `surguuli/create-password`,
        { _id: id, password: pass },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const changePasswordSuragch = (id, pass) => {
    axios
      .post(
        `suragch/create-password`,
        { _id: id, password: pass },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const changePasswordBagsh = (id, pass) => {
    axios
      .post(
        `bagsh/create-password`,
        { _id: id, password: pass },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getSurguuliAimag = (aimag) => {
    axios
      .get(`surguuli?aimag=${aimag}&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSurguuliState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const schoolLookup = useRef(null);
  const getSurguuliAimag2 = (aimag, soum) => {
    schoolLookup.current?.abort();
    const controller = new AbortController();
    schoolLookup.current = controller;
    setSurguuliState({ success: false, surguuli: [], pagination: {} });
    return axios
      .get(`surguuli/find/${encodeURIComponent(aimag)}/${encodeURIComponent(soum)}`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (!controller.signal.aborted) setSurguuliState({ ...res.data });
      })
      .catch((error) => {
        if (!controller.signal.aborted) toast.error(error.response.data.error);
      });
  };
  //
  // ----- Student ---------
  const getStudentOne = (sid, token1) => {
    const requestToken = token1 || token;
    axios
      .get(`students/${sid}`, {
        headers: {
          Authorization: `Bearer ${requestToken}`,
        },
      })
      .then((res) => {
        if (localStorage.getItem("token") !== requestToken) return;
        setStudentStateOne({ ...res.data });
      })
      .catch((error) => {
        if (localStorage.getItem("token") === requestToken) toast.error(error.response.data.error);
      });
  };
  const getstudone = (value, role) => {
    const ourl = `students?loginName=${value}`;
    const surl = `suragch/email/${value}`;
    axios
      .get(role === "Оюутан" ? ourl : surl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (role === "Оюутан") {
          res.data?.students?.length > 0
            ? setstudOne(res.data.students[0])
            : setstudOne(null);
        } else {
          res.data?.suragch ? setstudOne(res.data.suragch) : setstudOne(null);
        }
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ----- Suragch ---------
  const addSuragch = (data) => {
    axios
      .post(`suragch/register`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getSuragchAngi(data.surguuli, data.buleg);
        getAngiSchool(data.surguuli);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const updateSuragch = (data) => {
    axios
      .put(`suragch/${data._id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getSuragchAngi(res.data.suragch.surguuli, data.buleg);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const deleteSuragch = (data) => {
    axios
      .delete(`suragch/${data._id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getSuragchAngi(data.surguuli._id, data.buleg);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getSuragchOne = (sid, token1) => {
    const requestToken = token1 || token;
    axios
      .get(`suragch/${sid}`, {
        headers: {
          Authorization: `Bearer ${requestToken}`,
        },
      })
      .then((res) => {
        if (localStorage.getItem("token") !== requestToken) return;
        setSuragchStateOne({ ...res.data });
      })
      .catch((error) => {
        if (localStorage.getItem("token") === requestToken) toast.error(error.response.data.error);
      });
  };
  const getSuragchAngi = (sid, buleg) => {
    axios
      .get(`suragch/s_id/${sid}?buleg=${buleg}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setSuragchState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ------- angi -------------
  const getAngiSchool = (schoolid) => {
    axios
      .get(`suragch/buleg/${schoolid}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAngiState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // -------- ShalgaltDun
  const updateShalgaltDun = (id, answer, eid) => {
    axios
      .put(
        `shalgaltdun/${id}`,
        { studAnswers: [answer] },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        getshalgaltDun(id, { refresh: true, eid });
        getMemberExamOne(eid, user.id);
        toast.success("Амжилттай");
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const workTest = (id, tid, answer, eid) => {
    return axios
      .put(
        `shalgaltdun/working/${id}`,
        { testsan_id: tid, studAnswers: answer },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(async () => {
        await Promise.all([getshalgaltDun(id, { refresh: true, eid }), getMemberExamOne(eid, user.id)]);
        return true;
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Хариулт хадгалагдсан эсэхийг шалгаж чадсангүй.");
        return false;
      });
  };
  const workTest2 = (id, answer, eid, tid) => {
    return axios
      .put(
        `shalgaltdun/updateStudAnswer/${id}`,
        { _id: answer._id, value: answer.value, testsan_id: tid },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(async () => {
        await Promise.all([getshalgaltDun(id, { refresh: true, eid }), getMemberExamOne(eid, user.id)]);
        return true;
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Хариулт хадгалагдсан эсэхийг шалгаж чадсангүй.");
        return false;
      });
  };

  // ------- Exam ------
  const getExams = (bagshid) => {
    axios
      .get(`shalgalt?owner_id=${bagshid}&limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setExamState({ ...res.data });
      })
      .catch((error) => {
        toast.error(error.response.data.error);
      });
  };

  const startExam = (eid, data) => {
    return axios
      .put(`shalgalt/startTest/${eid}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success("Амжилт хүсье.");
        return getMemberExamOne(eid, data._id);
      })
      .catch((error) => {
        toast.error(error.response.data.error);
        return false;
      });
  };

  const getshalgaltDun = (id, { refresh = false, eid } = {}) => {
    if (!id || (refresh && (questionRequest.current?.id !== id ||
      memberExamRequest.current?.eid !== eid))) return;

    const request = { id };
    questionRequest.current = request;
    if (!refresh) setTestOneState(null);
    return axios
      .get(`shalgaltdun/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (questionRequest.current === request && localStorage.getItem("token") === token) {
          setTestOneState(res.data);
        }
      })
      .catch((error) => {
        if (questionRequest.current === request && localStorage.getItem("token") === token) {
          toast.error(error.response.data.error);
        }
      });
  };
  const getOpenDun = useCallback((id, signal) => {
    setOpenDunState({ success: false, shalgaltduns: [] });
    return axios
      .get(`shalgaltdun/openDun/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
      .then(({ data }) => {
        if (signal?.aborted) return false;
        setOpenDunState(data);
        return Array.isArray(data?.shalgaltduns);
      })
      .catch((error) => {
        if (!signal) toast.error(error.response.data.error);
        return false;
      });
  }, [token]);
  const getShalgaltAllDun = (id) => {
    axios
      .get(`shalgaltdun/resultAll/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setDunAllState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getMemberExamOne = (eid, mid, type, signal) => {
    const previous = memberExamRequest.current;
    const opening = type === "start" || type === "view";
    if (!opening && (previous?.eid !== eid || previous.mid !== mid ||
        previous.token !== token || previous.signal?.aborted)) return Promise.resolve(false);

    const request = { eid, mid, token, signal: signal ?? previous?.signal };
    memberExamRequest.current = request;
    const isCurrent = () => memberExamRequest.current === request &&
      !request.signal?.aborted && localStorage.getItem("token") === token;

    if (opening) {
      questionRequest.current = null;
      setTestOneState(null);
      setMemberExamOne({ success: false, info: {}, shalgalt: {}, shalgaltdun: [] });
      setDunMember({ success: false, shalgaltdun: {} });
    }

    return axios
      .get(`shalgalt/findOne/${eid}/${mid}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: request.signal,
      })
      .then(({ data }) => {
        if (!isCurrent() || !data?.success || !data.info || !data.shalgalt) return false;
        const questions = Array.isArray(data.shalgaltdun) ? data.shalgaltdun : [];
        setMemberExamOne({ ...data, shalgaltdun: questions });

        if (data.info.examStatus === "Дууссан") {
          getExamMemberResult(eid, mid, request.signal);
        }
        return true;
      })
      .catch((error) => {
        if (isCurrent()) toast.error(error.response?.data?.error || "Сорил ачаалахад алдаа гарлаа.");
        return false;
      });
  };

  const getSorilType = () => {
    axios
      .get(`shalgalt/groupType`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setsorilType({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };

  const getPublicExams = useCallback(async (examType, signal, onFirstPage) => {
    const exams = new Map();
    let page = 1;

    while (!signal.aborted) {
      const { data } = await axios.get("shalgalt/lists", {
        params: { examType, page, limit: 100, sort: "_id" },
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      if (data?.success === false || !Array.isArray(data?.shalgalt)) {
        throw new Error("Invalid exam catalog");
      }

      for (const exam of data.shalgalt) {
        if (exam?._id && exam.examType === examType) exams.set(exam._id, exam);
      }

      const pageCount = Number(data.pagination?.pageCount);
      if (!Number.isSafeInteger(pageCount) || page >= pageCount) break;
      if (page === 1 && !signal.aborted) onFirstPage?.([...exams.values()]);
      page += 1;
    }

    return [...exams.values()];
  }, [token]);
  const getShalgalt = (id, signal) => {
    return axios
      .get(`shalgalt/${id}`, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (!signal?.aborted) setShalgaltOne({ ...res.data });
        return Boolean(res.data.success && res.data.shalgalt?._id);
      })
      .catch((error) => {
        if (!signal?.aborted) toast.error(error.response.data.error);
        return false;
      });
  };
  const getShalgaltMember = useCallback((id, signal) => {
    return axios.get(`shalgalt/member/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    }).then(({ data }) => Array.isArray(data?.shalgaltuud) ? data.shalgaltuud : []);
  }, [token]);
  const getShalgaltList = (id) => {
    axios
      .get(`shalgalt/listtests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setShalgaltOne({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addExam = (newExam) => {
    return axios
      .post(`shalgalt`, newExam, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        toast.success("Амжилттай");
        getExams(user.id);
        return true;
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Сорил хадгалагдсангүй.");
        return false;
      });
  };
  const updateExam = (data) => {
    return axios
      .put(`shalgalt/${data._id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай өөрчлөгдлөө");
        if (user.role === "admin") {
          getExams(res.data.shalgalt.owner_id);
        } else {
          getExams(user.id);
        }
        return true;
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Сорил шинэчлэгдсэнгүй.");
        return false;
      });
  };
  const deleteExam = (id) => {
    axios
      .delete(`shalgalt/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай устлаа");
        getExams(user.id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addExamTest = (eid, _id) => {
    axios
      .put(
        `shalgalt/addTest/${eid}`,
        { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Нэмлээ");
        getShalgaltList(eid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const removeExamTest = (eid, _id) => {
    axios
      .put(
        `shalgalt/deleteTest/${eid}`,
        { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Хаслаа");
        getShalgaltList(eid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addExamMember = (eid, data, member) => {
    return axios
      .put(`shalgalt/addMember/${eid}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай ");
        // getShalgaltList(eid);
        if (member) {
          navigate(`/control/soril/${eid}`);
        }
      })
      .catch((error) => {
        if (error.response.data.error === "Бүртгэлтэй байна...") {
          navigate(`/control/soril/${eid}`);
        } else {
          toast.error(error.response.data.error);
        }
      });
  };
  const addExamMember2 = (eid, data) => {
    axios
      .put(`shalgalt/addMember/${eid}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай ");
        getShalgaltList(eid);
        // getShalgaltList(eid);
      })
      .catch((error) => {
        toast.error(error.response.data.error);
        // if (error.response.data.error === "Бүртгэлтэй байна...") {
        //   // navigate(`/control/soril/${eid}`);
        // }
      });
  };
  const updateExamMember = (eid, data) => {
    return axios
      .put(`shalgalt/updateMember/${eid}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async () => {
        toast.success("Амжилттай");
        const refreshed = await getMemberExamOne(eid, data._id);
        const current = memberExamRequest.current;
        if (!refreshed && current?.eid === eid && current.mid === data._id &&
            current.token === token && !current.signal?.aborted && localStorage.getItem("token") === token) {
          setMemberExamOne((exam) => ({ ...exam, info: { ...exam.info, examStatus: data.examStatus } }));
        }
        return true;
      })
      .catch((error) => {
        toast.error(error.response?.data?.error || "Сорилын төлөв шинэчлэгдсэн эсэхийг шалгаж чадсангүй.");
        return false;
      });
  };
  const getExamMemberResult = useCallback((eid, mid, signal) => {
    setDunMember({ success: false, shalgaltdun: {} });
    return axios
      .get(`shalgaltdun/result/${eid}/${mid}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
      .then(({ data }) => {
        if (!signal?.aborted) setDunMember(data);
      })
      .catch((error) => {
        if (!signal) toast.error(error.response.data.error);
      });
  }, [token]);
  const removeExamMember = (eid, _id) => {
    axios
      .put(
        `shalgalt/deleteMember/${eid}`,
        { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
        getShalgaltList(eid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ------------ TestSan ----------------
  const addTest = (data, aguulga, limit, page) => {
    setTestOneState(null);
    axios
      .post(`testsan`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        getTest(res.data.testsan._id);
        // toast.success("Амжилттай");
        getTestSan(
          user.id,
          res.data.testsan.hicheel_name,
          res.data.testsan.aguulga_name,
          5,
          1
        );
        getTestHicheel(user.id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const updateTest = (data, hicheel, aguulga, limit, page) => {
    axios
      .put(`testsan/${data._id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getTestSan(
          user.id,
          res.data.testsan.hicheel_name,
          res.data.testsan.aguulga_name,
          limit,
          page
        );
        getTestHicheel(user.id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const deleteTest = (id, hicheel, aguulga, limit, page) => {
    axios
      .delete(`testsan/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getTestSan(
          user.id,
          res.data.testsan.hicheel_name,
          res.data.testsan.aguulga_name,
          limit,
          page
        );
        getTestHicheel(user.id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getTestSan = (owner, hicheel, aguulga, limit, page) => {
    let url = `testsan?${owner !== "" ? `&owner_id=${owner}` : ""}${
      hicheel !== "" ? `&hicheel_name=${hicheel}` : ""
    }${aguulga !== "" ? `&aguulga_name=${aguulga}` : ""}${
      limit !== "" ? `&limit=${limit}` : ""
    }${page !== "" ? `&page=${page}` : ""}&sort=-createdAt`;

    axios
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTestSanState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getTest = (id) => {
    // setTestOneState({});
    axios
      .get(`testsan/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTestOneState({ ...res.data.testsan });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getTestHicheel = (id) => {
    let url = `testsan/groupHicheelName${
      id !== "" ? `?owner_id=${id}` : "?&material=true"
    }`;

    axios
      .get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setHicheelState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addAnswwer = (id, data) => {
    axios
      .put(`testsan/addanswer/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // setTestOneState({
        //   ...testOnestate,
        //   answers: [...testOnestate.answers, res.data.lastAnswer],
        // });

        toast.success("Амжилттай");

        getTest(id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const updateAnswwer = (id, data) => {
    axios
      .put(
        `testsan/editanswer/${id}`,
        { ...data, answer_id: data._id },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
        getTest(id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const deleteAnswwer = (id, data) => {
    axios
      .put(
        `testsan/deleteanswer/${id}`,
        { answer_id: data },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
        getTest(id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  // ------------- Surgalt -------------
  const uploadSurgaltPhoto = (sid, photo, bid) => {
    axios
      .put(`surgalt/${sid}/photo`, photo, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        getBagshSurgaltOne(sid);
        getBagshSurgalt(bid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const uploadLessonVideo = async (sid, file) => {
    await axios
      .put(`surgalt/${sid}/file?action=video`, file, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setlesson({ ...lesson, url: res.data.fileSan.url, lessonType: false });
        toast.success("Амжилттай");
        getBagshSurgaltOne(sid);
        // getBagshSurgalt(bid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addSurgalt = (data) => {
    axios
      .post(`surgalt`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        getBagshSurgaltOne(res.data?.surgalt?._id);
        getBagshSurgalt(data.owner_id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const updateSurgalt = (data) => {
    axios
      .put(`surgalt/${data._id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getBagshSurgalt(data.owner_id);
        getBagshSurgaltOne(res.data?.surgalt?._id);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const deleteSurgalt = (id, bid, edit) => {
    axios
      .delete(`surgalt/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        edit && toast.success("Амжилттай");
        getBagshSurgalt(bid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getPublicCourses = useCallback((category, signal) => {
    return axios.get("surgalt", {
      params: { angilal_id: category || undefined, limit: 1000 },
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
  }, [token]);

  const getBagshSurgalt = (bagshId) => {
    setsurgaltState({ success: false, surgalt: [] });
    axios
      .get(`surgalt?owner_id=${bagshId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setsurgaltState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getBagshSurgaltOne = (sid, signal) => {
    return axios
      .get(`surgalt/${sid}/url`, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (!signal?.aborted) setsurgaltStateOne(res.data.surgalt || null);
        return Boolean(res.data.surgalt?._id);
      })
      .catch((error) => {
        if (!signal?.aborted) toast.error(error.response.data.error);
        return false;
      });
  };
  const getSurgaltOne = (sid, signal) => {
    return axios
      .get(`surgalt/${sid}`, {
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (!signal?.aborted) setsurgaltStateOne(res.data.surgalt || null);
        return Boolean(res.data.surgalt?._id);
      })
      .catch((error) => {
        if (!signal?.aborted) toast.error(error.response.data.error);
        return false;
      });
  };
  const getSuragchSurgalt = () => {
    // setsurgaltStateOne(null);
    axios
      .get(`surgalt/member/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setsuragchSurgalt({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const getAngilal = () => {
    axios
      .get(`angilal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setangilalState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addlesson = (sid, data) => {
    axios
      .put(`surgalt/addLesson/${sid}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setlesson(res.data);
        toast.success("Амжилттай");
        getBagshSurgaltOne(sid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const updateLesson = (sid, data) => {
    axios
      .put(`surgalt/updateLesson/${sid}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай");
        getBagshSurgaltOne(sid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const deleteLesson = (sid, lid) => {
    axios
      .put(
        `surgalt/deleteLesson/${sid}`,
        { _id: lid },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.success("Амжилттай");
        getBagshSurgaltOne(sid);
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  const addSurgaltMember = (sid, data) => {
    axios
      .put(`surgalt/addMember/${sid}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай ");
        getSurgaltOne(sid);
        // getShalgaltList(eid);
      })
      .catch((error) => {
        toast.error(error.response.data.error);
        getSurgaltOne(sid);
      });
  };

  const updateSurgaltMember = (sid, data) => {
    axios
      .put(`surgalt/updateMember/${sid}`, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        toast.success("Амжилттай ");
        getSurgaltOne(sid);
        // getShalgaltList(eid);
      })
      .catch((error) => {
        toast.error(error.response.data.error);
        getSurgaltOne(sid);
      });
  };

  // ------------ Addresses --------------
  const getAddress = () => {
    axios
      .get(`address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAddressState({ ...res.data });
      })
      .catch((error) => toast.error(error.response.data.error));
  };
  return (
    <MainContext.Provider
      value={{
        getFeaturedExams,
        emailVerif,
        forgotPass,
        changePass,
        getSuragch,
        suragch1,
        // teacher
        teacherOne,
        getTeacherOne,
        // address
        getAddress,
        addressState,
        // surgalt
        addSurgalt,
        updateSurgalt,
        deleteSurgalt,
        getBagshSurgalt,
        surgaltState,
        getBagshSurgaltOne,
        surgaltStateOne,
        setsurgaltStateOne,
        getSurgaltOne,
        getAngilal,
        angilalState,
        addlesson,
        updateLesson,
        deleteLesson,
        getPublicCourses,
        uploadSurgaltPhoto,
        uploadLessonVideo,
        lesson,
        setlesson,
        addSurgaltMember,
        updateSurgaltMember,
        getSuragchSurgalt,
        suragchSurgalt,
        setsuragchSurgalt,
        // studnts
        getStudentOne,
        studentStateOne,
        getstudone,
        studOne,
        // system
        expTime,
        // TestSan
        addTest,
        updateTest,
        deleteTest,
        getTest,
        testOnestate,
        setTestOneState,
        getTestHicheel,
        hicheelState,
        getTestSan,
        testSanState,
        deleteAnswwer,
        addAnswwer,
        updateAnswwer,
        // shalgaltdun
        updateShalgaltDun,
        workTest,
        workTest2,
        getExamMemberResult,
        dunMember,
        dunAllState,
        getShalgaltAllDun,
        getOpenDun,
        openDunState,
        // exam
        getExams,
        examState,
        getshalgaltDun,
        memberExamOne,
        getMemberExamOne,
        startExam,
        addExamMember,
        addExamMember2,
        updateExamMember,
        removeExamMember,
        shalgaltOne,
        setShalgaltOne,
        getShalgaltList,
        getShalgalt,
        addExam,
        updateExam,
        deleteExam,
        addExamTest,
        removeExamTest,
        getShalgaltMember,
        sorilType,
        getSorilType,
        getPublicExams,
        // Bagsh
        getBagshSurguuli,
        bagshState,
        bagshStateOne,
        getBagshOne,
        addBagsh,
        updateBagsh,
        deleteBagsh,
        changePasswordBagsh,
        // angi
        getAngiSchool,
        angiState,
        // suragch
        suragchState,
        getSuragchAngi,
        suragchStateOne,
        getSuragchOne,
        addSuragch,
        updateSuragch,
        deleteSuragch,
        changePasswordSuragch,
        // surguuli
        getSurguuliAimag,
        getSurguuliAimag2,
        surguuliState,
        setSurguuliState,
        updateSurguuli,
        changePassword,
        // signin
        sigInOpen,
        setSigInOpen,
        user,
        activateSession,
        login,
        signup,
        logout,
        setTheme,
        theme,
        analiz,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
export default MainContext;
