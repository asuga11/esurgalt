

import { decode } from "html-entities";
import renderRichText from "../../../renderRichText";
import React, { useContext, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import MainContext from "../../../Context/MainContext";
import TimerMember from "./TimerMember";
import DunMember from "./DunMember";
import Timer from "../../Exam/Timer";
import {
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import EndExam from "./EndExam";
import Loader from "../../General/Loader";
import { toast } from "react-hot-toast";

const shuffleArray = (array) => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

const requestFullScreen = async () => {
  const element = document.documentElement;
  const request = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
  try {
    await request?.call(element);
  } catch {
    toast.error("Бүтэн дэлгэцийн горимд шилжих боломжгүй байна.");
  }
};

const checkFullScreen = () => {
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
  );
};

const hasAnswer = (question) => question.studAnswers?.some((answer) => {
  const type = question.testsan_id?.testType;
  return type === "Нэг сонголттой" || type === "Олон сонголттой" ||
    Boolean(String(answer.value ?? "").trim());
});

const ExamWork = ({ eid, memberId, readOnly }) => {

  const {
    user,
    startExam,
    memberExamOne,
    getMemberExamOne,
    getshalgaltDun,
    testOnestate,
    updateExamMember,
    workTest,
    workTest2,
    dunMember,
  } = useContext(MainContext);

  const draftKey = `exam-drafts:${encodeURIComponent(memberId)}:${encodeURIComponent(eid)}`;
  const [drafts, setDrafts] = useState(() => {
    if (readOnly) return {};
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey));
      return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch {
      return {};
    }
  });
  const draftValues = useRef(drafts);
  const [draftStorageError, setDraftStorageError] = useState(false);
  const [dunOpen, setDunOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const warningCountRef = useRef(0);
  const mutationPending = useRef(false);
  const answerPending = useRef(null);
  const [isAnswerSaving, setIsAnswerSaving] = useState(false);
  const [answerSaveState, setAnswerSaveState] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadState, setLoadState] = useState("loading");
  const [reload, setReload] = useState(0);
  const [isFullscreenState, setIsFullscreenState] = useState(false);

  const selectedTest = testOnestate?.shalgaltdun;
  const testType = selectedTest?.testsan_id?.testType;
  const savedAnswers = selectedTest?.studAnswers ?? [];
  const questionId = selectedTest?._id;
  const templateId = selectedTest?.testsan_id?._id;
  const examId = memberExamOne?.shalgalt?._id;
  const isWorking = !readOnly && loadState === "ready" && memberExamOne?.info?.examStatus === "Ажиллаж байна";
  const draftId = (field) => `${questionId}:${field}`;
  const hasCurrentDraft = Object.keys(drafts).some((key) => key.startsWith(`${questionId}:`));
  const currentAnswerSave = answerSaveState && answerSaveState.questionId === questionId ? answerSaveState : null;
  const writeDrafts = (values) => {
    draftValues.current = values;
    setDrafts(values);
    try {
      if (Object.keys(values).length) sessionStorage.setItem(draftKey, JSON.stringify(values));
      else sessionStorage.removeItem(draftKey);
      setDraftStorageError(false);
    } catch {
      setDraftStorageError(true);
    }
  };
  const changeDraft = (key, value) => {
    const next = { ...draftValues.current };
    if (value === undefined) delete next[key];
    else next[key] = value;
    writeDrafts(next);
  };
  const clearCompletedDrafts = useEffectEvent(() => writeDrafts({}));
  const isCompleted = !readOnly && loadState === "ready" && memberExamOne?.info?.examStatus === "Дууссан";
  useEffect(() => {
    if (isCompleted) clearCompletedDrafts();
  }, [isCompleted]);

  useEffect(() => {
    if (!eid || !memberId) return;
    const controller = new AbortController();
    setLoadState("loading");
    getMemberExamOne(eid, memberId, readOnly ? "view" : "start", controller.signal).then((loaded) => {
      if (!controller.signal.aborted) setLoadState(loaded ? "ready" : "error");
    });
    return () => controller.abort();
    // The request is scoped to this route and cancelled when leaving it.
  }, [eid, memberId, readOnly, reload]);

  const saveAnswer = (save, ...args) => {
    if (timeExpired || mutationPending.current || answerPending.current) return;
    setIsAnswerSaving(true);
    setAnswerSaveState(null);
    answerPending.current = Promise.resolve().then(() => save(...args)).catch(() => false).then((saved) => {
      setAnswerSaveState({ questionId, saved });
      return saved;
    }).finally(() => {
      answerPending.current = null;
      setIsAnswerSaving(false);
    });
    return answerPending.current;
  };

  const needsAnswerFields = (testType === "Задгай даалгавар" || testType === "Нөхөх") && !savedAnswers.length;
  const prepareAnswerFields = () => {
    if (!isWorking || !questionId || !templateId || !examId) return;
    const fields = testType === "Нөхөх"
      ? [{ value: "" }]
      : (selectedTest.testsan_id.answers ?? []).map(({ _id, answer }) => ({ _id, answer, value: "" }));
    if (fields.length) saveAnswer(workTest, questionId, templateId, fields, examId);
  };
  const prepareOnSelect = useEffectEvent(prepareAnswerFields);

  useEffect(() => {
    if (needsAnswerFields) prepareOnSelect();
  }, [questionId, isWorking, needsAnswerFields]);

  const addWarning = (message) => {
    warningCountRef.current += 1;
    setWarningCount(warningCountRef.current);
    toast.error(`Анхааруулга ${warningCountRef.current}: ${message}`);
  };

  useEffect(() => {
    if (!isWorking) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning("Tab сольсон байна.");
      }
    };

    const handleBlur = () => {
      addWarning("Browser focus алдсан байна.");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error("Right click хориглогдсон.");
    };

    const handleCopyCut = (e) => {
      e.preventDefault();
      toast.error("Copy/Cut хийх боломжгүй.");
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const hasModifier = e.ctrlKey || e.metaKey;
      const opensDevTools = (e.ctrlKey && e.shiftKey) || (e.metaKey && e.altKey);

      const blocked =
        ["f5", "f11", "f12"].includes(key) ||
        (hasModifier && ["r", "s", "p", "u"].includes(key)) ||
        (opensDevTools && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && e.metaKey && key === "f") ||
        (e.ctrlKey && ["c", "x", "a"].includes(key));

      if (blocked) {
        e.preventDefault();
        if (!e.repeat) addWarning("Хориглосон shortcut ашиглах оролдлого.");
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreenState(checkFullScreen());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    setIsFullscreenState(checkFullScreen());

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [isWorking]);

  const rawNormalTests = useMemo(() => {
    return (
      memberExamOne?.shalgaltdun
        ?.filter((el) => el.testsan_id?.testType !== "Текст")
        ?.filter((el) => el.testsan_id?.testType !== "Эсээ") || []
    );
  }, [memberExamOne?.shalgaltdun]);

  const normalTests = useMemo(() => {
    if (!rawNormalTests.length || !eid || !user?.id) return [];

    const storageKey = `exam_question_order_${eid}_${user.id}`;
    const questionsById = new Map(rawNormalTests.map((item) => [item._id, item]));
    const currentIds = [...questionsById.keys()];
    let savedIds;

    try {
      savedIds = JSON.parse(localStorage.getItem(storageKey));
    } catch {
      // The exam can still run when storage is unavailable.
    }

    const isValidSavedOrder = Array.isArray(savedIds) &&
      savedIds.length === currentIds.length &&
      new Set(savedIds).size === currentIds.length &&
      savedIds.every((id) => questionsById.has(id));

    const finalIds = isValidSavedOrder ? savedIds : shuffleArray(currentIds);
    if (!isValidSavedOrder) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(finalIds));
      } catch {
        // Keep the order in memory for this render.
      }
    }
    return finalIds.map((id) => questionsById.get(id));
  }, [rawNormalTests, eid, user?.id]);

  const textTests =
    memberExamOne?.shalgaltdun?.filter(
      (el) => el.testsan_id?.testType === "Текст"
    ) || [];

  const essayTests =
    memberExamOne?.shalgaltdun?.filter(
      (el) => el.testsan_id?.testType === "Эсээ"
    ) || [];

  const firstQuestionId = (normalTests[0] ?? textTests[0] ?? essayTests[0])?._id;
  const loadFirstQuestion = useEffectEvent((id) => getshalgaltDun(id));
  useEffect(() => {
    if (isWorking && firstQuestionId) loadFirstQuestion(firstQuestionId);
  }, [isWorking, firstQuestionId]);

  const currentIndex = normalTests.findIndex(
    (item) => item._id === selectedTest?._id
  );

  const answeredCount =
    memberExamOne?.shalgaltdun?.filter(hasAnswer)
      ?.length || 0;

  const totalCount = memberExamOne?.shalgaltdun?.length || 0;

  const userInfoText = [
    memberExamOne?.info?.member_name,
    memberExamOne?.info?.member_role,
    memberExamOne?.info?.member_school,
    memberExamOne?.info?.member_class,
  ]
    .filter(Boolean)
    .join(" • ");

  const handleStartExam = async () => {
    if (mutationPending.current) return;
    if (!memberExamOne.shalgalt?.isActive) {
      toast.error("Сорил нээгдээгүй байна.");
      return;
    }

    requestFullScreen();

    mutationPending.current = true;
    setIsSaving(true);
    try {
      const started = await startExam(memberExamOne.shalgalt._id, {
        _id: memberId,
        member_name: memberExamOne.info.member_name,
        member_role: memberExamOne.info.member_role,
        member_school: memberExamOne.info.member_school,
        member_class: memberExamOne.info.member_class,
        startTime: "0",
        endTime: "0",
        examStatus: "Ажиллаж байна",
      });
      if (!started) setReload((attempt) => attempt + 1);
    } finally {
      mutationPending.current = false;
      setIsSaving(false);
    }
  };

  const finishExam = async () => {
    const examId = memberExamOne.shalgalt?._id;
    const examMemberId = memberExamOne.info?.member_id;
    if (!isWorking || !examId || !examMemberId || mutationPending.current) return;

    mutationPending.current = true;
    setIsSaving(true);
    try {
      await answerPending.current;
      if (await updateExamMember(examId, { _id: examMemberId, examStatus: "Дууссан" })) {
        writeDrafts({});
        setEndOpen(false);
      } else {
        await getMemberExamOne(examId, examMemberId);
      }
    } finally {
      mutationPending.current = false;
      setIsSaving(false);
    }
  };


  const goQuestionByIndex = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= normalTests.length) return;

    const nextQuestion = normalTests[nextIndex];

    if (!nextQuestion?._id) return;

    getshalgaltDun(nextQuestion._id);
  };

  const goPrevQuestion = () => {
    goQuestionByIndex(currentIndex - 1);
  };

  const goNextQuestion = () => {
    goQuestionByIndex(currentIndex + 1);
  };

  return (
    <section className="relative min-h-screen overflow-x-clip select-none bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {isWorking && (
        <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden opacity-[0.07]">
          <div className="grid h-full rotate-[-20deg] grid-cols-2 gap-12 p-8 text-base font-bold text-slate-900 dark:text-white md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index} className="whitespace-nowrap">
                {user?.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {dunOpen && <DunMember closeDun={() => setDunOpen(false)} />}

      {endOpen && isWorking && (
        <EndExam
          closeModal={() => setEndOpen(false)}
          onConfirm={finishExam}
          hasDrafts={Object.keys(drafts).length > 0}
          isSaving={isSaving}
        />
      )}

      {loadState === "loading" && <Loader />}
      {loadState === "error" && (
        <div className="app-container py-12 text-center">
          <h1 className="text-xl font-bold">Сорил ачаалагдсангүй</h1>
          <button type="button" className="app-button-primary mt-4" onClick={() => setReload(reload + 1)}>
            Дахин ачаалах
          </button>
        </div>
      )}

      {loadState === "ready" && memberExamOne.success && (
        <>
          {!readOnly && memberExamOne.info?.examStatus === "Хуваарилсан" && (
            <section className="mx-auto flex min-h-screen max-w-xl items-center px-4">
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5 rounded-xl bg-slate-100 p-4 text-center dark:bg-slate-800">
                  <Timer
                    exDate={memberExamOne.shalgalt.shalgaltHugatsaa}
                    css="tracking-widest text-xl font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>

                <h1 className="text-center text-2xl font-bold">
                  Сорил эхлүүлэх
                </h1>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="mb-2 text-sm font-bold uppercase text-slate-500 dark:text-slate-400">
                    Зөвлөмж
                  </p>

                  <div className="prose max-w-none text-base leading-8 text-slate-700 dark:prose-invert dark:text-slate-300">
                    {renderRichText(
                      decode(memberExamOne.shalgalt?.introduction || "")
                    )}
                  </div>
                </div>

                {userInfoText && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                    <b>Шалгуулагч:</b> {userInfoText}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleStartExam}
                  disabled={isSaving}
                  className="app-button-primary mt-5 w-full"
                >
                  Эхлүүлэх
                </button>
              </div>
            </section>
          )}

          {isWorking && (
            <section className="mx-auto max-w-[1600px] px-3 py-4 pb-36 sm:px-5 xl:px-8 xl:pb-4">
              <div className="sticky top-16 z-30 mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Үлдсэн хугацаа
                    </p>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 xl:text-2xl">
                      <TimerMember
                        exDate={memberExamOne.info.memberTime}
                        css="tracking-widest font-bold"
                        onExpire={() => {
                          setTimeExpired(true);
                          finishExam();
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <b>{memberExamOne?.info?.member_name}</b>
                    <div className="text-xs">
                      {memberExamOne?.info?.member_school}{" "}
                      {memberExamOne?.info?.member_class &&
                        `• ${memberExamOne.info.member_class}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold dark:bg-slate-800 xl:text-base">
                      Хариулсан: {answeredCount}/{totalCount}
                    </div>

                    <div className="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      Анхааруулга: {warningCount}
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 xl:text-base"
                      onClick={() => setEndOpen(true)}
                      disabled={isSaving}
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                      {timeExpired ? "Илгээхийг дахин оролдох" : "Дуусгах"}
                    </button>

                    {!isFullscreenState && (
                      <button
                        type="button"
                        onClick={requestFullScreen}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Дэлгэц дүүргэж харах
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {testType === "Олон сонголттой" && (
                <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200 xl:text-base">
                  Та <b>{testOnestate.tooZuv}</b> хариулт сонгоно уу.
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 xl:text-sm">
                          {testType || "Даалгавар"}
                        </span>

                        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 xl:text-sm">
                          Асуулт {currentIndex >= 0 ? currentIndex + 1 : 0} /{" "}
                          {normalTests.length}
                        </span>

                        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 xl:text-sm">
                          {selectedTest?.testsan_id?.points || 0} оноо
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={goPrevQuestion}
                        disabled={currentIndex <= 0}
                        className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
                          currentIndex <= 0
                            ? "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            : "bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
                        }`}
                      >
                        ← Өмнөх
                      </button>

                      <button
                        type="button"
                        onClick={goNextQuestion}
                        disabled={
                          currentIndex === -1 ||
                          currentIndex >= normalTests.length - 1
                        }
                        className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
                          currentIndex === -1 ||
                          currentIndex >= normalTests.length - 1
                            ? "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        Дараах →
                      </button>
                    </div>
                  </div>
                </div>

                {/* НЭГ БАГЦ SCROLL */}
                <div className="max-h-none overflow-visible xl:max-h-[calc(100vh-335px)] xl:overflow-y-auto">
                  <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800 xl:border-b-0 xl:border-r xl:p-6">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 xl:text-sm">
                        Асуулт
                      </p>

                      <div className="prose max-w-none break-words overflow-hidden text-base leading-8 dark:prose-invert sm:text-lg xl:text-xl xl:leading-10">
                        {renderRichText(
                          decode(selectedTest?.testsan_id?.question || "")
                        )}
                      </div>
                    </div>

                    <fieldset disabled={timeExpired || isSaving || isAnswerSaving} className="min-w-0 p-4 xl:p-6">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 xl:text-sm">
                        Хариулт
                      </p>

                      {needsAnswerFields && (
                        <button type="button" className="app-button-secondary mb-3" onClick={prepareAnswerFields}>
                          Хариултын талбар ачаалах
                        </button>
                      )}

                      {timeExpired && <p role="status" className="text-sm font-bold text-amber-700 dark:text-amber-300">Хугацаа дууссан. Хадгалсан хариултыг илгээнэ.</p>}
                      {!timeExpired && (isAnswerSaving || hasCurrentDraft || currentAnswerSave) && (
                        <p role="status" className="text-sm text-slate-600 dark:text-slate-300">
                          {isAnswerSaving ? "Хадгалж байна…" : currentAnswerSave?.saved === false
                            ? "Хадгалж чадсангүй. Дахин оролдоно уу."
                            : hasCurrentDraft ? "Хадгалаагүй ноорог" : "Хадгалагдсан"}
                        </p>
                      )}
                      {draftStorageError && <p role="status" className="text-sm text-amber-700">Нооргийг энэ хөтөч дээр хадгалж чадсангүй.</p>}
                      {testType === "Задгай даалгавар" && (
                        <div className="space-y-3">
                          {savedAnswers.map((item) => (
                            <div key={item._id} className="flex">
                              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 px-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 xl:text-base">
                                {item.answer}
                              </span>

                              <input
                                maxLength={1}
                                aria-label={item.answer || "Хариулт"}
                                value={drafts[draftId(item._id)] ?? item.value ?? ""}
                                onChange={(event) => changeDraft(draftId(item._id), event.target.value)}
                                type="text"
                                className="w-full rounded-r-lg border border-slate-200 bg-white p-3 text-base outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 xl:text-lg"
                                placeholder="Хариулт"
                              />
                              <button type="button" className="app-button-secondary" disabled={drafts[draftId(item._id)] === undefined}
                                onClick={async () => {
                                  const key = draftId(item._id);
                                  if (await saveAnswer(workTest2, questionId, { _id: item._id, value: drafts[key] }, examId, templateId)) changeDraft(key);
                                }}>Хадгалах</button>
                            </div>
                          ))}
                        </div>
                      )}

                      {testType === "Эсээ" && (
                        <div className="space-y-3">
                          <textarea
                            aria-label="Эсээний хариулт"
                            onChange={(event) => changeDraft(draftId("essay"), event.target.value)}
                            rows={8}
                            className="w-full rounded-lg border border-slate-200 bg-white p-4 text-base outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 xl:text-lg"
                            placeholder="Эсээ бичих..."
                            value={drafts[draftId("essay")] ?? savedAnswers[0]?.value ?? ""}
                          />

                          <button
                            type="button"
                            onClick={async () => {
                              const key = draftId("essay");
                              const value = drafts[key];
                              const saved = savedAnswers[0]?._id
                                ? await saveAnswer(workTest2, questionId, { value, _id: savedAnswers[0]._id }, examId, templateId)
                                : await saveAnswer(workTest, questionId, templateId, [{ value, _id: templateId }], examId);
                              if (saved) changeDraft(key);
                            }}
                            disabled={drafts[draftId("essay")] === undefined}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 xl:text-base"
                          >
                            Хадгалах
                          </button>
                        </div>
                      )}

                      {testType === "Нөхөх" && (
                        <div>
                          {savedAnswers.map((item) => (
                            <div key={item._id} className="flex">
                              <input
                                aria-label="Нөхөх хариулт"
                                value={drafts[draftId(item._id)] ?? item.value ?? ""}
                                onChange={(event) => changeDraft(draftId(item._id), event.target.value)}
                                type="text"
                                className="w-full rounded-l-lg border border-slate-200 bg-white p-3 text-base outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 xl:text-lg"
                                placeholder="Хариулт оруулах"
                              />

                              <button
                                type="button"
                                disabled={drafts[draftId(item._id)] === undefined}
                                onClick={async () => {
                                  const key = draftId(item._id);
                                  if (await saveAnswer(workTest2, questionId, { _id: item._id, value: drafts[key] }, examId, templateId)) changeDraft(key);
                                }}
                                className="rounded-r-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 xl:text-base"
                              >
                                Хадгалах
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {(testType === "Нэг сонголттой" ||
                        testType === "Олон сонголттой") && (
                        <ul className="grid gap-3">
                          {selectedTest?.testsan_id?.answers?.map((item) => {
                            const checked =
                              savedAnswers.some((el) => el._id === item._id);

                            return (
                              <li key={item._id}>
                                <button
                                  aria-pressed={checked}
                                  type="button"
                                  onClick={() => {
                                    if (testType === "Олон сонголттой") {
                                      const currentAnswerIndex =
                                        savedAnswers.findIndex(
                                          (obj) => obj._id === item._id
                                        );

                                      const newChecked = [
                                        ...savedAnswers,
                                      ];

                                      if (currentAnswerIndex === -1) {
                                        if (Number(testOnestate?.tooZuv) === newChecked.length) {
                                          toast.error(
                                            `Та ${testOnestate.tooZuv} хариулт сонгох боломжтой`
                                          );
                                          return;
                                        } else {
                                          newChecked.push({
                                            _id: item._id,
                                            value: "",
                                          });
                                        }
                                      } else {
                                        newChecked.splice(
                                          currentAnswerIndex,
                                          1
                                        );
                                      }

                                      saveAnswer(workTest,
                                        selectedTest?._id,
                                        selectedTest?.testsan_id?._id,
                                        newChecked,
                                        memberExamOne?.shalgalt?._id
                                      );
                                    } else {
                                      saveAnswer(workTest,
                                        selectedTest?._id,
                                        selectedTest?.testsan_id?._id,
                                        [{ _id: item._id, value: "" }],
                                        memberExamOne?.shalgalt?._id
                                      );
                                    }
                                  }}
                                  className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left text-base leading-7 transition sm:text-lg xl:text-xl xl:leading-9 ${
                                    checked
                                      ? "border-blue-500 bg-blue-50 text-slate-900 dark:border-blue-500 dark:bg-slate-800 dark:text-white"
                                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                  }`}
                                >
                                  <span
                                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                      checked
                                        ? "border-blue-500 bg-blue-500 text-white"
                                        : "border-slate-300 bg-white dark:border-slate-500 dark:bg-slate-900"
                                    }`}
                                  >
                                    {checked && (
                                      <CheckCircleIcon className="h-5 w-5" />
                                    )}
                                  </span>

                                  <div className="flex-1 break-words overflow-hidden">
                                    {renderRichText(
                                      decode(item.answer || "")
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </fieldset>
                  </div>
                </div>
              </div>

              {/* <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:mt-4 xl:rounded-t-xl xl:border xl:shadow-sm"> */}
                <div className="mt-4 rounded-t-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Даалгаврын явц
                    </p>
                    <p className="text-sm font-bold xl:text-base">
                      {answeredCount}/{totalCount} хариулсан
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-300 xl:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-3 rounded bg-blue-600" />
                      Одоогийн
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-3 rounded bg-green-600" />
                      Хариулсан
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3 w-3 rounded bg-slate-300 dark:bg-slate-700" />
                      Үлдсэн
                    </span>
                  </div>
                </div>

                <div className="max-h-28 overflow-y-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {textTests.map((item, index) => (
                      <button
                        type="button"
                        key={`text-${item._id || index}`}
                        onClick={() => {
                          getshalgaltDun(item._id);
                        }}
                        className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-bold text-white dark:bg-slate-700 xl:text-sm"
                      >
                        Текст
                      </button>
                    ))}

                    {normalTests.map((item, index) => (
                      <button
                        type="button"
                        key={item._id}
                        onClick={() => {
                          getshalgaltDun(item._id);
                        }}
                        className={`h-8 min-w-8 rounded-md px-2 text-sm font-bold transition xl:h-9 xl:min-w-9 xl:text-base ${
                          selectedTest?._id === item._id
                            ? "bg-blue-600 text-white"
                            : hasAnswer(item)
                            ? "bg-green-600 text-white"
                            : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    {essayTests.map((item, index) => (
                      <button
                        type="button"
                        key={`essay-${item._id || index}`}
                        onClick={() => {
                          getshalgaltDun(item._id);
                        }}
                        className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-bold text-white xl:text-sm"
                      >
                        Эсээ
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {!isWorking && !dunMember.success &&
            (readOnly || memberExamOne.info?.examStatus === "Дууссан") && (
            <div className="app-container py-12 text-center">
              <h1 className="text-xl font-bold">
                {memberExamOne.info?.examStatus === "Дууссан" ? "Сорилын үр дүн" : "Сорил дуусаагүй байна"}
              </h1>
              {memberExamOne.info?.examStatus === "Дууссан" && (
                <button type="button" className="app-button-secondary mt-4" onClick={() => setReload(reload + 1)}>
                  Үр дүнг дахин ачаалах
                </button>
              )}
            </div>
          )}

          {memberExamOne.info?.examStatus === "Дууссан" &&
            dunMember.success && (
              <section className="mx-auto flex min-h-screen max-w-lg items-center px-4">
                <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-center text-white">
                    <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
                      Сорилын үр дүн
                    </p>

                    <h1 className="mt-2 text-2xl font-extrabold">
                      Таны гүйцэтгэл
                    </h1>

                    <div className="mt-6 flex justify-center">
                      <div
                        className="relative flex h-40 w-40 items-center justify-center rounded-full"
                        style={{
                          background: `conic-gradient(#ffffff ${
                            dunMember.shalgaltdun?.unelgee?.dun || 0
                          }%, rgba(255,255,255,0.2) 0)`,
                        }}
                      >
                        <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-blue-700">
                          <span className="text-4xl font-extrabold">
                            {dunMember.shalgaltdun?.unelgee?.dun || 0}%
                          </span>
                          <span className="mt-1 text-xs text-white/80">
                            гүйцэтгэл
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Нийт тест", dunMember.shalgaltdun?.niitTest],
                        ["Нийт оноо", dunMember.shalgaltdun?.onooNiitTest],
                        ["Зөв хариулсан", dunMember.shalgaltdun?.tooZuvHariu],
                        ["Авсан оноо", dunMember.shalgaltdun?.onooZuvHariu],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800"
                        >
                          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                            {label}
                          </p>
                          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {memberExamOne.shalgalt?.isOpenAnswer && (
                      <button
                        type="button"
                        onClick={() => setDunOpen(true)}
                        className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                      >
                        Дэлгэрэнгүй харах
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}
        </>
      )}
    </section>
  );
};

export default function ExamWorkRoute() {
  const { eid, sid } = useParams();
  const { user } = useContext(MainContext);
  const readOnly = user?.role === "surguuli" && Boolean(sid);
  const memberId = readOnly ? sid : user?.id;
  return <ExamWork key={`${eid}:${memberId}`} eid={eid} memberId={memberId} readOnly={readOnly} />;
}
