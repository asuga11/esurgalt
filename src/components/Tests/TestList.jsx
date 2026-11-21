import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { decode } from "html-entities";
import { FunnelIcon, MinusIcon, PlusIcon } from "@heroicons/react/20/solid";
import JoditEditor from "jodit-react";
import MainContext from "../../Context/MainContext";
import renderRichText, { sanitizeRichText } from "../../renderRichText";
import DeleteModal from "../DeleteModal";
import { toast } from "react-hot-toast";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function TestList({ huv }) {
  const themes = localStorage.getItem("theme");
  useEffect(() => {
    getTestHicheel(user?.id);
    getTestSan(
      user?.id,
      filter?.hicheel,
      filter?.aguulga,
      filter?.limit,
      filter?.page
    );
  }, []);

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

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [edit, setedit] = useState(false);
  const [edit1, setedit1] = useState(false);
  const [answerState, setAnswerState] = useState({});

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

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setTestOneState(null);
    setIsOpen(false);
    setedit(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const editor = useRef(null);
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
  // console.log(edit1);
  return (
    <div className="bg-white dark:bg-gray-700 dark:text-white">
      {isDeleteOpen && testOnestate && (
        <DeleteModal
          closeDeleteModal={closeDeleteModal}
          deletefunc={deleteTest}
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
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
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
                        <span className="sr-only">Close modal</span>
                      </button>
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
                              if (edit1) {
                                updateAnswwer(testOnestate._id, answerState);
                              } else {
                                addAnswwer(testOnestate._id, answerState);
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
                              onClick={(e) => {
                                if (answerState.answer === "") {
                                  toast.error("Хариугаа оруулна уу!");
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
                                  setedit(true);
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
                              onClick={(e) => {
                                if (answerState.answer === "") {
                                  toast.error("Хариугаа оруулна уу!");
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
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <button
                        onClick={() => {
                          if (!edit) {
                            deleteTest(
                              testOnestate._id,
                              filter?.hicheel,
                              filter?.aguulga,
                              filter?.limit,
                              filter?.page
                            );
                          }
                          closeModal();
                        }}
                        type="button"
                        className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
                        data-modal-toggle="authentication-modal"
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
                        <span className="sr-only">Close modal</span>
                      </button>
                      <div className="px-6 py-6 lg:px-8">
                        <div className="mb-4  dark:border-gray-700">
                          <ul
                            className="flex flex-wrap -mb-px text-sm font-medium text-center dark:border-gray-500"
                            id="myTab"
                            data-tabs-toggle="#myTabContent"
                            role="tablist"
                          >
                            {["Мэдээлэл", "Шинжилгээ", "Заавар", "Бодолт"].map(
                              (item, index) => {
                                return (
                                  <li key={index} className="mr-2">
                                    <button
                                      onClick={() => {
                                        settab(index);
                                      }}
                                      className={classNames(
                                        "inline-block p-2 rounded-t-lg hover:border-b-2 border-blue-500 text-center dark:text-white",
                                        tab === index && "border-b-2 "
                                      )}
                                      id="profile-tab"
                                      data-tabs-target="#profile"
                                      type="button"
                                      role="tab"
                                      aria-controls="profile"
                                      aria-selected="false"
                                    >
                                      {item}
                                    </button>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </div>
                        {tab === 0 && (
                          <div>
                            {testOnestate && (
                              <div className="space-y-4">
                                <div className="flex gap-2 items-center w-full">
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
                                      value={testOnestate.testType} id="answer-key"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                      <option aria-label="None" value="" />
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
                                      htmlFor="name"
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
                                      id="name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 w-full gap-1">
                                  <div>
                                    <label
                                      htmlFor="name"
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
                                      id="name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Агуулга нэр
                                    </label>
                                    <input
                                      onChange={handleChangeetestOnestate(
                                        "aguulga_name"
                                      )}
                                      value={testOnestate.aguulga_name}
                                      type="text"
                                      name="name"
                                      id="name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
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
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
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
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      ЭЕШ
                                    </span>
                                  </label>
                                </div>
                                {testOnestate.material && (
                                  <div className="grid grid-cols-3 w-full gap-1">
                                    <div>
                                      <label
                                        htmlFor="name"
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
                                        id="name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="name"
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
                                        id="name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        htmlFor="name"
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
                                        id="name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        placeholder=""
                                        required
                                      />
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label
                                    htmlFor="message"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Асуулт
                                  </label>
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

                                <div className="">
                                  <button
                                    onClick={() => {
                                      updateTest(
                                        testOnestate,
                                        filter.hicheel,
                                        filter.aguulga,
                                        filter.limit,
                                        filter.page
                                      );
                                      setAnswerState({});
                                      setedit(true);
                                      setedit1(false);
                                      openAnswer();
                                    }}
                                    type="button"
                                    className="text-white bg-[#2557D6] hover:bg-[#2557D6]/90  font-medium rounded-lg text-sm px-2 py-1 text-center inline-flex items-center  mr-2 mb-2 gap-1"
                                  >
                                    <PlusIcon className="w-5 h-5" />
                                    Хариу нэмэх
                                  </button>
                                  {/* nuhuh   */}
                                  {testOnestate.testType === "Нөхөх" && (
                                    <div>
                                      <div className="inline-flex items-center justify-center w-full">
                                        <hr className="w-64 h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                                        <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
                                          Хариултууд
                                        </span>
                                      </div>

                                      {testOnestate?.answers &&
                                        testOnestate?.answers.map(
                                          (item, index) => {
                                            return (
                                              <div className="inline-flex w-full gap-2 my-2 relative ">
                                                <input
                                                  disabled
                                                  value={item.answer}
                                                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                  placeholder="Хариу бичих"
                                                  required
                                                />

                                                <div className="bottom-[10px] right-1.5 inline-flex items-center gap-2 border px-2 rounded-lg">
                                                  <input
                                                    checked={item.correct}
                                                    onChange={(event) => {
                                                      updateAnswwer(
                                                        testOnestate._id,
                                                        {
                                                          ...item,
                                                          correct:
                                                            event.target
                                                              .checked,
                                                        }
                                                      );
                                                    }}
                                                    type="checkbox"
                                                    className="w-5 h-5 text-green-600 bg-gray-100 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 cursor-pointer focus:ring-green-500"
                                                  />
                                                  <button
                                                    onClick={() => {
                                                      setedit1(true);
                                                      setAnswerState(item);
                                                      openAnswer();
                                                    }}
                                                  >
                                                    <PencilIcon className="w-5 h-5 hover:scale-125 transition-all text-blue-500" />
                                                  </button>
                                                  <button
                                                    className=""
                                                    onClick={() => {
                                                      deleteAnswwer(
                                                        testOnestate._id,
                                                        item._id
                                                      );
                                                    }}
                                                  >
                                                    <TrashIcon className="w-5 h-5 hover:scale-125 transition-all text-red-500" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                    </div>
                                  )}
                                  {/* end nuhuh */}

                                  {/* zadgai   */}
                                  {testOnestate.testType ===
                                    "Задгай даалгавар" && (
                                    <div>
                                      <div className="inline-flex items-center justify-center w-full">
                                        <hr className="w-64 h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                                        <span className="absolute px-3 font-medium text--900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
                                          Хариултууд
                                        </span>
                                      </div>
                                      <div className="inline-flex justify-between w-full gap-2 my-2 font-bold relative text-slate-900 dark:text-white  ">
                                        <p>Түлхүүр </p>
                                        <p>Утга </p>
                                        <p>Оноо </p>
                                        <p>Үйлдэл </p>
                                      </div>
                                      {testOnestate?.answers &&
                                        testOnestate?.answers.map(
                                          (item, index) => {
                                            return (
                                              <div className="inline-flex w-full gap-2 my-2 relative ">
                                                <input
                                                  disabled
                                                  value={item.answer}
                                                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                  placeholder="Хариу бичих"
                                                  required
                                                />
                                                <input
                                                  disabled
                                                  value={item.value}
                                                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 "
                                                  placeholder="Хариу бичих"
                                                  required
                                                />
                                                <input
                                                  disabled
                                                  value={item.score}
                                                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 "
                                                  placeholder="Хариу бичих"
                                                  required
                                                />
                                                <div className="bottom-[10px] right-1.5 inline-flex items-center gap-2 border px-2 rounded-lg">
                                                  <input
                                                    checked={item.correct}
                                                    onChange={(event) => {
                                                      updateAnswwer(
                                                        testOnestate._id,
                                                        {
                                                          ...item,
                                                          correct:
                                                            event.target
                                                              .checked,
                                                        }
                                                      );
                                                    }}
                                                    type="checkbox"
                                                    className="w-5 h-5 text-green-600 bg-gray-100 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600 cursor-pointer focus:ring-green-500"
                                                  />
                                                  <button
                                                    onClick={() => {
                                                      setedit1(true);
                                                      setAnswerState(item);
                                                      openAnswer();
                                                    }}
                                                  >
                                                    <PencilIcon className="w-5 h-5 hover:scale-125 transition-all text-blue-500" />
                                                  </button>
                                                  <button
                                                    className=""
                                                    onClick={() => {
                                                      deleteAnswwer(
                                                        testOnestate._id,
                                                        item._id
                                                      );
                                                    }}
                                                  >
                                                    <TrashIcon className="w-5 h-5 hover:scale-125 transition-all text-red-500" />
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                    </div>
                                  )}
                                  {/* end zadgai */}

                                  {/* Нэг сонголт */}
                                  {(testOnestate.testType ===
                                    "Нэг сонголттой" ||
                                    testOnestate.testType ===
                                      "Олон сонголттой") && (
                                    <div>
                                      <div className="">
                                        {testOnestate?.answers &&
                                          testOnestate?.answers.map(
                                            (item, index) => {
                                              return (
                                                <div
                                                  key={index}
                                                  className="flex flex-row mt-2 rounded border border-gray-400 "
                                                >
                                                  <div
                                                    key={index}
                                                    className="h-24 scroll-th scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:text-white dark:bg-gray-600 p-2 w-full"
                                                  >
                                                    {renderRichText(
                                                      decode(item.answer)
                                                    )}

                                                    {/* {item.answer} */}
                                                  </div>
                                                  <div className="rounded-r-lg p-1 flex flex-col justify-between border-l border-gray-400 ml-1">
                                                    <input
                                                      checked={item.correct}
                                                      onChange={(event) => {
                                                        updateAnswwer(
                                                          testOnestate._id,
                                                          {
                                                            ...item,
                                                            correct:
                                                              event.target
                                                                .checked,
                                                          }
                                                        );
                                                      }}
                                                      type="checkbox"
                                                      className="w-5 h-5 text-green-600 bg-gray-100 rounded border-gray-300 dark:border-gray-600 cursor-pointer focus:ring-green-500"
                                                    />
                                                    <button
                                                      onClick={() => {
                                                        setedit1(true);
                                                        setedit(true);
                                                        setAnswerState(item);
                                                        openAnswer();
                                                      }}
                                                    >
                                                      <PencilIcon className="w-5 h-5 hover:scale-125 transition-all text-blue-500" />
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        deleteAnswwer(
                                                          testOnestate._id,
                                                          item._id
                                                        );
                                                      }}
                                                    >
                                                      <TrashIcon className="w-5 h-5 hover:scale-125 transition-all text-red-500" />
                                                    </button>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          )}
                                      </div>
                                    </div>
                                  )}
                                  {/* нэг сонголт end */}
                                </div>
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
                        <div className="flex flex-row">
                          <div className="grow"></div>
                          <button
                            onClick={() => {
                              setedit(false);
                              updateTest(
                                testOnestate,
                                filter.hicheel,
                                filter.aguulga,
                                filter.limit,
                                filter.page
                              );

                              closeModal();
                            }}
                            type="submit"
                            className="mt-2 text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
                          >
                            Хадгалаад гарах
                          </button>
                          <button
                            onClick={() => {
                              setedit(true);
                              updateTest(
                                testOnestate,
                                filter.hicheel,
                                filter.aguulga,
                                filter.limit,
                                filter.page
                              );

                              // closeModal();
                            }}
                            type="submit"
                            className="mt-2 ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          >
                            Хадгалах
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Modal content */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px]" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Хичээлүүд / агуулга /
                  </h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <div className="pt-4">
                  <Disclosure as="div" className="border-gray-200 p-2">
                    <div className="space-y-1 my-4 ml-2">
                      <div
                        className="inline-flex rounded-md  mb-2 w-full justify-center"
                        role="group"
                      >
                        <button
                          onClick={() => {
                            setfilter({ ...filter, yesh: false });
                            getTestHicheel(user.id);
                          }}
                          type="button"
                          className={` px-4 dark:text-white shadow-sm shadow-blue-600 rounded-l-md text-center flex  hover:dark:bg-blue-600  hover:bg-blue-600 hover:text-white duration-300  ${
                            !filter.yesh
                              ? "bg-blue-600 text-white"
                              : "dark:bg-slate-800"
                          }`}
                        >
                          Өөрийн
                        </button>
                        <button
                          onClick={() => {
                            setfilter({ ...filter, yesh: true });
                            getTestHicheel("");
                          }}
                          type="button"
                          className={` px-4 dark:text-white shadow-sm shadow-blue-600 rounded-r-md text-center flex  hover:dark:bg-blue-600  hover:bg-blue-600 hover:text-white duration-300  ${
                            filter.yesh
                              ? "bg-blue-600 text-white"
                              : "dark:bg-slate-800"
                          }`}
                        >
                          ЭЕШ
                        </button>
                      </div>
                      {hicheelState.content.map((option, optionIdx) => (
                        <Disclosure key={optionIdx} as="div">
                          {({ open }) => (
                            <>
                              <Disclosure.Button as={Fragment}>
                                <button className="flex flex-row items-center gap-2">
                                  {open ? (
                                    <MinusIcon
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <PlusIcon
                                      className="h-4 w-4"
                                      aria-hidden="true"
                                    />
                                  )}

                                  <span>
                                    {option.hicheel_name} ( {option.testToo} )
                                  </span>
                                </button>
                              </Disclosure.Button>
                              <Disclosure.Panel as="ul" className="pl-6">
                                {option.aguulga_name.map((item, index) => {
                                  return (
                                    <li key={index}>
                                      <div key={optionIdx} className="">
                                        <input
                                          checked={
                                            filter.aguulga === item
                                              ? true
                                              : false
                                          }
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              getTestSan(
                                                filter.yesh ? "" : user.id,
                                                option.hicheel_name,
                                                item,
                                                5,
                                                1
                                              );
                                            } else {
                                              getTestSan(
                                                filter.yesh ? "" : user.id,
                                                "",
                                                "",
                                                5,
                                                1
                                              );
                                            }
                                            setfilter({
                                              ...filter,
                                              aguulga: e.target.checked
                                                ? item
                                                : "",
                                              hicheel: e.target.checked
                                                ? option.hicheel_name
                                                : "",
                                              limit: 5,
                                              pages: 1,
                                            });
                                          }}
                                          type="checkbox"
                                          className="h-4 w-4 rounded border-gray-300  cursor-pointer"
                                        />
                                        <label className="ml-3 text-sm">
                                          {item}
                                        </label>
                                      </div>
                                    </li>
                                  );
                                })}
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      ))}
                    </div>
                  </Disclosure>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <section className="mx-auto min-w-0">
        <div className="border-b border-gray-200 dark:border-gray-600 w-full ">
          <div className="inline-flex">
            {!huv && (
              <button
                onClick={() => {
                  if ([filter.hicheel, filter.aguulga] === "") {
                    toast.error("Хичээл оруулна уу");
                  }
                  setedit(false);
                  addTest({
                    material: false,
                    testStatus: false,
                    points: 1,
                    zuvHariuZad: [],
                    isActive: true,
                    owner_id: user.id,
                    owner_name: user.name,
                    owner_role: user.role,
                    hicheel_name:
                      filter.hicheel === "" ? "Хичээлийн нэр" : filter.hicheel,
                    aguulga_name:
                      filter.aguulga === "" ? "Агуулгын  нэр" : filter.aguulga,
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
                  setTestOneState({});
                  openModal();
                }}
                type="button"
                className="h-6 px-1 leading-tight text-white bg-blue-600 border border-gray-300 hover:bg-blue-700 rounded-lg mr-2 inline-flex"
              >
                <PlusIcon className="w-5 h-5" />
                Тест нэмэх
              </button>
            )}
            <button className=" h-6 px-1 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-300 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white rounded-lg mr-2">
              Нийт: {testSanState?.pagination?.total}
            </button>
            <select
              value={filter.limit}
              onChange={(event) => {
                setfilter({
                  ...filter,
                  limit: parseInt(event.target.value),
                  page: 1,
                });
                getTestSan(
                  filter.yesh ? "" : user.id,
                  filter.hicheel,
                  filter.aguulga,
                  parseInt(event.target.value),
                  1
                );
              }}
              id="small"
              className="pr-7 h-6 py-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-300 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white rounded-lg mr-2"
            >
              <option value="5">5</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button
              type="button"
              className=" text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <FunnelIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ul className="flex flex-wrap py-2  w-full">
            {testSanState.pagination?.prevPage && (
              <li>
                <button
                  onClick={() => {
                    setfilter({ ...filter, page: filter.page - 1 });
                    getTestSan(
                      filter.yesh ? "" : user.id,
                      filter.hicheel,
                      filter.aguulga,
                      filter.limit,
                      filter.page - 1
                    );
                  }}
                  className="px-1 h-6  leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-300 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer rounded-l-lg inline-flex items-center"
                >
                  <ChevronLeftIcon className="w-4 h-4" /> Өмнөх хуудас
                </button>
              </li>
            )}

            {/* {[...Array(testSanState.pagination?.pageCount).keys()].map(
              (page, index) => {
                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        setfilter({ ...filter, page: page + 1 });
                        getTestSan(
                          filter.yesh ? "" : user.id,
                          filter.hicheel,
                          filter.aguulga,
                          filter.limit,
                          page + 1
                        );
                      }}
                      className={`px-2 h-6 leading-tight border border-gray-300 dark:border-gray-600  ${
                        page + 1 === filter.page
                          ? "bg-blue-600 text-white border-none"
                          : "text-gray-500 bg-white  hover:bg-gray-300 hover:text-gray-700 dark:bg-gray-800  dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {page + 1}
                    </button>
                  </li>
                );
              }
            )} */}

            <li>
              <button
                disabled={testSanState.pagination?.nextPage ? false : true}
                onClick={() => {
                  setfilter({ ...filter, page: filter.page + 1 });
                  getTestSan(
                    filter.yesh ? "" : user.id,
                    filter.hicheel,
                    filter.aguulga,
                    filter.limit,
                    filter.page + 1
                  );
                }}
                className="px-1 h-6  leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-300 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white cursor-pointer rounded-r-lg inline-flex items-center"
              >
                <p>Дараагийн хуудас</p> <ChevronRightIcon className="w-4 h-4" />
              </button>
            </li>
          </ul>
        </div>
        <section aria-labelledby="products-heading" className="pt-6 pb-24 ">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-5">
            {/* Filters */}
            <div className="hidden lg:block dark:bg-gray-500 bg-gray-200 rounded-lg">
              <h3 className="font-bold text-lg pt-1 text-center bg-gray-300 dark:bg-gray-600 h-10 rounded-t-lg">
                Хичээлүүд / агуулга /
              </h3>
              <div className="space-y-1 my-4 ml-2">
                <div
                  className="inline-flex rounded-md mb-2 w-full justify-center"
                  role="group"
                >
                  <button
                    onClick={() => {
                      setfilter({ ...filter, yesh: false });
                      getTestHicheel(user.id);
                    }}
                    type="button"
                    className={` px-4 dark:text-white shadow-sm shadow-blue-600 rounded-l-md text-center flex  hover:dark:bg-blue-600  hover:bg-blue-600 hover:text-white duration-300  ${
                      !filter.yesh
                        ? "bg-blue-600 text-white"
                        : "dark:bg-slate-800"
                    }`}
                  >
                    Өөрийн
                  </button>
                  <button
                    onClick={() => {
                      setfilter({ ...filter, yesh: true });
                      getTestHicheel("");
                    }}
                    type="button"
                    className={` px-4 dark:text-white shadow-sm shadow-blue-600 rounded-r-md text-center flex  hover:dark:bg-blue-600  hover:bg-blue-600 hover:text-white duration-300  ${
                      filter.yesh
                        ? "bg-blue-600 text-white"
                        : "dark:bg-slate-800"
                    }`}
                  >
                    ЭЕШ
                  </button>
                </div>

                {hicheelState.content.map((option, optionIdx) => (
                  <Disclosure defaultOpen={false} key={optionIdx} as="div">
                    {({ open }) => (
                      <>
                        <Disclosure.Button as={Fragment}>
                          <button className="flex flex-row items-center gap-1">
                            {open ? (
                              <MinusIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            ) : (
                              <PlusIcon
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            )}

                            <span className="text-sm">
                              {option.hicheel_name} ( {option.testToo} )
                            </span>
                          </button>
                        </Disclosure.Button>
                        <Disclosure.Panel as="ul" className="pl-6">
                          {option.aguulga_name.map((item, index) => {
                            return (
                              <li key={index}>
                                <div key={optionIdx} className="">
                                  <input
                                    id={item}
                                    checked={
                                      filter.aguulga === item ? true : false
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        getTestSan(
                                          filter.yesh ? "" : user.id,
                                          option.hicheel_name,
                                          item,
                                          5,
                                          1
                                        );
                                      } else {
                                        getTestSan(
                                          filter.yesh ? "" : user.id,
                                          "",
                                          "",
                                          5,
                                          1
                                        );
                                      }
                                      setfilter({
                                        ...filter,
                                        aguulga: e.target.checked ? item : "",
                                        hicheel: e.target.checked
                                          ? option.hicheel_name
                                          : "",
                                        limit: 5,
                                        pages: 1,
                                      });
                                    }}
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300  cursor-pointer"
                                  />
                                  <label
                                    htmlFor={item}
                                    className="ml-3 text-sm cursor-pointer"
                                  >
                                    {item}
                                  </label>
                                </div>
                              </li>
                            );
                          })}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </div>

            {/* Product grid */}
            <div className="lg:col-span-4">
              {/* Replace with your content */}
              <div className="grid gap-4 px-4 sm:px-0 sm:grid-cols-2 md:grid-cols-3 ">
                {testSanState.testsan.map((test, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-gray-200 dark:bg-gray-500 rounded-lg h-44 "
                    >
                      <div className="bg-gray-300 dark:bg-gray-600 rounded-t-lg p-2 flex items-center gap-2">
                        {huv && shalgaltOne.success && (
                          <input
                            checked={
                              shalgaltOne.listTests
                                .map((x) => x._id)
                                .indexOf(test._id) === -1
                                ? false
                                : true
                            }
                            onChange={(e) => {
                              e.target.checked
                                ? addExamTest(
                                    shalgaltOne.shalgalt._id,
                                    test._id
                                  )
                                : removeExamTest(
                                    shalgaltOne.shalgalt._id,
                                    test._id
                                  );
                            }}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300  cursor-pointer"
                          />
                        )}
                        <div className="grow">
                          <kbd className="px-2 py-1 text-xs font-semibold text-white bg-orange-500 rounded-lg ">
                            {test.testType}
                          </kbd>
                        </div>
                        <kbd className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg ">
                          {test.points} Оноо
                        </kbd>
                        {test.material && (
                          <>
                            <kbd className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg ">
                              {test.jil} ({test.huvilbar}-{test.testNumber})
                            </kbd>
                          </>
                        )}
                        {test.owner_id === user?.id && (
                          <>
                            <button
                              onClick={() => {
                                setedit(true);
                                getTest(test._id);
                                openModal();
                              }}
                            >
                              <PencilIcon className="w-5 h-5 hover:scale-125 transition-all text-blue-600 dark:text-gray-300" />
                            </button>
                            <button
                              onClick={() => {
                                setTestOneState(test);
                                openDeleteModal(true);
                              }}
                            >
                              <TrashIcon className="w-5 h-5 hover:scale-125 transition-all text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="p-2 h-32 scroll-th scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                        {renderRichText(decode(test.question))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* /End replace */}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
