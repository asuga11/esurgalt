import { Dialog, Transition } from "@headlessui/react";
import { uploadBaseUrl } from "../../config";
import {
  ClockIcon,
  EyeIcon,
  PlayCircleIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";

import React, { Fragment, useContext, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";

import MainContext from "../../Context/MainContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import renderRichText from "../../renderRichText";
import { toast } from "react-hot-toast";

const SurgaltDetail = () => {
  const { id } = useParams();

  useEffect(() => {
    getSurgaltOne(id);
    window[`scrollTo`]({ top: 0, behavior: `smooth` });
  }, []);

  const { getSurgaltOne, surgaltStateOne, user, addSurgaltMember } =
    useContext(MainContext);
  const [value, setValue] = useState(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                        <button
                          type="button"
                          className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-700 py-6 shadow-xl text-slate-900 dark:text-white">
                      <div className="px-4 sm:px-6">
                        <Dialog.Title className="text-lg font-medium ">
                          Худалдан авалт
                        </Dialog.Title>
                      </div>
                      {surgaltStateOne && (
                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                          {/* Replace with your content */}
                          <h1 className=" text-slate-900 dark:text-white  text-2xl font-extrabold text-center">
                            {surgaltStateOne?.name}
                            <h3>{surgaltStateOne?.angilal_id?.name}</h3>
                          </h1>
                          <img
                            className="object-cover object-center w-full block rounded-lg"
                            src={`${uploadBaseUrl}/lms/${surgaltStateOne?.photo}`}
                            alt="photo"
                          />

                          <div className="p-4 space-y-2">
                            <p className="text-center font-bold uppercase border-b-2 p-2">
                              Төлбөрийн мэлээлэл
                            </p>
                            <p className="flex gap-2">
                              БАНК:{" "}
                              <p className="font-bold">
                                {surgaltStateOne.tulbur_bank}
                              </p>
                            </p>
                            <p className="flex gap-2">
                              ДАНСНЫ ДУГААР:{" "}
                              <p className="font-bold">
                                {surgaltStateOne.tulbur_dans}
                              </p>
                            </p>
                            <p className="flex gap-2">
                              ДАНС ЭЗЭМШИГЧ:{" "}
                              <p className="font-bold">
                                {surgaltStateOne.tulbur_ezen}
                              </p>
                            </p>
                            <p className="flex gap-2">
                              МӨНГӨН ДҮН:{" "}
                              <p className="mt-1 text-slate-900 dark:text-white font-bold">
                                {surgaltStateOne.sale > 0
                                  ? surgaltStateOne.info?.sellingPrice
                                  : `${surgaltStateOne.price.toLocaleString(
                                      "en-US"
                                    )} ₮`}
                              </p>
                            </p>
                            <p className="flex gap-2">
                              ГҮЙЛГЭЭНИЙ УТГА:{" "}
                              <p className="font-bold">
                                {surgaltStateOne.tulbur_utga}
                              </p>
                            </p>
                            <p className="flex gap-2">
                              Мэдээлэл:{" "}
                              <p className="font-bold">
                                {surgaltStateOne.tulbur_info}
                              </p>
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              toast.success("Төлбөр хүлээгдэж байна");
                            }}
                            type="button"
                            className="text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-lg px-3 py-2 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 duration-300 justify-center w-full"
                          >
                            <svg
                              aria-hidden="true"
                              className="w-6 h-6 mr-2 -ml-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            Төлбөр шалгах
                          </button>
                          {/* /End replace */}
                        </div>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {surgaltStateOne && (
        <>
          <section className="site-hero site-hero-tall">
            <div className="site-hero-glow" />
          </section>
          <div className="grid md:grid-cols-3 gap-4 container mx-auto max-w-6xl my-4 p-4 -mt-36 z-20 relative">
            <div className="col-span-2  bg-white dark:bg-slate-600 dark:text-white shadow-2xl rounded-lg p-4 space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {surgaltStateOne?.name}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">
                  {surgaltStateOne?.angilal_id?.name}
                </p>
              </div>
              <ReactPlayer
                width="100%"
                controls
                src={value ? value.url : surgaltStateOne.video}
              />

              <div className="w-full p-6 space-y-3">
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {renderRichText(surgaltStateOne.description || "")}
                </div>
              </div>
            </div>

            <div>
              <div className="p-4 bg-white rounded-lg dark:bg-slate-600 shadow-2xl flex flex-col text-slate-900 dark:text-white space-y-4">
                <img
                  className="object-cover object-center w-full block rounded-lg"
                  src={`${uploadBaseUrl}/lms/${surgaltStateOne.photo}`}
                />
                <div className="flex gap-2 text-2xl font-bold">
                  <p className="mt-1 text-slate-900 dark:text-white">
                    {surgaltStateOne.sale > 0
                      ? surgaltStateOne.info?.sellingPrice
                      : `${surgaltStateOne.price.toLocaleString("en-US")} ₮`}
                  </p>
                  {surgaltStateOne.sale > 0 && (
                    <p className=" mt-1 text-slate-500 dark:text-slate-800 line-through ">
                      {surgaltStateOne.price.toLocaleString("en-US")} ₮
                    </p>
                  )}
                </div>
                {surgaltStateOne.members?.filter(
                  (el) => el.status === "Худалдаж авсан" && el._id === user.id
                ).length === 0 && (
                  <button
                    onClick={() => {
                      setOpen(true);
                      user &&
                        addSurgaltMember(surgaltStateOne._id, {
                          _id: user.id,
                          member_name: user.name,
                          member_role: user.role,
                          member_school: user.surguuli_id,
                          member_class: user.class,
                          startTime: "2023-10-26",
                          tulbur: surgaltStateOne.price,
                          status: "Хүсэлт илгээсэн",
                        });
                    }}
                    type="button"
                    className="text-white bg-blue-600 hover:bg-blue-800 font-medium rounded-lg text-xl px-3 py-4 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 duration-300 justify-center"
                  >
                    <svg
                      aria-hidden="true"
                      className="w-6 h-6 mr-2 -ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Худалдаж авах
                  </button>
                )}
                <div className="">
                  <p className="inline-flex gap-1 items-center w-full justify-between border-b py-2">
                    <p className="inline-flex gap-1 items-center">
                      <VideoCameraIcon className="w-5 h-5 " />
                      Хичээл
                    </p>
                    {surgaltStateOne?.info?.countLesson} видео
                  </p>
                  <p className="inline-flex gap-1 items-center w-full justify-between border-b py-2">
                    <p className="inline-flex gap-1 items-center">
                      <ClockIcon className="w-5 h-5 " />
                      Үргэлжлэх хугацаа
                    </p>
                    {surgaltStateOne?.info?.lessonTime}
                  </p>
                  <p className="inline-flex gap-1 items-center w-full justify-between border-b py-2">
                    <p className="inline-flex gap-1 items-center">
                      <EyeIcon className="w-5 h-5 " />
                      Харсан
                    </p>
                    {surgaltStateOne?.numberOfViews}
                  </p>
                  <p className="inline-flex gap-1 items-center w-full justify-between border-b py-2">
                    <p className="inline-flex gap-1 items-center">
                      <UserGroupIcon className="w-5 h-5 " />
                      Cурагчид
                    </p>
                    {surgaltStateOne?.info?.countMembers} Cурагчид
                  </p>
                </div>

                <div className="flex flex-col gap-2 pr-4 max-h-[600px] scroll-th scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:text-white  w-full">
                  {surgaltStateOne?.lessons
                    .sort((a, b) => a.number - b.number)
                    .map((item, index) => {
                      return (
                        <button
                          disabled={
                            surgaltStateOne.members?.filter(
                              (el) =>
                                el.status === "Худалдаж авсан" &&
                                el._id === user.id
                            ).length > 0
                              ? false
                              : true
                          }
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
                ${
                  value?.number === item.number
                    ? " bg-orange-500 dark:bg-orange-600 dark:text-gray-200 text-white"
                    : " bg-gray-200 text-slate-800  dark:bg-slate-700 dark:text-gray-300 "
                }`}
                        >
                          <p className="text-base font-extrabold flex flex-col w-full">
                            {item.lessonName}
                            <p className="text-xs ">
                              Үргэлжлэх хугацаа: {item.lessonTime}
                            </p>
                          </p>
                          <PlayCircleIcon className="w-10 h-10" />
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SurgaltDetail;
