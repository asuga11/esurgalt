import { decode } from "html-entities";
import renderRichText from "../../../renderRichText";
import { Dialog, Disclosure, Transition } from "@headlessui/react";

import React, { Fragment, useContext, useState } from "react";
import MainContext from "../../../Context/MainContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const DunMember = ({ closeDun }) => {
  const { getExamMemberResult, dunMember } = useContext(MainContext);
  const [data, setData] = useState({});
  const [value, setValue] = useState(false);
  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          closeDun();
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
                <Transition appear show={value} as={Fragment}>
                  <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => {
                      setValue(false);
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
                              "max-w-xl"
                            )}
                          >
                            <div
                              className={classNames(
                                "relative w-full h-full  md:h-auto"
                              )}
                            >
                              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <button
                                  onClick={() => setValue(false)}
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
                                <div className="px-4 py-8">
                                  <div className="p-2 max-h-32 scroll-th scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full ">
                                    {renderRichText(
                                      decode(data.testsan_id?.question)
                                    )}
                                  </div>
                                  <button className="px-2 w- bg-blue-600 rounded-lg text-white my-2">
                                    {data?.testsan_id?.testType}
                                  </button>
                                  <div className="border rounded-lg p-2">
                                    Таны хариу:
                                    {(data?.testsan_id?.testType ===
                                      "Нэг сонголттой" ||
                                      data?.testsan_id?.testType ===
                                        "Олон сонголттой") &&
                                      data?.studAnswers?.length > 0 &&
                                      data?.studAnswers?.map((item, index) => {
                                        const hariu =
                                          data?.testsan_id?.answers?.find(
                                            (el) => el._id === item._id
                                          );
                                        return (
                                          <p
                                            className={` ${
                                              hariu?.correct
                                                ? "border-emerald-600"
                                                : "border-rose-600"
                                            } mt-2 border rounded-lg p-2`}
                                          >
                                            {renderRichText(
                                              decode(hariu?.answer)
                                            )}
                                          </p>
                                        );
                                      })}
                                    {data.testsan_id?.testType === "Нөхөх" &&
                                      data?.studAnswers?.map((item, index) => {
                                        return (
                                          <p
                                          // className={` ${
                                          //   hariu?.correct
                                          //     ? "border-emerald-600"
                                          //     : "border-rose-600"
                                          // } mt-2 border rounded-lg p-2`}
                                          >
                                            {renderRichText(
                                              decode(item?.value)
                                            )}
                                          </p>
                                        );
                                      })}
                                  </div>
                                  {data.testsan_id?.answers?.map(
                                    (el, index) => {
                                      return (
                                        <div
                                          className={` ${
                                            el.correct &&
                                            "border border-green-600"
                                          } mt-4 p-2 rounded-xl`}
                                        >
                                          <p
                                            className={`${
                                              el.correct &&
                                              "font-bold text-green-600"
                                            } text-sm border-b`}
                                          >
                                            хариу {index + 1}
                                          </p>{" "}
                                          {renderRichText(decode(el.answer))}
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
                <div
                  className={classNames("relative w-full h-full  md:h-auto")}
                >
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="absolute top-3 left-8 dark:text-white">
                      Тестүүд
                    </div>
                    <button
                      onClick={closeDun}
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
                    <div className="px-6 py-6 ">
                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <kbd className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg ">
                          Зөв хариулсан - {dunMember?.shalgaltdun?.tooZuvHariu}{" "}
                          / {dunMember?.shalgaltdun?.onooZuvHariu} оноо /
                        </kbd>{" "}
                        <kbd className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg ">
                          Буруу хариулсан -{" "}
                          {dunMember?.shalgaltdun?.niitTest -
                            dunMember?.shalgaltdun?.tooZuvHariu}
                          /{" "}
                          {dunMember?.shalgaltdun?.onooNiitTest -
                            dunMember?.shalgaltdun?.onooZuvHariu}
                          оноо /
                        </kbd>
                      </div>
                      <div className="grid gap-6 px-4 pt-4 sm:px-0 sm:grid-cols-2 md:grid-cols-3 ">
                        {dunMember?.shalgaltdun?.contentQuiz?.map(
                          (item, index) => {
                            return (
                              <div
                                key={index}
                                className="bg-gray-200 dark:bg-gray-500 rounded-lg h-44 shadow-2xl"
                              >
                                <div className="bg-gray-300 dark:bg-gray-600 rounded-t-lg p-2 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setValue(true);
                                      setData(item);
                                    }}
                                    className="bg-blue-600 px-2 text-white rounded-md text-sm"
                                  >
                                    Хариу харах
                                  </button>
                                  {item.onoo > 0 ? (
                                    <kbd className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg ">
                                      Зөв
                                    </kbd>
                                  ) : (
                                    <kbd className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg ">
                                      Буруу
                                    </kbd>
                                  )}
                                  <div className="grow"></div>
                                  {item.onoo > 0 ? (
                                    <kbd className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg ">
                                      {item.testsan_id?.points}{" "}
                                      {item.testsan_id?.testType ===
                                        "Задгай даалгавар" && `- ${item.onoo} `}
                                      Оноо
                                    </kbd>
                                  ) : (
                                    <kbd className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg ">
                                      {item.testsan_id?.points}{" "}
                                      {item.testsan_id?.testType ===
                                        "Задгай даалгавар" && `- ${item.onoo} `}
                                      Оноо
                                    </kbd>
                                  )}
                                </div>
                                <div className="p-2 h-32 scroll-th scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                                  {renderRichText(
                                    decode(item.testsan_id?.question)
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DunMember;
