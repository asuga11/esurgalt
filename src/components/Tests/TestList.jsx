import { Fragment, useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { decode } from "html-entities";
import { PlusIcon } from "@heroicons/react/20/solid";
import JoditEditor from "jodit-react";
import MainContext from "../../Context/MainContext";
import renderRichText, { sanitizeRichText } from "../../renderRichText";
import DeleteModal from "../DeleteModal";
import CollectionState from "../General/CollectionState";
import { getAnswerWarning, getQuestionWarning, hasQuestionContent } from "../Exam/examReadiness";
import { toast } from "react-hot-toast";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const editorFields = ["question", "survey", "guidance", "calculation"];

export default function TestList({ huv, questionToEdit, onQuestionEditorClose }) {
  const themes = localStorage.getItem("theme");

  const {
    getTestSan,
    testSanState,
    user,
    getTestHicheel,
    hicheelState,
    getTest,
    testOnestate,
    setTestOneState,
    addTest,
    updateTest,
    deleteTest,
    deleteAnswwer,
    addAnswwer,
    updateAnswwer,
    shalgaltOne,
    addExamTest,
    removeExamTest,
  } = useContext(MainContext);

  const [edit1, setedit1] = useState(false);
  const [answerState, setAnswerState] = useState({});
  const [questionError, setQuestionError] = useState("");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const questionSavePending = useRef(false);
  const questionRequest = useRef(null);
  const [failedQuestion, setFailedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const editorTitle = isEditing ? "Асуулт засах" : "Шинэ асуулт";

  const handleChangeetestOnestate = (prop) => (event) => {
    setTestOneState({ ...testOnestate, [prop]: event.target.value });
  };
  const [tab, settab] = useState(0);
  const [filter, setfilter] = useState({
    hicheel: "",
    aguulga: "",
    limit: 5,
    page: 1,
    yesh: false,
  });
  const [revision, setRevision] = useState(0);
  const [subjectRevision, setSubjectRevision] = useState(0);
  const [listStatus, setListStatus] = useState("loading");
  const [subjectStatus, setSubjectStatus] = useState("loading");
  const refreshList = () => setRevision((value) => value + 1);
  const refreshSubjects = () => setSubjectRevision((value) => value + 1);
  const owner = filter.yesh ? "" : user?.id;
  const loadList = useEffectEvent((query, signal) => getTestSan(owner, query.hicheel, query.aguulga, query.limit, query.page, signal));
  const loadSubjects = useEffectEvent((signal) => getTestHicheel(owner, signal));
  useEffect(() => {
    if (owner == null) return;
    const controller = new AbortController();
    setListStatus("loading");
    Promise.resolve(loadList(filter, controller.signal)).then((loaded) => {
      if (!controller.signal.aborted) setListStatus(loaded === false ? "error" : "ready");
    });
    return () => controller.abort();
  }, [owner, filter, revision]);
  useEffect(() => {
    if (owner == null) return;
    const controller = new AbortController();
    setSubjectStatus("loading");
    Promise.resolve(loadSubjects(controller.signal)).then((loaded) => {
      if (!controller.signal.aborted) setSubjectStatus(loaded === false ? "error" : "ready");
    });
    return () => controller.abort();
  }, [owner, subjectRevision]);

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    if (questionSavePending.current) return;
    questionRequest.current?.abort();
    setQuestionError("");
    setTestOneState(null);
    setIsOpen(false);
    onQuestionEditorClose?.();
  }

  function openModal() {
    setIsOpen(true);
  }

  function editQuestion(id) {
    questionRequest.current?.abort();
    const controller = new AbortController();
    questionRequest.current = controller;
    setQuestionError("");
    setFailedQuestion(null);
    setIsEditing(true);
    setTestOneState(null);
    settab(0);
    openModal();
    Promise.resolve(getTest(id, controller.signal)).then((loaded) => {
      if (!controller.signal.aborted && loaded === false) setFailedQuestion(id);
    });
  }
  const openRequestedQuestion = useEffectEvent(editQuestion);
  useEffect(() => () => questionRequest.current?.abort(), []);
  useEffect(() => {
    if (questionToEdit) openRequestedQuestion(questionToEdit);
  }, [questionToEdit]);

  const editor = useRef(null);

  function selectEditorTab(index) {
    if (index === tab) return;
    const value = editor.current?.value;
    if (typeof value === "string") {
      setTestOneState((current) => ({ ...current, [editorFields[tab]]: value }));
    }
    setQuestionError("");
    settab(index);
  }

  async function saveQuestion(action) {
    if (!testOnestate || questionSavePending.current) return;
    const field = editorFields[tab];
    const content = editor.current?.value;
    const question = typeof content === "string" ? { ...testOnestate, [field]: content } : testOnestate;
    const warning = action === "answer"
      ? (!hasQuestionContent(question.question) ? "Хариулт нэмэхийн өмнө асуултаа оруулна уу." : "")
      : getQuestionWarning(question);
    setQuestionError(warning);
    if (warning) return;

    questionSavePending.current = true;
    setIsSavingQuestion(true);
    let saved;
    try {
      saved = question._id
        ? await updateTest(question)
        : await addTest(question);
    } finally {
      questionSavePending.current = false;
      setIsSavingQuestion(false);
    }
    if (!saved) {
      setQuestionError("Асуултыг хадгалж чадсангүй. Дахин оролдоно уу.");
      return;
    }
    refreshList();
    refreshSubjects();
    if (action === "close") closeModal();
    if (action === "answer") {
      setAnswerState({});
      setedit1(false);
      openAnswer();
    }
  }
  const config = {
    readonly: false,
    placeholder: "Бичиж эхлэх...",
    buttons:
      "subscript,bold,underline,superscript,strikethrough,table,ul,ol,font,fontsize,paragraph,image,video,preview,indent,outdent,brush,hr",
    uploader: {
      insertImageAsBase64URI: true,
    },
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    autofocus: false,

    theme: themes,
  };

  let [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function openDeleteModal() {
    setIsDeleteOpen(true);
  }
  function closeDeleteModal() {
    setTestOneState(null);
    setIsDeleteOpen(false);
  }
  let [answerOpen, setAnswerOpen] = useState(false);

  function openAnswer() {
    setAnswerOpen(true);
  }
  function clooseAnswer() {
    setAnswerOpen(false);
  }
  const questions = testSanState?.testsan ?? [];
  const pagination = testSanState?.pagination ?? {};
  const subjects = hicheelState?.content ?? [];
  const topics = subjects.find((subject) => subject.hicheel_name === filter.hicheel)?.aguulga_name ?? [];
  const selectedQuestions = new Set(shalgaltOne?.listTests?.map((question) => question._id));

  function clearFilters() {
    setfilter((current) => ({ ...current, hicheel: "", aguulga: "", page: 1 }));
  }
  function changeBank(yesh) {
    if (yesh !== filter.yesh) setfilter({ ...filter, yesh, hicheel: "", aguulga: "", page: 1 });
  }
  function createQuestion() {
    questionRequest.current?.abort();
    settab(0);
    setQuestionError("");
    setIsEditing(false);
    setTestOneState({
      material: false,
      testStatus: false,
      points: 1,
      zuvHariuZad: [],
      isActive: true,
      owner_id: user.id,
      owner_name: user.name,
      owner_role: user.role,
      hicheel_name: filter.hicheel || "",
      aguulga_name: filter.aguulga || "",
      testLevel: "Сэргээн санах",
      testType: "Нэг сонголттой",
      jil: "0",
      huvilbar: "0",
      testNumber: "0",
      calculation: "",
      survey: "",
      guidance: "",
      question: "",
      answers: [],
    });
    openModal();
  }

  async function deleteQuestion(id) {
    if (!await deleteTest(id)) return;
    if (questions.length === 1 && filter.page > 1) setfilter((current) => ({ ...current, page: Math.max(1, current.page - 1) }));
    else refreshList();
    refreshSubjects();
  }

  return (
    <div className="min-w-0">
      {isDeleteOpen && testOnestate && (
        <DeleteModal
          closeDeleteModal={closeDeleteModal}
          deletefunc={deleteQuestion}
          data={testOnestate}
          filter={filter}
        />
      )}
      {/* Anseredit */}

      <Transition appear show={answerOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30 " onClose={clooseAnswer}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                  <div className="relative w-full h-full md:h-auto">
                    <div className="relative rounded-[1.25rem] bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100">
                      <button
                        onClick={() => {
                          clooseAnswer();
                        }}
                        type="button"
                        className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                        data-modal-toggle="popup-modal"
                      >
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="sr-only">Хариултын цонх хаах</span>
                      </button>
                      <Dialog.Title className="px-6 pt-5 text-lg font-extrabold">
                        {edit1 ? "Хариулт засах" : "Хариулт нэмэх"}
                      </Dialog.Title>
                      {(testOnestate?.testType === "Нэг сонголттой" ||
                        testOnestate?.testType === "Олон сонголттой") && (
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <input
                              checked={answerState.correct}
                              onChange={(event) => {
                                setAnswerState({
                                  ...answerState,
                                  correct: event.target.checked,
                                });
                              }}
                              type="checkbox"
                              className="w-5 h-5 text-green-600 bg-gray-100 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 cursor-pointer focus:ring-green-500"
                            />
                            <label
                              htmlFor="default-checkbox"
                              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                            >
                              Зөв хариу эсэх
                            </label>
                          </div>

                          <div className="mt-2">
                            <JoditEditor
                              ref={editor}
                              value={sanitizeRichText(decode(answerState.answer))}
                              config={config}
                              tabIndex={1}
                              onBlur={(newContent) => {
                                setAnswerState({
                                  ...answerState,
                                  answer: newContent,
                                });
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const content = editor.current?.value;
                              const answer = typeof content === "string" ? { ...answerState, answer: content } : answerState;
                              const warning = getAnswerWarning(testOnestate.testType, answer);
                              if (warning) { toast.error(warning); return; }
                              if (edit1) {
                                updateAnswwer(testOnestate._id, answer);
                              } else {
                                addAnswwer(testOnestate._id, answer);
                              }
                              setedit1(false);
                              clooseAnswer();
                            }}
                            type="button"
                            className="text-white bg-[#2557D6] hover:bg-[#2557D6]/90  font-medium rounded-lg text-sm px-4 py-1 text-center inline-flex items-center  mr-2 mb-2 gap-2 mt-2"
                          >
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                            Хадгалах
                          </button>
                        </div>
                      )}
                      {testOnestate?.testType === "Задгай даалгавар" && (
                        <div className="p-6">
                          <div className=" w-full space-y-4 mt-8">
                            <label
                              htmlFor="answer-key"
                              className="block text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Түлхүүр
                            </label>
                            <input
                              maxLength={1}
                              value={answerState?.answer}
                              onChange={(e) => {
                                setAnswerState({
                                  ...answerState,
                                  answer: e.target.value.trim(),
                                  correct: true,
                                });
                              }}
                              type="search"
                              id="search"
                              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Түлхүүр"
                              required
                            />
                            <label
                              htmlFor="answer-value"
                              className="block text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Утга
                            </label>
                            <input
                              maxLength={1}
                              value={answerState?.value}
                              onChange={(e) => {
                                setAnswerState({
                                  ...answerState,
                                  value: e.target.value.trim(),
                                  correct: true,
                                });
                              }}
                              type="search"
                              id="answer-value"
                              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Утга"
                              required
                            />
                            <label
                              htmlFor="answer-score"
                              className="block text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Оноо
                            </label>
                            <input
                              value={answerState?.score}
                              onChange={(e) => {
                                setAnswerState({
                                  ...answerState,
                                  score: parseFloat(e.target.value.trim()),
                                  correct: true,
                                });
                              }}
                              type="number"
                              id="answer-score"
                              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Оноо"
                              required
                            />
                            <button
                              onClick={() => {
                                const warning = getAnswerWarning(testOnestate.testType, answerState);
                                if (warning) {
                                  toast.error(warning);
                                } else {
                                  if (edit1) {
                                    updateAnswwer(
                                      testOnestate?._id,
                                      answerState
                                    );
                                  } else {
                                    addAnswwer(testOnestate?._id, answerState);
                                  }
                                  setedit1(false);
                                  setAnswerState({
                                    correct: true,
                                    answer: "",
                                    value: "",
                                    score: 0,
                                  });
                                  clooseAnswer();
                                }
                              }}
                              className="text-white  bg-orange-600 hover:bg-orange-700  font-medium rounded-lg text-sm px-4 py-1 dark:bg-orange-600 dark:hover:bg-orange-700 "
                            >
                              Хариу хадгалах
                            </button>
                          </div>
                        </div>
                      )}{" "}
                      {testOnestate?.testType === "Нөхөх" && (
                        <div className="p-6">
                          <div className="w-full space-y-4 mt-8">
                            <input
                              value={answerState.answer}
                              onChange={(e) => {
                                setAnswerState({
                                  ...answerState,
                                  answer: e.target.value.trim(),
                                  correct: true,
                                });
                              }}
                              type="search"
                              id="search"
                              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Хариу оруулах"
                              required
                            />

                            <button
                              onClick={() => {
                                const warning = getAnswerWarning(testOnestate.testType, answerState);
                                if (warning) {
                                  toast.error(warning);
                                } else {
                                  if (edit1) {
                                    updateAnswwer(
                                      testOnestate._id,
                                      answerState
                                    );
                                  } else {
                                    addAnswwer(testOnestate._id, answerState);
                                  }
                                  setedit1(false);
                                  setAnswerState({
                                    correct: true,
                                    answer: "",
                                    value: "",
                                  });
                                  clooseAnswer();
                                }
                              }}
                              className="text-white  bg-orange-600 hover:bg-orange-700  font-medium rounded-lg text-sm px-4 py-1 dark:bg-orange-600 dark:hover:bg-orange-700 "
                            >
                              Хариу хадгалах
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Add Test */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px]" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={classNames(
                    "w-full transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all",
                    "max-w-6xl"
                  )}
                >
                  <div
                    className={classNames("relative w-full h-full  md:h-auto")}
                  >
                    <div className="relative rounded-[1.25rem] bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-slate-100">
                      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6">
                        <Dialog.Title className="text-xl font-extrabold">{editorTitle}</Dialog.Title>
                        <button type="button" className="app-icon-button" aria-label="Асуултын цонх хаах"
                          disabled={isSavingQuestion} onClick={closeModal}>
                          <XMarkIcon aria-hidden="true" className="size-5" />
                        </button>
                      </header>
                      {!testOnestate ? <div className="p-4 sm:p-6">
                        {failedQuestion ? <CollectionState state="error" title="Асуултыг ачаалж чадсангүй"
                          actionLabel="Дахин ачаалах" action={() => editQuestion(failedQuestion)} />
                          : <CollectionState state="loading" title="Асуултыг ачаалж байна…" />}
                      </div> : <div className="min-w-0 px-4 py-4 sm:px-6">
                        <div role="group" aria-label="Асуултын хэсгүүд" className="mb-4 flex flex-wrap gap-1 border-b border-slate-200 pb-3 dark:border-slate-700">
                          {["Асуулт ба хариулт", "Шинжилгээ", "Заавар", "Бодолт"].map((item, index) => (
                            <button key={item} type="button" aria-pressed={tab === index} disabled={isSavingQuestion}
                              className="app-filter-chip" onClick={() => selectEditorTab(index)}>{item}</button>
                          ))}
                        </div>
                        {tab === 0 && (
                          <div>
                            {testOnestate && (
                              <div className="space-y-4">
                                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
                                  <div className="w-full">
                                    <label
                                      htmlFor="question-type"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Тестийн төрөл
                                    </label>
                                    <select
                                      onChange={handleChangeetestOnestate(
                                        "testType"
                                      )}
                                      value={testOnestate.testType} id="question-type"
                                      className="app-field"
                                    >
                                      <option value="">Төрөл сонгоно уу</option>
                                      {[
                                        "Нэг сонголттой",
                                        "Олон сонголттой",
                                        "Задгай даалгавар",
                                        "Нөхөх",
                                        "Эсээ",
                                        "Текст",
                                      ].map((el, index) => (
                                        <option key={index} value={el}>
                                          {el}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="question-points"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Оноо
                                    </label>
                                    <input
                                      disabled={
                                        testOnestate?.testType ===
                                        "Задгай даалгавар"
                                          ? true
                                          : false
                                      }
                                      onChange={handleChangeetestOnestate(
                                        "points"
                                      )}
                                      value={testOnestate?.points}
                                      type="number"
                                      name="name"
                                      id="question-points"
                                      className="app-field"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <label
                                      htmlFor="question-subject"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Хичээлийн нэр
                                    </label>
                                    <input
                                      onChange={handleChangeetestOnestate(
                                        "hicheel_name"
                                      )}
                                      value={testOnestate.hicheel_name}
                                      type="text"
                                      name="name"
                                      id="question-subject"
                                      className="app-field"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="question-topic"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Сэдвийн нэр
                                    </label>
                                    <input
                                      onChange={handleChangeetestOnestate(
                                        "aguulga_name"
                                      )}
                                      value={testOnestate.aguulga_name}
                                      type="text"
                                      name="name"
                                      id="question-topic"
                                      className="app-field"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex w-full gap-4">
                                  <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setTestOneState({
                                          ...testOnestate,
                                          testStatus: e.target.checked,
                                        });
                                      }}
                                      checked={testOnestate.testStatus}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-700" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      Нийтийн
                                    </span>
                                  </label>
                                  <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setTestOneState({
                                          ...testOnestate,
                                          material: e.target.checked,
                                        });
                                      }}
                                      checked={testOnestate.material}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-700" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      ЭЕШ
                                    </span>
                                  </label>
                                </div>
                                {testOnestate.material && (
                                  <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                      <label
                                        htmlFor="question-year"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Он
                                      </label>
                                      <input
                                        onChange={handleChangeetestOnestate(
                                          "jil"
                                        )}
                                        value={testOnestate.jil}
                                        type="number"
                                        name="name"
                                        id="question-year"
                                        className="app-field"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="question-variant"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Хувилбар
                                      </label>
                                      <input
                                        onChange={handleChangeetestOnestate(
                                          "huvilbar"
                                        )}
                                        value={testOnestate.huvilbar}
                                        type="text"
                                        name="name"
                                        id="question-variant"
                                        className="app-field"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="question-number"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Дугаар
                                      </label>
                                      <input
                                        onChange={handleChangeetestOnestate(
                                          "testNumber"
                                        )}
                                        value={testOnestate.testNumber}
                                        type="number"
                                        name="name"
                                        id="question-number"
                                        className="app-field"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Асуулт
                                  </p>
                                  <JoditEditor
                                    ref={editor}
                                    value={sanitizeRichText(decode(testOnestate.question))}
                                    config={config}
                                    tabIndex={1}
                                    onBlur={(newContent) => {
                                      setTestOneState({
                                        ...testOnestate,
                                        question: newContent,
                                      });
                                    }}
                                  />
                                </div>

                                {!["Текст", "Эсээ"].includes(testOnestate.testType) && (
                                  <section aria-label="Хариултууд" className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <h3 className="text-base font-extrabold">Хариултууд</h3>
                                      <button type="button" className="app-button-secondary" disabled={isSavingQuestion} onClick={() => saveQuestion("answer")}>
                                        <PlusIcon aria-hidden="true" className="size-5" /> Хариулт нэмэх
                                      </button>
                                    </div>
                                    {["Нэг сонголттой", "Олон сонголттой"].includes(testOnestate.testType) && (
                                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        {testOnestate.testType === "Нэг сонголттой" ? "Нэг зөв хариултыг тэмдэглэнэ үү." : "Зөв хариултуудаа тэмдэглэнэ үү."}
                                      </p>
                                    )}
                                    {testOnestate.answers?.length ? (
                                      <ol className="mt-3 grid gap-2">
                                        {testOnestate.answers.map((item, index) => (
                                          <li key={item._id ?? index} className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                                            <p className="mb-1 text-xs font-bold text-slate-600 dark:text-slate-300">Хариулт {index + 1}</p>
                                            <div className="prose prose-slate max-w-none break-words dark:prose-invert">{renderRichText(decode(item.answer))}</div>
                                            {testOnestate.testType === "Задгай даалгавар" && <p className="mt-1 text-sm">Утга {item.value} · {item.score} оноо</p>}
                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
                                                <input type="checkbox" checked={!!item.correct}
                                                  onChange={(event) => updateAnswwer(testOnestate._id, { ...item, correct: event.target.checked })}
                                                  className="size-4 accent-orange-700" />
                                                Зөв хариулт
                                              </label>
                                              <div className="flex items-center">
                                                <button type="button" className="app-icon-button" aria-label={"Хариулт " + (index + 1) + " засах"}
                                                  onClick={() => { setedit1(true); setAnswerState(item); openAnswer(); }}>
                                                  <PencilIcon aria-hidden="true" className="size-4" />
                                                </button>
                                                <button type="button" className="app-icon-button text-rose-700 dark:text-rose-300"
                                                  aria-label={"Хариулт " + (index + 1) + " устгах"} onClick={() => deleteAnswwer(testOnestate._id, item._id)}>
                                                  <TrashIcon aria-hidden="true" className="size-4" />
                                                </button>
                                              </div>
                                            </div>
                                          </li>
                                        ))}
                                      </ol>
                                    ) : <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Хариулт нэмээгүй байна.</p>}
                                  </section>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {tab === 1 && (
                          <div className="space-y-2 dark:text-white">
                            <JoditEditor
                              ref={editor}
                              value={sanitizeRichText(decode(testOnestate?.survey))}
                              config={config}
                              tabIndex={1}
                              onBlur={(newContent) => {
                                setTestOneState({
                                  ...testOnestate,
                                  survey: newContent,
                                });
                              }}
                            />
                          </div>
                        )}
                        {tab === 2 && (
                          <div className="space-y-2 dark:text-white">
                            <JoditEditor
                              ref={editor}
                              value={sanitizeRichText(decode(testOnestate?.guidance))}
                              config={config}
                              tabIndex={1}
                              onBlur={(newContent) => {
                                setTestOneState({
                                  ...testOnestate,
                                  guidance: newContent,
                                });
                              }}
                            />
                          </div>
                        )}{" "}
                        {tab === 3 && (
                          <div className="space-y-2 dark:text-white">
                            <JoditEditor
                              ref={editor}
                              value={sanitizeRichText(decode(testOnestate?.calculation))}
                              config={config}
                              tabIndex={1}
                              onBlur={(newContent) => {
                                setTestOneState({
                                  ...testOnestate,
                                  calculation: newContent,
                                });
                              }}
                            />
                          </div>
                        )}
                        {questionError && <p role="alert" className="mt-2 text-sm font-bold text-red-700 dark:text-red-300">{questionError}</p>}
                        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
                          <button
                            onClick={() => saveQuestion("close")}
                            disabled={isSavingQuestion}
                            type="button"
                            className="app-button-secondary"
                          >
                            Хадгалаад гарах
                          </button>
                          <button
                            onClick={() => saveQuestion("save")}
                            disabled={isSavingQuestion}
                            type="button"
                            className="app-button-primary"
                          >
                            {isSavingQuestion ? "Хадгалж байна…" : "Хадгалах"}
                          </button>
                        </div>
                      </div>}
                    </div>

                    {/* Modal content */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <section className="mx-auto grid min-w-0 gap-4" aria-labelledby="test-bank-title">
        <header className={huv ? "flex flex-wrap items-center justify-between gap-3" : "app-banner flex flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-7"}>
          <div>
            <h2 id="test-bank-title" className="text-xl font-extrabold sm:text-2xl">{huv ? "Сорилд асуулт сонгох" : "Тестийн сан"}</h2>
            <p className={huv ? "mt-1 text-sm text-slate-600 dark:text-slate-300" : "mt-1 text-sm text-orange-200"}>
              {huv ? "Оруулах асуултынхаа нүдийг чагтална уу." : "Асуултаа хичээл, сэдвээр шүүж олох эсвэл шинээр нэмнэ үү."}
            </p>
          </div>
          {!huv && <button type="button" className="app-button-primary" onClick={createQuestion}>
            <PlusIcon aria-hidden="true" className="size-5" /> Тест нэмэх
          </button>}
        </header>

        <div className="app-panel grid gap-4 p-4" aria-label="Асуултын шүүлтүүр">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div role="group" aria-label="Асуултын сан" className="flex flex-wrap gap-1">
              <button type="button" className="app-filter-chip" aria-pressed={!filter.yesh} onClick={() => changeBank(false)}>Миний асуултууд</button>
              <button type="button" className="app-filter-chip" aria-pressed={filter.yesh} onClick={() => changeBank(true)}>ЭЕШ-ийн сан</button>
            </div>
            {(filter.hicheel || filter.aguulga) && <button type="button" className="app-button-secondary" onClick={clearFilters}>Шүүлтүүр арилгах</button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="grid min-w-0 gap-1.5 text-sm font-bold">
              Хичээл
              <select className="app-field" value={filter.hicheel} disabled={subjectStatus !== "ready"}
                onChange={(event) => setfilter({ ...filter, hicheel: event.target.value, aguulga: "", page: 1 })}>
                <option value="">Бүх хичээл</option>
                {subjects.map((subject) => <option key={subject.hicheel_name} value={subject.hicheel_name}>
                  {subject.hicheel_name}{subject.testToo != null ? " (" + subject.testToo + ")" : ""}
                </option>)}
              </select>
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-bold">
              Сэдэв
              <select className="app-field" value={filter.aguulga} disabled={subjectStatus !== "ready" || !topics.length}
                onChange={(event) => setfilter({ ...filter, aguulga: event.target.value, page: 1 })}>
                <option value="">{filter.hicheel ? "Бүх сэдэв" : "Эхлээд хичээл сонгоно уу"}</option>
                {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold">
              Хуудасны хэмжээ
              <select className="app-field" value={filter.limit}
                onChange={(event) => setfilter({ ...filter, limit: Number(event.target.value), page: 1 })}>
                {[5, 25, 50, 100].map((limit) => <option key={limit} value={limit}>{limit} асуулт</option>)}
              </select>
            </label>
          </div>
          {subjectStatus === "error" && <div className="flex flex-wrap items-center gap-2">
            <p role="status" className="text-sm text-rose-700 dark:text-rose-300">Хичээл, сэдвийн жагсаалт ачаалагдсангүй.</p>
            <button type="button" className="app-button-secondary" onClick={refreshSubjects}>Хичээлийн жагсаалтыг дахин ачаалах</button>
          </div>}
        </div>

        {listStatus === "loading" ? <CollectionState state="loading" title="Асуултуудыг ачаалж байна…" />
          : listStatus === "error" ? <CollectionState state="error" title="Асуултуудыг ачаалж чадсангүй"
            actionLabel="Дахин ачаалах" action={refreshList} />
          : <>
            <p role="status" className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {questions.length ? <>Нийт {pagination.total ?? questions.length} асуулт · {filter.page}-р хуудас</> : "0 асуулт"}
            </p>
            {questions.length ? <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {questions.map((question, index) => {
                const number = (filter.page - 1) * filter.limit + index + 1;
                const canEdit = String(question.owner_id) === String(user?.id);
                const isSelected = selectedQuestions.has(question._id);
                return (
                  <li key={question._id} className="app-panel flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                      <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-900 dark:bg-orange-950 dark:text-orange-200">
                        {question.testType || "Асуулт"}
                      </span>
                      {question.points != null && <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{question.points} оноо</span>}
                      {question.material && <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {[question.jil, question.huvilbar, question.testNumber].filter(Boolean).join(" · ")}
                      </span>}
                    </div>
                    <div className="flex-1 p-4">
                      {(question.hicheel_name || question.aguulga_name) && <p className="mb-2 text-sm font-bold break-words text-slate-600 dark:text-slate-300">
                        {[question.hicheel_name, question.aguulga_name].filter(Boolean).join(" · ")}
                      </p>}
                      <div className="prose prose-slate max-w-none break-words [overflow-wrap:anywhere] dark:prose-invert">
                        {hasQuestionContent(question.question) ? renderRichText(decode(question.question)) : "Асуултын агуулга оруулаагүй байна."}
                      </div>
                    </div>
                    {(canEdit || (huv && shalgaltOne?.success)) && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 dark:border-slate-700">
                      {huv && shalgaltOne?.success && <label className="flex min-h-11 cursor-pointer items-center gap-2 px-1 text-sm font-bold">
                        <input type="checkbox" checked={isSelected} aria-label={"Асуулт " + number + " сорилд оруулах"}
                          onChange={(event) => (event.target.checked ? addExamTest : removeExamTest)(shalgaltOne.shalgalt._id, question._id)}
                          className="size-4 accent-orange-700" />
                        {isSelected ? "Сорилд нэмэгдсэн" : "Сорилд оруулах"}
                      </label>}
                      {canEdit && <div className="ml-auto flex items-center gap-1">
                        <button type="button" className="app-button-secondary px-3" aria-label={"Асуулт " + number + " засах"} onClick={() => editQuestion(question._id)}>
                          <PencilIcon aria-hidden="true" className="size-4" /> Засах
                        </button>
                        <button type="button" className="app-icon-button text-rose-700 dark:text-rose-300" title="Устгах"
                          aria-label={"Асуулт " + number + " устгах"} onClick={() => { setTestOneState(question); openDeleteModal(); }}>
                          <TrashIcon aria-hidden="true" className="size-5" />
                        </button>
                      </div>}
                    </div>}
                  </li>
                );
              })}
            </ul> : <CollectionState state="empty" title="Асуулт олдсонгүй"
              detail={filter.hicheel || filter.aguulga ? "Өөр хичээл эсвэл сэдэв сонгоно уу." : undefined}
              actionLabel={filter.hicheel || filter.aguulga ? "Шүүлтүүр арилгах" : !huv && !filter.yesh ? "Асуулт нэмэх" : undefined}
              action={filter.hicheel || filter.aguulga ? clearFilters : !huv && !filter.yesh ? createQuestion : undefined} />}
            {(filter.page > 1 || pagination.nextPage) && <nav aria-label="Асуултын жагсаалтын хуудас" className="flex flex-wrap items-center justify-between gap-2">
              <button type="button" className="app-button-secondary" disabled={filter.page <= 1}
                onClick={() => setfilter({ ...filter, page: filter.page - 1 })}>
                <ChevronLeftIcon aria-hidden="true" className="size-4" /> Өмнөх хуудас
              </button>
              <button type="button" className="app-button-secondary" disabled={!pagination.nextPage}
                onClick={() => setfilter({ ...filter, page: filter.page + 1 })}>
                Дараагийн хуудас <ChevronRightIcon aria-hidden="true" className="size-4" />
              </button>
            </nav>}
          </>}
      </section>
    </div>
  );
}
