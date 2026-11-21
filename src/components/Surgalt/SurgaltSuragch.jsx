import React, { useState } from "react";
import { uploadBaseUrl } from "../../config";
import MainContext from "../../Context/MainContext";
import { useContext } from "react";
import { useEffect } from "react";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import ReactPlayer from "react-player";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const SurgaltSuragch = () => {
  useEffect(() => {
    getSuragchSurgalt();
  }, []);

  const [surgalt, setSurgalt] = useState({});
  const { getSuragchSurgalt, suragchSurgalt } = useContext(MainContext);

  const [value, setValue] = useState(null);

  let [modal, setModal] = useState(false);

  function openModal() {
    setModal(true);
  }
  function closeModal() {
    setSurgalt({});
    setModal(false);
  }

  return (
    <div>
      <Transition appear show={modal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            closeModal();
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
                <Dialog.Panel className="w-full max-w-6xl bg-white transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                  <div className="grid md:grid-cols-3 gap-4 container mx-auto max-w-6xl my-4 p-4 z-20 relative">
                    <div className="col-span-2  bg-white dark:bg-slate-600 dark:text-white shadow-2xl rounded-lg p-4 space-y-4">
                      <h1 className=" text-slate-900 dark:text-white  text-2xl font-extrabold text-center">
                        {surgalt?.name}
                        <h3>{surgalt?.angilal_id?.name}</h3>
                      </h1>
                      <ReactPlayer
                        width="100%"
                        controls
                        src={value ? value.url : surgalt.video}
                      />

                      <div className="w-full p-6 space-y-3">
                        <p className="">
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="p-4 bg-white rounded-lg dark:bg-slate-600 shadow-2xl flex flex-col text-slate-900 dark:text-white space-y-4">
                        {/* <img
                              className="object-cover object-center w-full block rounded-lg"
                              src={`${uploadBaseUrl}/lms/${surgalt.photo}`}
                            /> */}

                        <div className="flex flex-col gap-2 pr-4 max-h-[600px] scroll-th scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:text-white  w-full">
                          {surgalt?.lessons
                            ?.sort((a, b) => a.number - b.number)
                            .map((item, index) => {
                              return (
                                <button
                                  onClick={() => {
                                    if (item.url) {
                                      setValue(item);
                                    } else {
                                      // if (user) {
                                      //   toast.error("Худалдаж авна уу!");
                                      // } else {
                                      //   toast.error("Нэвтрээгүй байна!");
                                      // }
                                    }
                                  }}
                                  className={`hover:bg-orange-500 dark:hover:bg-orange-600 duration-300  text-left p-3 rounded-xl flex  justify-between items-center
                ${value?.number === item.number
                                      ? " bg-orange-500 dark:bg-orange-600 dark:text-gray-200 text-white"
                                      : " bg-gray-200 text-slate-800  dark:bg-slate-700 dark:text-gray-300 "
                                    }`}
                                >
                                  <p className="text-base w-full">
                                    {item.number}) {item.lessonName}
                                  </p>
                                  <PlayCircleIcon className="w-10 h-10" />
                                </button>
                              );
                            })}
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
      <div className="col-span-3 w-full p-4 space-y-2">
        <div className="w-full flex justify-between items-center uppercase font-bold">
          <p className="uppercase">Миний СУРГАЛТУУД</p>
          <div>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {suragchSurgalt?.surgaltuud.map((i) => {
            return (
              <div
                onClick={() => {
                  if (i.suraltsagch.status !== "Худалдаж авсан") {
                    toast.error("Таны сургалт идвэхжээгүй байна.");
                  } else {
                    setSurgalt(i.surgalt);
                    openModal();
                  }
                }}
                className="relative w-full cursor-pointer shadow-sm hover:shadow-md hover:shadow-orange-500 rounded-xl duration-500  border dark:border-slate-700 "
              >
                <img
                  alt="study"
                  className="object-cover object-center w-full block rounded-t-lg"
                  src={`${uploadBaseUrl}/lms/${i.surgalt?.photo}`}
                />

                <div className="p-4 flex flex-col">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">
                    {i.surgalt?.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurgaltSuragch;
