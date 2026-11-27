import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { uploadBaseUrl } from "../../config";

import MainContext from "../../Context/MainContext";
import { Dialog, Transition } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import ReactPlayer from "react-player";
import { Link } from "react-router-dom";
import { AiOutlineCloudUpload } from "react-icons/ai";
import JoditEditor from "jodit-react";
import { sanitizeRichText } from "../../renderRichText";
import { coursePrice } from "../../components/Surgalt/coursePrice";
import CourseWatchDialog from "../../components/Surgalt/CourseWatchDialog";
import { courseVideoUrl } from "../../components/Surgalt/courseVideoUrl";
import { coursePlayerConfig } from "../../components/Surgalt/coursePlayerConfig";
import { decode } from "html-entities";
function BagshSurgalt({ themes }) {
  const {
    getBagshSurgalt,
    surgaltState,
    user,
    getBagshSurgaltOne,
    getManagedCourse,
    surgaltStateOne,
    setsurgaltStateOne,
    addSurgalt,
    updateSurgalt,
    deleteSurgalt,
    getAngilal,
    angilalState,
    addlesson,
    updateLesson,
    deleteLesson,
    getBagshSurguuli,
    bagshState,
    getSurguuliAimag,
    surguuliState,
    uploadSurgaltPhoto,
    uploadLessonVideo,
    lesson,
    setlesson,
    updateSurgaltMember,
  } = useContext(MainContext);
  useEffect(() => {
    if (user?.role === "bagsh" || user?.role === "teacher") {
      getBagshSurgalt(user?.id);
    }
    getAngilal();
  }, []);
  const [data, setData] = useState({});
  const [watchCourse, setWatchCourse] = useState(null);
  let [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function openDeleteModal() {
    setIsDeleteOpen(true);
  }
  function closeDeleteModal() {
    setIsDeleteOpen(false);
  }
  let [modal, setModal] = useState(false);

  function openModal() {
    setModal(true);
  }
  function closeModal() {
    setsurgaltStateOne(null);
    setModal(false);
  }

  let [lessonModal, setlessonModal] = useState(false);

  function openLessonModal() {
    setlessonModal(true);
  }
  function closeLessonModal() {
    setlesson({});
    setlessonModal(false);
  }

  const editor = useRef(null);
  const config = {
    readonly: false,
    placeholder: "Бичиж эхлэх...",
    buttons:
      "bold,underline,strikethrough,table,ul,ol,font,fontsize,paragraph,superscript,subscript,image,video,preview,indent,outdent,brush,hr",
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
  const uploadImage = (files) => {
    const photo = new FormData();
    photo.append("file", files[0]);
    photo.append("upload_preset", "demo1");
    uploadSurgaltPhoto(surgaltStateOne._id, photo, user?.id);
  };
  const uploadVideo = (files) => {
    const photo = new FormData();
    photo.append("file", files[0]);
    photo.append("lesson_id", lesson._id);
    uploadLessonVideo(surgaltStateOne._id, photo, setlesson);
  };
  const [edit, setedit] = useState(false);
  const lessonVideoUrl = courseVideoUrl(lesson?.url, lesson?.lessonType);

  return (
    <div>
      {watchCourse && <CourseWatchDialog key={watchCourse._id} course={watchCourse}
        loadCourse={getManagedCourse} onClose={() => setWatchCourse(null)} />}
      <Transition appear show={lessonModal} as={Fragment}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                  <div className="relative w-full h-full max-w-md md:h-auto">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <button
                        onClick={() => {
                          closeLessonModal(false);
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
                      <div className="p-6 space-y-2">
                        <div>
                          <label
                            htmlFor="first_name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Хичээлийн нэр
                          </label>
                          <input
                            value={lesson?.lessonName}
                            onChange={(e) => {
                              setlesson({
                                ...lesson,
                                lessonName: e.target.value,
                              });
                            }}
                            type="text"
                            id="first_name"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 justify-between">
                          <div>
                            <label
                              htmlFor="first_name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Дугаар
                            </label>
                            <input
                              value={lesson?.number}
                              onChange={(e) => {
                                setlesson({
                                  ...lesson,
                                  number: e.target.value,
                                });
                              }}
                              type="number"
                              id="first_name"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="first_name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Хугацаа
                            </label>
                            <input
                              value={lesson?.lessonTime}
                              onChange={(e) => {
                                setlesson({
                                  ...lesson,
                                  lessonTime: e.target.value,
                                });
                              }}
                              type="number"
                              id="first_name"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="first_name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            <div className="flex items-center mb-2">
                              <input
                                onChange={(e) => {
                                  setlesson({
                                    ...lesson,
                                    lessonType: e.target.checked,
                                  });
                                }}
                                checked={lesson.lessonType}
                                type="checkbox"
                                defaultValue
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <label
                                htmlFor="default-checkbox"
                                className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                              >
                                Video URL оруулах
                              </label>
                            </div>
                          </label>
                          <div className="flex gap-4 items-center">
                            <input
                              disabled={!lesson.lessonType}
                              onChange={(e) => {
                                setlesson({ ...lesson, url: e.target.value });
                              }}
                              value={lesson?.url}
                              type="text"
                              id="video_url"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              required
                            />
                            {!lesson.lessonType && (
                              <label htmlFor="video-file">
                                <input
                                  onChange={(e) => {
                                    setlesson({ ...lesson, lessonType: false });
                                    uploadVideo(e.target.files);
                                  }}
                                  id="video-file"
                                  type="file"
                                  className="hidden"
                                />
                                <AiOutlineCloudUpload className="w-10 h-10 cursor-pointer text-slate-800 dark:text-white" />
                              </label>
                            )}
                          </div>
                        </div>

                        {lessonVideoUrl && (
                          <div className="border">
                            <ReactPlayer
                              config={coursePlayerConfig}
                              width="100%"
                              height="200px"
                              controls
                              src={lessonVideoUrl}
                            />
                          </div>
                        )}
                        <div>
                          <label
                            htmlFor="first_name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Хичээлийн танилцуулга
                          </label>
                          <JoditEditor
                            ref={editor}
                            value={lesson.introduction}
                            config={config}
                            tabIndex={1}
                            onBlur={(newContent) => {
                              setlesson({
                                ...lesson,
                                introduction: newContent,
                              });
                            }}
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => {
                              delete lesson?.fileSan;
                              updateLesson(surgaltStateOne._id, lesson);
                              closeLessonModal();
                            }}
                            type="button"
                            className="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-1.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700  "
                          >
                            Хадгалах
                          </button>
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
      <Transition appear show={isDeleteOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                  <div className="relative w-full h-full max-w-md md:h-auto">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <button
                        onClick={() => {
                          closeDeleteModal(false);
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
                      <div className="p-6 text-center space-y-2">
                        <TrashIcon className="mx-auto mb-2 text-red-600 w-14 h-14 dark:text-red-500" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          Та устгахдаа итгэлтэй байна уу?
                        </h3>
                        <button
                          onClick={() => {
                            deleteSurgalt(
                              surgaltStateOne._id,
                              surgaltStateOne.owner_id,
                              edit
                            );
                            closeDeleteModal(false);
                          }}
                          data-modal-toggle="popup-modal"
                          type="button"
                          className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                        >
                          Тиймээ би итгэлтэй байна
                        </button>
                        <button
                          onClick={() => {
                            closeDeleteModal(false);
                          }}
                          data-modal-toggle="popup-modal"
                          type="button"
                          className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                        >
                          Үгүй, цуцлах
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={modal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px]" />
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
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                  <div className="relative w-full h-full md:h-auto">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 pt-6">
                      <button
                        onClick={() => {
                          if (edit === false) {
                            deleteSurgalt(
                              surgaltStateOne._id,
                              surgaltStateOne.owner_id,
                              edit
                            );
                          }
                          closeModal();
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
                      <div className="p-6">
                        {surgaltStateOne && (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label
                                  htmlFor="course-category"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Ангилал сонгох
                                </label>
                                <select
                                  onChange={(e) => {
                                    setsurgaltStateOne({
                                      ...surgaltStateOne,
                                      angilal_id: e.target.value,
                                    });
                                  }}
                                  value={surgaltStateOne?.angilal_id}
                                  id="course-category"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                  <option value="">Ангилал сонгох</option>
                                  {angilalState.angilal.map((item, index) => {
                                    return (
                                      <option key={index} value={item._id}>
                                        {item.name}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                              <div>
                                <label
                                  htmlFor="first_name"
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  Сургалтын нэр
                                </label>
                                <input
                                  onChange={(e) => {
                                    setsurgaltStateOne({
                                      ...surgaltStateOne,
                                      name: e.target.value,
                                    });
                                  }}
                                  value={surgaltStateOne?.name}
                                  type="text"
                                  id="first_name"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                />
                              </div>
                              <div className="flex gap-4 flex-col sm:flex-row">
                                <div>
                                  <label
                                    htmlFor="first_name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Сургалтын үнэ
                                  </label>
                                  <input
                                    onChange={(e) => {
                                      setsurgaltStateOne({
                                        ...surgaltStateOne,
                                        price: e.target.value,
                                      });
                                    }}
                                    value={surgaltStateOne?.price}
                                    type="number"
                                    id="first_name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor="first_name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                  >
                                    Хямдрал хувь
                                  </label>
                                  <input
                                    onChange={(e) => {
                                      setsurgaltStateOne({
                                        ...surgaltStateOne,
                                        sale: e.target.value,
                                      });
                                    }}
                                    value={surgaltStateOne?.sale}
                                    type="number"
                                    id="first_name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <div className=" flex gap-4 items-center relative ">
                                  <img
                                    src={`${uploadBaseUrl}/lms/${surgaltStateOne.photo}`}
                                    alt="surgalphoto"
                                    className="w-full rounded-lg"
                                  />
                                  <label
                                    htmlFor="dropzone-file"
                                    className="absolute bottom-4 right-4 z-10"
                                  >
                                    <input
                                      onChange={(e) => {
                                        uploadImage(e.target.files);
                                      }}
                                      id="dropzone-file"
                                      type="file"
                                      className="hidden"
                                    />

                                    <div className="px-4 py-1 bg-blue-600 rounded-3xl flex gap-2 items-center text-white cursor-pointer">
                                      <AiOutlineCloudUpload className="w-5 h-5  " />
                                      Зураг солих{" "}
                                    </div>
                                  </label>
                                </div>
                              </div>
                              <div className=" flex flex-col gap-1">
                                <input
                                  onChange={(e) => {
                                    setsurgaltStateOne({
                                      ...surgaltStateOne,
                                      video: e.target.value,
                                    });
                                  }}
                                  value={surgaltStateOne?.video}
                                  type="text"
                                  placeholder="Танилцуулга видео url..."
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                />
                                <ReactPlayer
                                  config={coursePlayerConfig}
                                  width="100%"
                                  height="150px"
                                  controls
                                  src={surgaltStateOne?.video}
                                />
                              </div>
                              <div className="">
                                <JoditEditor
                                  ref={editor}
                                  value={sanitizeRichText(decode(surgaltStateOne?.description))}
                                  config={config}
                                  tabIndex={1}
                                  onBlur={(newContent) => {
                                    setsurgaltStateOne({
                                      ...surgaltStateOne,
                                      description: newContent,
                                    });
                                  }}
                                />
                              </div>
                              <div className="w-full mt-4">
                                <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                  <input
                                    onChange={(e) => {
                                      setsurgaltStateOne({
                                        ...surgaltStateOne,
                                        isTulbur: e.target.checked,
                                      });
                                    }}
                                    checked={surgaltStateOne?.isTulbur}
                                    type="checkbox"
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                    Төлөртэй эсэх
                                  </span>
                                </label>
                              </div>
                              {surgaltStateOne.isTulbur && (
                                <>
                                  <div>
                                    <label
                                      htmlFor="first_name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Банкны нэр
                                    </label>
                                    <input
                                      onChange={(e) => {
                                        setsurgaltStateOne({
                                          ...surgaltStateOne,
                                          tulbur_bank: e.target.value,
                                        });
                                      }}
                                      value={surgaltStateOne?.tulbur_bank}
                                      type="text"
                                      id="first_name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="first_name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Данс
                                    </label>
                                    <input
                                      onChange={(e) => {
                                        setsurgaltStateOne({
                                          ...surgaltStateOne,
                                          tulbur_dans: e.target.value,
                                        });
                                      }}
                                      value={surgaltStateOne?.tulbur_dans}
                                      type="text"
                                      id="first_name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="first_name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Эзэн
                                    </label>
                                    <input
                                      onChange={(e) => {
                                        setsurgaltStateOne({
                                          ...surgaltStateOne,
                                          tulbur_ezen: e.target.value,
                                        });
                                      }}
                                      value={surgaltStateOne?.tulbur_ezen}
                                      type="text"
                                      id="first_name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="first_name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Утга
                                    </label>
                                    <input
                                      onChange={(e) => {
                                        setsurgaltStateOne({
                                          ...surgaltStateOne,
                                          tulbur_utga: e.target.value,
                                        });
                                      }}
                                      value={surgaltStateOne?.tulbur_utga}
                                      type="text"
                                      id="first_name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="first_name"
                                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                      Мэдээлэл
                                    </label>
                                    <input
                                      onChange={(e) => {
                                        setsurgaltStateOne({
                                          ...surgaltStateOne,
                                          tulbur_info: e.target.value,
                                        });
                                      }}
                                      value={surgaltStateOne?.tulbur_info}
                                      type="text"
                                      id="first_name"
                                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                      required
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                closeModal();
                                updateSurgalt(surgaltStateOne);
                              }}
                              type="button"
                              className="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-1.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 mt-4"
                            >
                              Хадгалах
                            </button>

                            <div className="inline-flex items-center justify-center w-full">
                              <hr className="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-600" />
                              <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-700">
                                Хичээлүүд
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                addlesson(surgaltStateOne._id, {
                                  lessonName: `Хичээл  
                                    ${surgaltStateOne?.lessons?.length + 1}`,
                                  number: surgaltStateOne?.lessons?.length + 1,
                                });
                                // openLessonModal();
                              }}
                              type="button"
                              className="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-1.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700  "
                            >
                              Хичээл нэмэх
                            </button>
                            <div className="flex gap-4">
                              <div role="region" aria-label="Сургалтын хичээлүүд" tabIndex={0} className="app-table-scroll max-h-96">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
                                  <thead className="top-0 text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-400">
                                    <tr>
                                      <th scope="col" className="px-2 py-3">
                                        №
                                      </th>
                                      <th scope="col" className="px-6 py-3">
                                        Хичээлийн нэр
                                      </th>
                                      <th scope="col" className="px-6 py-3">
                                        Хугацаа
                                      </th>
                                      <th scope="col" className="px-6 py-3">
                                        Үйлдэл
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {surgaltStateOne?.lessons
                                      ?.sort((a, b) =>
                                        a.number < b.number ? 1 : -1
                                      )
                                      .map((item, index) => {
                                        return (
                                          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <th
                                              scope="row"
                                              className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                            >
                                              {item.number}
                                            </th>
                                            <th
                                              scope="row"
                                              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                            >
                                              {item.lessonName}
                                            </th>
                                            <td className="px-6 py-4 ">
                                              <p>{item.lessonTime}</p>
                                            </td>

                                            <td className="px-2 py-4 flex gap-8">
                                              <button
                                                onClick={() => {
                                                  setlesson({
                                                    ...item,
                                                    edit: true,
                                                  });
                                                  openLessonModal();
                                                }}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                              >
                                                Засах
                                              </button>
                                              <button
                                                onClick={() => {
                                                  deleteLesson(
                                                    surgaltStateOne._id,
                                                    item._id
                                                  );
                                                }}
                                                className="font-medium text-red-600 dark:text-red-500 hover:underline"
                                              >
                                                Устгах
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                              <div role="region" aria-label="Сургалтад бүртгүүлсэн сурагчид" tabIndex={0} className="app-table-scroll max-h-96">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
                                  <thead className="top-0 text-xs text-gray-700  bg-gray-200 dark:bg-gray-900 dark:text-gray-400">
                                    <tr>
                                      <th scope="col" className="px-2 py-3">
                                        №
                                      </th>
                                      <th scope="col" className="px-6 py-3">
                                        Хичээлийн нэр
                                      </th>

                                      <th scope="col" className="px-6 py-3">
                                        Худалдаж авсан эсэх
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {surgaltStateOne?.members?.map(
                                      (item, index) => {
                                        return (
                                          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <th
                                              scope="row"
                                              className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                                            >
                                              {index + 1}
                                            </th>
                                            <th
                                              scope="row"
                                              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                            >
                                              {item.member_name}
                                            </th>

                                            <td className="px-2 py-4 flex gap-8">
                                              <div className="flex items-center mb-4 cursor-pointer">
                                                <input
                                                  id="default-checkbox"
                                                  type="checkbox"
                                                  onChange={(e) => {
                                                    e.target.checked
                                                      ? updateSurgaltMember(
                                                          surgaltStateOne._id,
                                                          {
                                                            _id: item._id,
                                                            status:
                                                              "Худалдаж авсан",
                                                          }
                                                        )
                                                      : updateSurgaltMember(
                                                          surgaltStateOne._id,
                                                          {
                                                            _id: item._id,
                                                            status:
                                                              "Хүсэлт илгээсэн",
                                                          }
                                                        );
                                                  }}
                                                  checked={
                                                    item.status ===
                                                    "Худалдаж авсан"
                                                      ? true
                                                      : false
                                                  }
                                                />
                                                <label
                                                  htmlFor="default-checkbox"
                                                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                                >
                                                  {item.status}
                                                </label>
                                              </div>

                                              {/* <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                                <input
                                                  onChange={(e) => {
                                                    // e.target.checked
                                                  }}
                                                  checked={
                                                    item.status ===
                                                    "Худалдаж авсан"
                                                      ? true
                                                      : false
                                                  }
                                                  type="checkbox"
                                                  className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                  {item.status}
                                                </span>
                                              </label> */}
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
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
      {/* menu */}
      <button
        className="text-white bg-blue-700 hover:bg-blue-800  font-medium rounded-lg text-sm px-5 py-1.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700  "
        onClick={() => {
          setedit(false);
          addSurgalt({
            name: "Сургалтын нэр...",
            angilal_id: "63c1112b029b71a2bd2d0f9a",
            description: "Сургалтын тухай",
            owner_role: user?.role,
            owner_id: user?.id,
            owner_name: user?.name,
          });
          openModal();
        }}
      >
        Шинэ сургалт нэмэх
      </button>
      <Link to="/training" className="app-button-secondary mb-2">Бүх сургалт үзэх</Link>
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
              <option value="">Сонгох</option>
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
              <option value="">Сонгох</option>
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
                getBagshSurgalt(event.target.value);
              }}
              id="small"
              className="block w-full p-2 pr-8  text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Сонгох</option>
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
      </div>
      {/* Surgalt list */}
      <div role="region" aria-label="Сургалтын жагсаалт" tabIndex={0} className="app-table-scroll">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 ">
          <thead className="top-0 text-xs text-gray-700 uppercase bg-gray-200 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-2 py-3">
                Зураг
              </th>
              <th scope="col" className="px-6 py-3">
                Сургалтын нэр
              </th>
              <th scope="col" className="px-6 py-3">
                Ангилал
              </th>
              <th scope="col" className="px-6 py-3">
                Үнэ
              </th>
              <th scope="col" className="px-6 py-3">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody>
            {!surgaltState.surgalt?.length && (
              <tr><td colSpan={5} className="px-6 py-5 text-sm font-semibold">
                {user?.role === "admin" && !data.bagsh ? "Сургалтыг жагсаахын тулд багш сонгоно уу." : "Сургалт олдсонгүй."}
              </td></tr>
            )}
            {surgaltState.surgalt?.map((i) => {
              const price = coursePrice(i);
              return (
                <tr key={i._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th
                    scope="row"
                    className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                  >
                    <img
                      alt=""
                      className="w-24"
                      src={`${uploadBaseUrl}/lms/${i.photo}`}
                    />
                  </th>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {i.name}
                  </th>
                  <td className="px-6 py-4 ">
                    <p> {i.angilal_id?.name}</p>
                  </td>
                  <td className="px-6 py-4 ">
                    <p className="mt-1 text-slate-900 dark:text-white">
                      {price.current}
                    </p>
                    {price.previous && (
                      <p className="mt-1 text-slate-500 line-through dark:text-gray-400">
                        {price.previous}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-4 flex gap-8">
                    <button type="button" onClick={() => setWatchCourse(i)}
                      className="font-bold text-orange-800 hover:underline dark:text-orange-300">
                      Үзэх
                    </button>
                    <button
                      onClick={() => {
                        setedit(true);
                        getBagshSurgaltOne(i._id);
                        openModal();
                      }}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                      Засах
                    </button>
                    <button
                      onClick={() => {
                        setsurgaltStateOne(i);
                        openDeleteModal();
                      }}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline"
                    >
                      Устгах
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BagshSurgalt;
