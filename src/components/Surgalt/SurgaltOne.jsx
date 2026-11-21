/* eslint-disable jsx-a11y/img-redundant-alt */
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
import { Link, useParams } from "react-router-dom";

import CollectionState from "../General/CollectionState";
import { coursePrice } from "./coursePrice";
import MainContext from "../../Context/MainContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import renderRichText from "../../renderRichText";
import { toast } from "react-hot-toast";

const SurgaltOne = () => {
  const { id } = useParams();
  const { getSurgaltOne, surgaltStateOne: selectedCourse, user, addSurgaltMember } =
    useContext(MainContext);

  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const surgaltStateOne = selectedCourse?._id === id ? selectedCourse : null;
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    getSurgaltOne(id, controller.signal).then((success) => {
      if (!controller.signal.aborted) setStatus(success ? "ready" : "error");
    });
    return () => controller.abort();
  }, [id, attempt]);

  const [value, setValue] = useState(null);
  const [open, setOpen] = useState(false);
  const [sname, setSname] = useState("");
  if (status !== "ready" || !surgaltStateOne) {
    return (
      <div className="app-container py-7 sm:py-12">
        {status === "loading"
          ? <CollectionState state="loading" title="Сургалтын мэдээллийг ачаалж байна…" />
          : <CollectionState state="error" title="Сургалтын мэдээллийг ачаалж чадсангүй" actionLabel="Дахин оролдох" action={() => setAttempt((count) => count + 1)} />}
      </div>
    );
  }

  const { current: price, previous: previousPrice } = coursePrice(surgaltStateOne);
  const video = value ? value.url : surgaltStateOne.video;

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
                          <div className="text-center">
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                              {surgaltStateOne?.name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                              {surgaltStateOne?.angilal_id?.name}
                            </p>
                          </div>
                          <img
                            className="object-cover object-center w-full block rounded-lg"
                            src={`${uploadBaseUrl}/lms/${surgaltStateOne?.photo}`}
                            alt="photo"
                          />

                          <div className="p-4 space-y-2">
                            <p className="text-center font-bold uppercase border-b-2 p-2">
                              Төлбөрийн мэдээлэл
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
          <section className="app-container pt-7 sm:pt-12">
            <Link to="/training" className="app-button-secondary mb-4">Сургалтын жагсаалт</Link>
            {surgaltStateOne.angilal_id?.name && (
              <p className="text-sm font-extrabold text-orange-800 dark:text-orange-300">{surgaltStateOne.angilal_id.name}</p>
            )}
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight break-words sm:text-4xl">{surgaltStateOne.name}</h1>
          </section>
          <div className="app-container grid items-start gap-4 py-6 sm:gap-6 lg:grid-cols-3">
            <div className="app-panel min-w-0 space-y-4 p-4 sm:p-6 lg:col-span-2">
              {value && <h2 className="text-lg font-extrabold">{value.number}. {value.lessonName}</h2>}
              {video && (
                <div className="aspect-video overflow-hidden rounded-xl bg-slate-950">
                  <ReactPlayer width="100%" height="100%" controls src={video} />
                </div>
              )}
              <div className="w-full space-y-3">
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {renderRichText(surgaltStateOne.description || "")}
                </div>
              </div>
            </div>

            <div>
              <div className="app-panel flex min-w-0 flex-col gap-4 p-4 sm:p-5">
                {surgaltStateOne.photo && <img alt="" className="aspect-video w-full rounded-xl object-cover" src={`${uploadBaseUrl}/lms/${surgaltStateOne.photo}`} />}
                <div className="flex flex-wrap items-baseline gap-2 text-xl font-extrabold">
                  <p className="text-orange-800 dark:text-orange-300">{price}</p>
                  {previousPrice && <del className="text-sm text-slate-500 dark:text-slate-400">{previousPrice}</del>}
                </div>
                {surgaltStateOne.members?.filter(
                  (el) => el.status === "Худалдаж авсан" && el._id === user?.id
                ).length === 0 &&
                  surgaltStateOne?.isTulbur && (
                    <button
                      type="button"
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
                      className="app-button-primary w-full"
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
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-2.5 text-sm dark:border-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <VideoCameraIcon className="w-5 h-5 " />
                      Хичээл
                    </span>
                    {surgaltStateOne?.info?.countLesson} видео
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-2.5 text-sm dark:border-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="w-5 h-5 " />
                      Үргэлжлэх хугацаа
                    </span>
                    {surgaltStateOne?.info?.lessonTime}
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-2.5 text-sm dark:border-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <EyeIcon className="w-5 h-5 " />
                      Харсан
                    </span>
                    {surgaltStateOne?.numberOfViews}
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-2.5 text-sm dark:border-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <UserGroupIcon className="w-5 h-5 " />
                      Cурагчид
                    </span>
                    {surgaltStateOne?.info?.countMembers} Cурагчид
                  </div>
                </div>

                <div className="flex flex-col gap-2 pr-4 max-h-[600px] scroll-th scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-gray-300 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:text-white  w-full">
                  {[...(surgaltStateOne?.lessons || [])]
                    .sort((a, b) => a.number - b.number)
                    .map((item, index) => {
                      return (
                        <button
                          key={item._id || item.number || index}
                          type="button"
                          disabled={!item.url}
                          // disabled={
                          //   surgaltStateOne.members?.filter(
                          //     (el) =>
                          //       el.status === "Худалдаж авсан" &&
                          //       el._id === user.id
                          //   ).length > 0
                          //     ? false
                          //     : true
                          // }
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
                          className={`text-left p-3 rounded-xl flex justify-between items-center transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${item.url ? "hover:bg-orange-500 dark:hover:bg-orange-600" : ""}
                ${
                  value?.number === item.number
                    ? " bg-orange-500 dark:bg-orange-600 dark:text-gray-200 text-white"
                    : " bg-gray-200 text-slate-800  dark:bg-slate-700 dark:text-gray-300 "
                }`}
                        >
                          <span className="flex w-full flex-col text-base font-extrabold">
                            <span>{item.lessonName}</span>
                            <span className="text-xs font-medium">
                              Үргэлжлэх хугацаа: {item.lessonTime}
                            </span>
                          </span>
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

export default SurgaltOne;
