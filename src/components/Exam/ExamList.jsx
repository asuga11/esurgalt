import {
  ArrowPathIcon,
  ClockIcon,
  DocumentChartBarIcon,
  DocumentPlusIcon,
  PencilIcon,
  QrCodeIcon,
  ShareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { useHref } from "react-router-dom";
import moment from "moment";
import MainContext from "../../Context/MainContext";
import DeleteModal from "../DeleteModal";

import TestList from "../Tests/TestList";
import Timer from "./Timer";
import renderRichText from "../../renderRichText";
import { decode } from "html-entities";
import copy from "text-copy";
import { QRCodeSVG } from "qrcode.react";

import { BiSearch } from "react-icons/bi";

import DunMember from "../Suragch/Exam/DunMember";
import ShalgaltList from "../Suragch/ShalgaltList";
import { toast } from "react-hot-toast";
import ExamTestPrint from "./ExamTestPrint";
import ExamMemberPrint from "./ExamMemberPrint";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const ExamList = () => {
  useEffect(() => {
    getExams(user.id);
  }, []);

  const {
    getExams,
    examState,
    user,
    deleteExam,
    updateExam,
    addExam,
    setShalgaltOne,
    getShalgaltList,
    shalgaltOne,
    getShalgalt,
    addExamTest,
    removeExamTest,
    removeExamMember,
    dunAllState,
    getShalgaltAllDun,
    getExamMemberResult,
    getSurguuliAimag,
    getBagshSurguuli,
    surguuliState,
    getBagshSurgalt,
    bagshState,
    addressState,
    getstudone,
    studOne,
    addExamMember2,
    getSuragch,
    suragch1,
  } = useContext(MainContext);

  const [data, setData] = useState({
    sorilname: "",
  });

  const [searchName, setSearchName] = useState("");
  const [exam, setExam] = useState(null);
  const [shareExam, setShareExam] = useState(null);
  const sharePath = useHref(shareExam ? `/e/${shareExam._id}` : "/");
  const shareUrl = new URL(sharePath, window.location.origin).href;
  const [edit, setedit] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const examSavePending = useRef(false);
  const [examFormError, setExamFormError] = useState("");
  const handleChangeeExam = (prop) => (event) => {
    setExam((current) => ({ ...current, [prop]: event.target.value }));
    setExamFormError("");
  };
  let [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function openDeleteModal() {
    setIsDeleteOpen(true);
  }
  function closeDeleteModal() {
    setIsDeleteOpen(false);
  }
  const [tab, settab] = useState(0);
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    if (examSavePending.current) return;
    setExamFormError("");
    setExam(null);
    setIsOpen(false);
  }

  async function saveExam() {
    if (examSavePending.current || !exam) return;
    const { listMembers, listTests, ...values } = exam;
    const name = values.name?.trim();
    const duration = Number(values.examTime);
    const error = !name ? "Сорилын нэрээ оруулна уу."
      : !Number.isSafeInteger(duration) || duration <= 0 ? "Хугацааг эерэг бүхэл минутаар оруулна уу."
      : values.isStartTime === true && (!values.examDate || !moment(values.examDate).isValid()) ? "Сорил эхлэх огноо, цагаа оруулна уу."
      : "";
    setExamFormError(error);
    if (error) return;

    examSavePending.current = true;
    setSavingExam(true);
    try {
      const save = edit ? updateExam : addExam;
      const saved = await save({ ...values, name });
      if (saved) {
        setExam(null);
        setIsOpen(false);
      } else {
        setExamFormError("Тохиргоог хадгалж чадсангүй. Дахин оролдоно уу.");
      }
    } finally {
      examSavePending.current = false;
      setSavingExam(false);
    }
  }

  function openModal() {
    setIsOpen(true);
  }
  let [isHuv, setIsHuv] = useState(false);

  function closeHuv() {
    setIsHuv(false);
  }

  function openHuv() {
    setIsHuv(true);
  }
  let [result, setResult] = useState(false);

  function closeResult() {
    setResult(false);
  }

  function openResult() {
    setResult(true);
  }
  const [memberData, setMemberData] = useState({
    eid: "",
    memid: "",
  });

  let [isDeleteMember, setisDeleteMember] = useState(false);

  function openDeleteMember() {
    setisDeleteMember(true);
  }
  function closeDeleteMember() {
    setisDeleteMember(false);
  }
  let [dunOpen, setDunOpen] = useState(false);

  function closeDun() {
    setDunOpen(false);
  }

  function openDun() {
    setDunOpen(true);
  }
  const [pOpen, setPOpen] = React.useState(false);
  const handleClickPOpen = () => {
    setPOpen(true);
  };
  const handleClosePOpen = () => {
    setPOpen(false);
  };
  const [value, setvalue] = useState("Сурагч");
  const [name, setName] = useState("");
  const [memberPrint, setmemberPrint] = useState(false);
  return (
    <div className="">
      {pOpen && (
        <ExamTestPrint data={shalgaltOne} handleClosePOpen={handleClosePOpen} />
      )}
      {memberPrint && (
        <ExamMemberPrint data={dunAllState} setmemberPrint={setmemberPrint} />
      )}
      {dunOpen && <DunMember closeDun={closeDun} />}
      {isDeleteOpen && exam && (
        <DeleteModal
          closeDeleteModal={closeDeleteModal}
          deletefunc={deleteExam}
          data={exam}
        />
      )}
      {isDeleteMember && (
        <DeleteModal
          closeDeleteModal={closeDeleteMember}
          deletefunc={removeExamMember}
          data={{ _id: memberData.eid }}
          filter={{ hicheel: memberData.memid }}
        />
      )}
      <Transition appear show={Boolean(shareExam)} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShareExam(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-2 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-2 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8">
                  <div className="flex items-start justify-between gap-4 text-left">
                    <div>
                      <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                        <QrCodeIcon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <Dialog.Title className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Сорилыг QR кодоор хуваалцах
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {shareExam?.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShareExam(null)}
                      aria-label="Хаах"
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {shareExam && (
                    <>
                      <div className="mx-auto mt-6 inline-flex rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700">
                        <QRCodeSVG
                          value={shareUrl}
                          size={216}
                          level="M"
                          includeMargin
                          title={`${shareExam.name} сорилын QR код`}
                        />
                      </div>
                      <p className="mt-4 break-all rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {shareUrl}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Утсаараа QR кодыг уншуулж сорилын хуудас руу орно уу.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          copy(shareUrl);
                          toast.success("Сорилын холбоос хуулагдлаа");
                        }}
                        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20"
                      >
                        <ShareIcon className="h-4 w-4" aria-hidden="true" />
                        Холбоос хуулах
                      </button>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={result} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            closeResult();
          }}
        >
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
                    "max-w-lg"
                  )}
                >
                  <div
                    className={classNames("relative w-full h-full  md:h-auto")}
                  >
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <div className="absolute top-4 left-8 dark:text-white font-bold uppercase">
                        Үр дүнгийн мэдээлэл
                      </div>
                      <button
                        onClick={closeResult}
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
                      <div className="px-6 py-8 lg:px-8">
                        <div className="space-y-2 dark:text-white mt-8">
                          <div className="inline-flex w-full gap-4">
                            <div className="relative w-full">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                  aria-hidden="true"
                                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </div>
                              <input
                                onChange={(e) => {
                                  setSearchName(e.target.value);
                                }}
                                type="search"
                                id="default-search"
                                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Нэрээр хайх..."
                                required
                              />
                            </div>
                            <button
                              onClick={() => {
                                getShalgaltAllDun(exam._id);
                              }}
                            >
                              <ArrowPathIcon className="w-6 h-6" />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setmemberPrint(true);
                            }}
                            className="bg-blue-600 text-white px-2 rounded-lg"
                          >
                            Хэвлэх
                          </button>
                          <div className="inline-flex items-center justify-center w-full">
                            <hr className="w-full h-px  bg-gray-200 border-0 dark:bg-gray-600" />
                            <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-700">
                              Оролцогч - {dunAllState.shalgaltdun?.length}
                            </span>
                          </div>

                          <ul className="max-w-md divide-y divide-gray-200 dark:divide-gray-700 ">
                            {dunAllState.shalgaltdun
                              .filter((el) =>
                                el.member_name
                                  .toLowerCase()
                                  .includes(searchName.toLowerCase())
                              )
                              .sort((a, b) =>
                                a.onooZuvHariu > b.onooZuvHariu ? -1 : 1
                              )
                              .map((item, index) => {
                                return (
                                  <li
                                    key={index}
                                    className="py-1 px-1 border border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-200 duration-300 dark:hover:bg-gray-600 mt-1"
                                  >
                                    <div className="flex items-center space-x-4 ">
                                      <div className="flex-shrink-0">
                                        {/* <p className="w-10 h-10 rounded-full text-center text-emerald-600 font-bold text-4xl">
                                          {index + 1}
                                        </p> */}
                                        {/* <img
                                          className="w-10 h-10 rounded-full"
                                          src="https://flowbite.com/docs/images/people/profile-picture-4.jpg"
                                          alt="image1"
                                        /> */}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          onClick={() => {
                                            // alert(item.member_id);
                                            getSuragch(item.member_id);
                                          }}
                                          className="text-sm flex gap-1 font-medium text-gray-900 truncate dark:text-white"
                                        >
                                          {item.member_name}{" "}
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-4 h-4 text-orange-600"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                                            />
                                          </svg>
                                        </p>
                                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                          {item.member_school}
                                          <br />
                                          {item.member_class}
                                        </p>
                                        <p>
                                          {suragch1.success &&
                                            suragch1?.suragch?._id ===
                                              item.member_id && (
                                              <div className="text-sm">
                                                Email:{" "}
                                                {suragch1?.suragch?.email}{" "}
                                                <br />
                                                Утас:{" "}
                                                {suragch1?.suragch?.phone1}
                                              </div>
                                            )}
                                        </p>
                                      </div>
                                      <kbd
                                        onClick={() => {
                                          getExamMemberResult(
                                            dunAllState.shalgalt?._id,
                                            item.member_id
                                          );
                                          openDun();
                                        }}
                                        className="px-2 py-1 text-xl font-semibold text-white bg-blue-500 rounded-lg cursor-pointer"
                                      >
                                        {item.onooZuvHariu} оноо
                                      </kbd>
                                    </div>
                                  </li>
                                );
                              })}
                          </ul>
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
      <Transition appear show={isHuv} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            closeHuv();
          }}
        >
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
                    "max-w-7xl"
                  )}
                >
                  <div
                    className={classNames("relative w-full h-full  md:h-auto")}
                  >
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <div className="absolute top-3 left-8 dark:text-white">
                        Хуваарилсан тестүүд{" "}
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg"
                          onClick={handleClickPOpen}
                        >
                          Тест хэвлэх
                        </button>
                      </div>
                      <button
                        onClick={closeHuv}
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
                        <div className="grid gap-6 px-4 pt-6 sm:px-0 sm:grid-cols-2 md:grid-cols-3 ">
                          {shalgaltOne.listTests.map((test, index) => {
                            return (
                              <div
                                key={index}
                                className="bg-gray-200 dark:bg-gray-500 rounded-lg h-44 shadow-2xl"
                              >
                                <div className="bg-gray-300 dark:bg-gray-600 rounded-t-lg p-2 flex items-center gap-2">
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
                                  <div className="grow"></div>
                                  <kbd className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg ">
                                    {test.points} Оноо
                                  </kbd>
                                  {test.material && (
                                    <>
                                      <kbd className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-lg ">
                                        {test.jil} ({test.huvilbar}-
                                        {test.testNumber})
                                      </kbd>
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
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
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
                    tab !== 1 ? "max-w-md" : "max-w-7xl"
                  )}
                >
                  <div
                    className={classNames("relative w-full h-full  md:h-auto")}
                  >
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <button
                        onClick={closeModal}
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
                        {edit && (
                          <div className="mb-4  dark:border-gray-700">
                            <ul
                              className="flex flex-wrap -mb-px text-sm font-medium text-center dark:border-gray-500"
                              id="myTab"
                              data-tabs-toggle="#myTabContent"
                              role="tablist"
                            >
                              {["Мэдээлэл", "Тест", "Оролцогчид"].map(
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
                        )}
                        {tab === 0 && (
                          <div>
                            {exam && (
                              <div className="space-y-2">
                                <div>
                                  <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Сорилын нэр
                                  </label>
                                  <input
                                    value={exam.name}
                                    onChange={handleChangeeExam("name")}
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    placeholder=""
                                    required
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Хичээлийн нэр
                                  </label>
                                  <input
                                    value={exam.lessonName}
                                    onChange={handleChangeeExam("lessonName")}
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    placeholder=""
                                    required
                                  />
                                </div>
                                <div className="flex gap-2 items-center w-full">
                                  <div>
                                    <label
                                      htmlFor="name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Эхлэх огноо
                                    </label>
                                    <input
                                      onChange={handleChangeeExam("examDate")}
                                      value={moment(exam.examDate).format(
                                        "yyyy-MM-DDTHH:mm"
                                      )}
                                      type="datetime-local"
                                      name="name"
                                      id="name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Хугацаа (минут)
                                    </label>
                                    <input
                                      onChange={handleChangeeExam("examTime")}
                                      value={exam.examTime}
                                      type="number"
                                      name="name"
                                      id="name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white w-full"
                                      placeholder=""
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center w-full">
                                  <div className="w-full">
                                    <label
                                      htmlFor="exam-member-class"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Шалгалтын хэлбэр
                                    </label>
                                    <select
                                      onChange={handleChangeeExam("examType")}
                                      value={exam.examType} id="exam-member-class"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                      <option aria-label="None" value="" />l
                                      {[
                                        "Олимпиад",
                                        "Хөндлөнгийн шалгалт",
                                        "ЭЕШ-ын сорил",
                                        "Явцын шалгалт",
                                        "Улирлын шалгалт",
                                      ].map((el, index) => (
                                        <option key={index} value={el}>
                                          {el}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                {user.role === "admin" && (
                                  <>
                                    <div>
                                      <label
                                        htmlFor="name"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                      >
                                        Аймаг/Хот
                                      </label>
                                      <select
                                        onChange={(e) => {
                                          if (e.target.value === "") {
                                            setExam({ ...exam, aimag: [] });
                                          } else {
                                            var selected = exam?.aimag;
                                            selected.push(e.target.value);
                                            setExam({
                                              ...exam,
                                              aimag: selected,
                                            });
                                          }
                                        }}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      >
                                        <option value="">Бүгдийг</option>
                                        {addressState.address.map(
                                          (el, index) => (
                                            <option
                                              disabled={
                                                exam?.aimag.filter(
                                                  (item) =>
                                                    item === el.aimagCity
                                                ).length > 0
                                                  ? true
                                                  : false
                                              }
                                              key={index}
                                              value={el.aimagCity}
                                            >
                                              {el.aimagCity}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </div>
                                    {exam?.aimag?.length > 0 && (
                                      <div className="w-full border px-2 py-1 rounded-lg">
                                        {exam?.aimag?.map((el, index) => {
                                          return (
                                            <span
                                              key={el}
                                              id="badge-dismiss-default"
                                              className="inline-flex items-center mb-2 px-2 py-1 mr-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-lg dark:bg-blue-900 dark:text-blue-300"
                                            >
                                              {el}
                                              <button
                                                onClick={() => {
                                                  var newChecked = exam?.aimag;
                                                  newChecked.splice(index, 1);
                                                  setExam({
                                                    ...exam,
                                                    aimag: newChecked,
                                                  });
                                                }}
                                                type="button"
                                                className="inline-flex items-center p-0.5 ml-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                                                data-dismiss-target="#badge-dismiss-default"
                                                aria-label="Remove"
                                              >
                                                <svg
                                                  aria-hidden="true"
                                                  className="w-3.5 h-3.5"
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
                                                <span className="sr-only">
                                                  Remove badge
                                                </span>
                                              </button>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}{" "}
                                  </>
                                )}
                                <div className="grid grid-cols-2 w-full">
                                  <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setExam({
                                          ...exam,
                                          isActive: e.target.checked,
                                        });
                                      }}
                                      checked={exam.isActive}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      Эхлүүлэх
                                    </span>
                                  </label>
                                  {/* <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setExam({
                                          ...exam,
                                          isStartTest: e.target.checked,
                                        });
                                      }}
                                      checked={exam.isStartTest}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      Сорилыг эхлүүлэх
                                    </span>
                                  </label> */}
                                  <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setExam({
                                          ...exam,
                                          isOpenAnswer: e.target.checked,
                                        });
                                      }}
                                      checked={exam.isOpenAnswer}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      Хариу харуулах
                                    </span>
                                  </label>
                                  <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setExam({
                                          ...exam,
                                          isCalculation: e.target.checked,
                                        });
                                      }}
                                      checked={exam.isCalculation}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      Бодолт харуулах
                                    </span>
                                  </label>
                                  {user?.role === "admin" && (
                                    <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                      <input
                                        onChange={(e) => {
                                          setExam({
                                            ...exam,
                                            isMenu: e.target.checked,
                                          });
                                        }}
                                        checked={exam.isMenu}
                                        type="checkbox"
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Вэбд харуулах
                                      </span>
                                    </label>
                                  )}
                                  <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input
                                      onChange={(e) => {
                                        setExam({
                                          ...exam,
                                          isStartTime: e.target.checked,
                                        });
                                      }}
                                      checked={exam.isStartTime}
                                      type="checkbox"
                                      className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                      Цагтаа эхлэх эсэх
                                    </span>
                                  </label>
                                </div>

                                <div>
                                  <div>
                                    <label
                                      htmlFor="message"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Зөвлөмж{" "}
                                    </label>
                                    <textarea
                                      id="message"
                                      rows={4}
                                      className="block p-2 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      value={exam.introduction}
                                      onChange={handleChangeeExam(
                                        "introduction"
                                      )}
                                    />
                                  </div>
                                </div>

                                <Disclosure>
                                  <Disclosure.Button className="app-button-secondary mb-2" type="button">Урьдчилан харах</Disclosure.Button>
                                  <Disclosure.Panel className="app-panel mb-3 space-y-2 p-4">
                                    <h3 className="font-extrabold">{exam.name || "Сорилын нэр"}</h3>
                                    <p className="text-sm">{[exam.examType, exam.lessonName, exam.examTime && `${exam.examTime} минут`].filter(Boolean).join(" · ")}</p>
                                    {exam.introduction && <p className="whitespace-pre-wrap text-sm">{exam.introduction}</p>}
                                  </Disclosure.Panel>
                                </Disclosure>
                                {examFormError && <p role="alert" className="mb-2 text-sm font-bold text-red-700 dark:text-red-300">{examFormError}</p>}
                                <button
                                  onClick={saveExam}
                                  type="button"
                                  disabled={savingExam}
                                  className="w-full  text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                  {savingExam ? "Хадгалж байна…" : "Хадгалах"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {tab === 1 && (
                          <div className="space-y-2 dark:text-white">
                            <button
                              onClick={() => {
                                openHuv();
                              }}
                              type="button"
                              className="inline-flex relative items-center p-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800   dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                              <span className=""> Хуваарилсан тесүүд</span>
                              <div className="inline-flex absolute -top-2 -right-2 justify-center items-center text-xs font-bold text-white bg-red-500 rounded-full border-2 border-red-500 dark:border-gray-300 px-1">
                                {shalgaltOne.count}
                              </div>
                            </button>
                            <button
                              type="button"
                              className="inline-flex relative items-center p-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800  dark:bg-blue-600 dark:hover:bg-blue-700  ml-4 "
                            >
                              <span className=""> Нийт оноо</span>
                              <div className=" inline-flex absolute -top-2 -right-2 justify-center items-center text-xs font-bold text-white bg-red-500 rounded-full border-2 border-red-500 dark:border-gray-300 px-1">
                                {shalgaltOne.listTests.reduce(
                                  (sum, item) => sum + item.points,
                                  0
                                )}
                              </div>
                            </button>
                            <TestList huv={true} />
                          </div>
                        )}
                        {tab === 2 && (
                          <div className="space-y-2 dark:text-white">
                            <div className="flex">
                              <div
                                className="inline-flex rounded-md shadow-sm"
                                role="group"
                              >
                                {(user?.role === "admin" ||
                                  user?.role === "teacher" ||
                                  user?.role === "education" ||
                                  user?.role === "school") && (
                                  <button
                                    onClick={() => setvalue("Оюутан")}
                                    type="button"
                                    className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border rounded-l-lg border-gray-200 hover:bg-gray-300 hover:text-blue-700 focus:z-10  dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white ${
                                      value === "Оюутан" && "bg-gray-300"
                                    }`}
                                  >
                                    Оюутан
                                  </button>
                                )}
                                <button
                                  onClick={() => setvalue("Сурагч")}
                                  type="button"
                                  className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200  hover:bg-gray-300 hover:text-blue-700 focus:z-10  dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white ${
                                    value === "Сурагч" && "bg-gray-300"
                                  }`}
                                >
                                  Сурагч
                                </button>
                              </div>
                              <div className="relative w-full">
                                <input
                                  onChange={(e) => {
                                    setName(e.target.value);
                                  }}
                                  type="search"
                                  id="search-dropdown"
                                  className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-r-lg border-l-gray-100 border-l-2 border border-gray-300  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                                  placeholder={
                                    value === "Сурагч" ? "Email" : "Нэвтрэх нэр"
                                  }
                                  required
                                />
                                <button
                                  onClick={() => {
                                    getstudone(name, value);
                                  }}
                                  className="absolute top-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                  <svg
                                    aria-hidden="true"
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                  </svg>
                                </button>
                              </div>{" "}
                            </div>
                            {studOne && (
                              <div className="border border-blue-600 px-2 py-1 rounded-lg justify-between flex">
                                <p className="font-semibold">
                                  {studOne.butenNer}
                                </p>
                                <button
                                  onClick={() => {
                                    if (studOne.role === "suragch") {
                                      addExamMember2(
                                        shalgaltOne.shalgalt._id,
                                        {
                                          _id: studOne._id,
                                          member_name: studOne.butenNer,
                                          member_role: studOne.role,
                                          member_school: studOne?.surguuli?.ner,
                                          member_class: studOne?.buleg,
                                          startTime: "",
                                          endTime: "",
                                          examStatus: "Хуваарилсан",
                                        },
                                        true
                                      );
                                    } else {
                                      addExamMember2(
                                        shalgaltOne.shalgalt._id,
                                        {
                                          _id: studOne._id,
                                          member_name: studOne.butenNer,
                                          member_role: studOne.role,
                                          member_school:
                                            studOne?.school_id?.name,
                                          member_class: studOne?.class_id?.name,
                                          startTime: "",
                                          endTime: "",
                                          examStatus: "Хуваарилсан",
                                        },
                                        true
                                      );
                                    }
                                  }}
                                  className="px-2 text-white rounded-lg bg-blue-600"
                                >
                                  нэмэх
                                </button>
                              </div>
                            )}
                            <div className="items-center flex justify-between pr-1">
                              <span className="font-bold uppercase">
                                Нийт оролцогч:{" "}
                                {shalgaltOne.shalgalt?.listMembers?.length}
                              </span>
                              <button
                                onClick={() => {
                                  getShalgaltList(shalgaltOne.shalgalt?._id);
                                }}
                              >
                                <ArrowPathIcon className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                  aria-hidden="true"
                                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </div>
                              <input
                                onChange={(e) => {
                                  setSearchName(e.target.value);
                                }}
                                type="search"
                                id="default-search"
                                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Нэрээр хайх..."
                                required
                              />
                            </div>
                            <ul className="max-w-md divide-y divide-gray-200 dark:divide-gray-700">
                              {shalgaltOne.shalgalt?.listMembers
                                .filter((el) =>
                                  el.member_name
                                    .toLowerCase()
                                    .includes(searchName.toLowerCase())
                                )
                                .map((item, index) => {
                                  return (
                                    <li key={index} className="pb-3 sm:pb-4">
                                      <div className="flex items-center space-x-4">
                                        {/* <div className="flex-shrink-0">
                                          <img
                                            className="w-8 h-8 rounded-full"
                                            src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
                                            alt="image2"
                                          />
                                        </div> */}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                            {item.member_name}
                                          </p>
                                          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                            {item.member_school} <br />
                                            {item.member_class}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setMemberData({
                                              eid: shalgaltOne.shalgalt._id,
                                              memid: item._id,
                                            });
                                            openDeleteMember();
                                          }}
                                        >
                                          <TrashIcon className="w-5 h-5 text-red-500" />
                                        </button>
                                      </div>
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        )}
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
      <div className="mb-2 flex items-center">
        <button
          onClick={() => {
            settab(0);
            setedit(false);
            setExam({
              owner_role: user?.role,
              owner_id: user?.id,
              owner_name: user?.name,
              aimag: [],
              name: "",
              introduction: "",
              examTime: 10,
              examDate: "",
              isOpenAnswer: false,
              isCalculation: false,
              isSurvey: false,
              isGuidance: false,
              isStartTest: false,
              isActive: false,
              listMembers: [],
              listTests: [],
              examType: "",
              isStartTime: false,
            });
            openModal();
          }}
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 "
        >
          <DocumentPlusIcon className="mr-2 -ml-1 w-5 h-5" />
          Сорил үүсгэх
        </button>
        {user?.role === "admin" && (
          <button
            onClick={() => getExams(user?.id)}
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none  font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 "
          >
            Өөрийн сорил
          </button>
        )}
      </div>
      <div className="flex gap-4 items-end mb-2">
        {user?.role === "admin" && (
          <div className="w-auto ">
            <label
              htmlFor="small"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Аймаг
            </label>
            <select
              value={data.aimag}
              onChange={(event) => {
                setData({ ...data, aimag: event.target.value });
                getSurguuliAimag(event.target.value);
              }}
              id="small"
              className="block w-full p-2 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected></option>
              {["Ховд", "Увс", "Баянөлгий", "Завхан", "Говь-Алтай"].map(
                (item, index) => {
                  return (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  );
                }
              )}
            </select>
          </div>
        )}
        {(user?.role === "education" || user?.role === "admin") && (
          <div className="w-72">
            <label
              htmlFor="small"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Сургууль
            </label>
            <select
              value={data.surguuli}
              onChange={(event) => {
                setData({ ...data, surguuli: event.target.value });
                getBagshSurguuli(event.target.value);
              }}
              id="small"
              className="block w-full p-2 pr-8  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected></option>
              {surguuliState.surguuli.map((surguuli, index) => {
                return (
                  <option key={index} value={surguuli._id}>
                    {surguuli.ner}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        {(user?.role === "education" || user?.role === "admin") && (
          <div className="w-72">
            <label
              htmlFor="small"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Багш
            </label>
            <select
              onChange={(event) => {
                setData({ ...data, bagsh: event.target.value });
                getExams(event.target.value);
              }}
              id="small"
              className="block w-full p-2 pr-8  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option selected></option>
              {bagshState.bagsh.map((item, index) => {
                return (
                  <option key={index} value={item._id}>
                    {item.butenNer}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        <div className="relative flex items-center text-gray-400 focus-within:text-blue-500">
          <span className="absolute left-4 flex h-6 items-center border-r border-gray-300 pr-3 dark:border-gray-700">
            <BiSearch className="w-5 h-5" />
          </span>
          <input
            value={data.sorilname}
            onChange={(e) => setData({ ...data, sorilname: e.target.value })}
            type="search"
            name="leadingIcon"
            id="leadingIcon"
            placeholder="Сорилын нэрээр хайх..."
            className="outline-none w-72 rounded-xl border border-gray-300 py-2 pl-14 pr-4 text-sm text-gray-600 transition focus:border-blue-300 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div role="region" aria-label="Сорилын жагсаалт" tabIndex={0} className="app-table-scroll max-h-96">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
          <thead className="text-xs text-gray-900 uppercase bg-gray-300 dark:bg-gray-900 dark:text-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3">
                №
              </th>
              <th scope="col" className="px-6 py-3">
                Сорилын нэр
              </th>
              <th scope="col" className="px-6 py-3">
                Эхлэх цаг
              </th>
              <th scope="col" className="px-6 py-3">
                Үргэлжлэх хугацаа
              </th>
              <th scope="col" className="px-6 py-3">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody>
            {examState.success &&
              examState.shalgalt
                .filter((el) =>
                  el.name?.toLowerCase().includes(data.sorilname?.toLowerCase())
                )
                .map((item, i) => {
                  return (
                    <tr
                      key={item._id || item.id || i}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <td className="px-6 py-2">{i + 1}</td>
                      <th
                        scope="row"
                        className="px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item.name}
                      </th>

                      <td className="px-6 ">
                        {item.isStartTime
                          ? moment(item.examDate).format("yyyy-MM-DD HH:mm")
                          : "Хэзээ ч болно"}
                        {/* <Timer
                      exDate={item.shalgaltHugatsaa}
                      css={"tracking-widest font-bold text-blue-600"}
                    />{" "} */}
                      </td>
                      <td className="px-6">{item.examTime} минут</td>
                      <td className="px-6 pt-1 items-center flex gap-4">
                        <button
                          type="button"
                          aria-label={`${item.name} сорилыг QR кодоор хуваалцах`}
                          title="QR кодоор хуваалцах"
                          onClick={() => {
                            setShareExam(item);
                          }}
                        >
                          <ShareIcon className="w-6 h-6 hover:scale-125 transition-all text-cyan-600" />
                        </button>
                        <button
                          onClick={() => {
                            setExam(item);
                            getShalgaltAllDun(item._id);
                            openResult();
                          }}
                        >
                          <DocumentChartBarIcon className="w-6 h-6 hover:scale-125 transition-all text-green-600" />
                        </button>
                        <button
                          onClick={() => {
                            getShalgaltList(item._id);
                            setedit(true);
                            setExam(item);
                            openModal();
                          }}
                        >
                          <PencilIcon className="w-6 h-6 hover:scale-125 transition-all text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setExam(item);
                            openDeleteModal(true);
                          }}
                        >
                          <TrashIcon className="w-6 h-6 hover:scale-125 transition-all text-red-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
      {(user?.role === "bagsh" || user?.role === "teacher") && <ShalgaltList />}
    </div>
  );
};

export default ExamList;
