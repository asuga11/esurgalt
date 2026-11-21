import { Dialog, Transition } from "@headlessui/react";
import {
  ClipboardDocumentCheckIcon,
  DocumentCheckIcon,
  EnvelopeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import React, { useContext, useEffect, useState } from "react";
import { Fragment } from "react";
import { toast } from "react-hot-toast";

import MainContext from "../../Context/MainContext";
import { useNavigate } from "react-router-dom";

const SuragchList = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "education") {
      getSurguuliAimag(user?.aimag);
    }
    if (user?.role === "surguuli") {
      getAngiSchool(user?.id);
    }
  }, []);

  const {
    getSurguuliAimag,
    surguuliState,
    user,
    getAngiSchool,
    angiState,
    getSuragchAngi,
    suragchState,
    addSuragch,
    updateSuragch,
    deleteSuragch,
    addressState,
    changePasswordSuragch,
  } = useContext(MainContext);

  const [sname, setsname] = useState("");
  const [data, setData] = useState({
    surguuli: "",
    angi: "",
  });

  const [suragch, setSuragch] = useState({});

  const changeSuragch = (prop) => (event) => {
    setSuragch({ ...suragch, [prop]: event.target.value });
  };

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [soum, setSoum] = useState([]);
  const [password, setPassword] = useState("");
  const [suragchid, setSuragchid] = useState([]);

  const customers = () => {
    let custs = [];
    suragchState.suragch.map((el) => {
      custs.push({
        Овог: el.lastname,
        Нэр: el.firstname,
        Имэйл: el.email,
        Утас: el.phone1,
        РД: el.regnum,
      });
    });
    setSuragchid(custs);
  };
  useEffect(() => {
    customers();
  }, [suragchState]);
  let [examOpen, setexamOpen] = useState(false);

  const downloadStudentsCsv = () => {
    const headers = ["Овог", "Нэр", "Имэйл", "Утас", "РД"];
    const escapeCell = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const rows = suragchid.map((student) =>
      headers.map((header) => escapeCell(student[header]))
    );
    const csv = [headers.map(escapeCell), ...rows]
      .map((row) => row.join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "Сурагчид.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Transition appear show={examOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-30 "
          onClose={() => setexamOpen(false)}
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all">
                  <div className="relative w-full h-full md:h-auto">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <button
                        onClick={() => {
                          setexamOpen(false);
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
                      <div className="p-6">asdsad</div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30 " onClose={closeModal}>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                          <div>
                            <label
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Овог
                            </label>
                            <input
                              onChange={changeSuragch("lastname")}
                              value={suragch.lastname}
                              type="text"
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
                              Нэр
                            </label>
                            <input
                              onChange={changeSuragch("firstname")}
                              value={suragch.firstname}
                              type="text"
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
                              Регистр
                            </label>
                            <input
                              onChange={changeSuragch("regnum")}
                              value={suragch.regnum}
                              type="text"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                              placeholder=""
                              required
                            />
                          </div>

                          <div className="w-full">
                            <label
                              htmlFor="student-region"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Хүйс
                            </label>
                            <select
                              onChange={changeSuragch("gender")}
                              value={suragch.gender} id="student-region"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option aria-label="None" value="" />
                              {["Эрэгтэй", "Эмэгтэй"].map((el, index) => (
                                <option key={index} value={el}>
                                  {el}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="buleg"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Бүлэг
                            </label>
                            <input
                              onChange={changeSuragch("buleg")}
                              value={suragch.buleg}
                              type="text"
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
                              Email
                            </label>
                            <input
                              onChange={changeSuragch("email")}
                              value={suragch.email}
                              type="text"
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
                              Утас
                            </label>
                            <input
                              onChange={changeSuragch("phone1")}
                              value={suragch.phone1}
                              type="number"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                              placeholder=""
                              required
                            />
                          </div>
                          {/* <div>
                            <label
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Аймаг/Хот
                            </label>
                            <select
                              onChange={(e) => {
                                const soum = addressState.address.find(
                                  (u) => u.aimagCity === e.target.value
                                );
                                setSoum(soum?.soumDistrict);
                                // setAimag(e.target.value);
                                setSuragch({
                                  ...suragch,
                                  city: e.target.value,
                                });
                              }}
                              value={suragch.city}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option aria-label="None" value="" />
                              {addressState.address.map((el, index) => (
                                <option key={index} value={el.aimagCity}>
                                  {el.aimagCity}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Сум/Дүүрэг
                            </label>
                            <select
                              onChange={(e) => {
                                setSuragch({
                                  ...suragch,
                                  soum: e.target.value,
                                });
                              }}
                              value={suragch.soum}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option aria-label="None" value="" />
                              {soum.map((el, index) => (
                                <option key={index} value={el.name}>
                                  {el.name}
                                </option>
                              ))}
                            </select>
                          </div> */}

                          <div className="w-full">
                            <label
                              htmlFor="student-status"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Төлөв
                            </label>
                            <select
                              onChange={changeSuragch("status")}
                              value={suragch.status} id="student-status"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option aria-label="None" value="" />
                              {["Суралцаж байгаа", "Төгссөн"].map(
                                (el, index) => (
                                  <option key={index} value={el}>
                                    {el}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div className="w-full">
                            <label className="inline-flex relative items-center mb-4 cursor-pointer">
                              <input
                                onChange={(e) => {
                                  setSuragch({
                                    ...suragch,
                                    isActive: e.target.checked,
                                  });
                                }}
                                checked={suragch.isActive}
                                type="checkbox"
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Хандах эрх
                              </span>
                            </label>
                          </div>
                        </div>
                        <div className="my-4">
                          <label
                            htmlFor="search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                          >
                            Шинэ нууц үг
                          </label>
                          <div className="relative">
                            <input
                              onChange={(e) => {
                                setPassword(e.target.value);
                              }}
                              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Шинэ нууц үг"
                              required
                            />
                            <button
                              onClick={() => {
                                changePasswordSuragch(suragch._id, password);
                              }}
                              className="text-white absolute right-1 bottom-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            >
                              Нууц үг солих
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <button
                            onClick={() => {
                              suragch.edit
                                ? updateSuragch(suragch)
                                : addSuragch(suragch);
                              // closeModal();
                            }}
                            type="button"
                            className="text-white bg-[#2557D6] hover:bg-[#2557D6]/90  font-medium rounded-lg text-sm px-4 py-1 text-center inline-flex items-center  mr-2 mb-2 gap-2 mt-2"
                          >
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
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
      {user?.role === "surguuli" && (
        <button
          onClick={() => {
            setSuragch({
              surguuli: user?.id,
              role: "suragch",
              city: user?.aimag,
              soum: user?.sum,
              status: "Суралцаж байгаа",
              isActive: true,
              password: "1234",
              edit: false,
              buleg: data.angi,
              onTugsult: "2023",
            });
            openModal();
          }}
          type="button"
          className="text-white bg-[#2557D6] hover:bg-[#2557D6]/90  font-medium rounded-lg text-sm px-4 py-1 text-center inline-flex items-center  mr-2 mb-2 gap-2 mt-2"
        >
          <PlusIcon className="w-5 h-5" />
          Сурагч бүртгэх
        </button>
      )}
      <div className="flex gap-4">
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
              onChange={(event) => {
                setData({ ...data, surguuli: event.target.value, angi: "" });
                getAngiSchool(event.target.value);
              }}
              id="small"
              className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
        <div className="w-20">
          <label
            htmlFor="small"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white "
          >
            Анги
          </label>
          <select
            value={data.angi}
            onChange={(e) => {
              if (user?.role === "surguuli") {
                getSuragchAngi(user?.id, e.target.value);
              } else {
                getSuragchAngi(data.surguuli, e.target.value);
              }
              setData({ ...data, angi: e.target.value });
            }}
            id="small"
            className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option selected></option>
            {angiState.content.map((item, index) => {
              return (
                <option key={index} value={item.buleg}>
                  {item.buleg}
                </option>
              );
            })}
          </select>
        </div>
        <div className="relative flex items-center text-gray-400 focus-within:text-blue-500 ">
          <span className="absolute left-4 flex h-6 items-center border-r border-gray-300 pr-3 dark:border-gray-700">
            <svg
              xmlns="http://ww50w3.org/2000/svg"
              className="w-4 fill-current"
              viewBox="0 0 35.997 36.004"
            >
              <path
                id="Icon_awesome-search"
                data-name="search"
                d="M35.508,31.127l-7.01-7.01a1.686,1.686,0,0,0-1.2-.492H26.156a14.618,14.618,0,1,0-2.531,2.531V27.3a1.686,1.686,0,0,0,.492,1.2l7.01,7.01a1.681,1.681,0,0,0,2.384,0l1.99-1.99a1.7,1.7,0,0,0,.007-2.391Zm-20.883-7.5a9,9,0,1,1,9-9A8.995,8.995,0,0,1,14.625,23.625Z"
              />
            </svg>
          </span>
          <input
            value={sname}
            onChange={(e) => setsname(e.target.value)}
            type="search"
            name="leadingIcon"
            id="leadingIcon"
            placeholder="Сурагчийн нэрээр хайх..."
            className="outline-none w-72 rounded-xl border border-gray-300 py-2 pl-14 pr-4 text-sm text-gray-600 transition focus:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={downloadStudentsCsv}
        disabled={!suragchid.length}
        className="my-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        CSV татах
      </button>

      <div role="region" aria-label="Сурагчдын жагсаалт" tabIndex={0} className="app-table-scroll">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th>№</th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">Нэр</div>
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">Имэйл</div>
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">Утас</div>
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                Төлөв
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                Үйлдэл
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {suragchState.suragch
              .filter((e) =>
                e.firstname.toLowerCase().includes(sname.toLowerCase())
              )
              .sort((a, b) => (a.firstname > b.firstname ? 1 : -1))
              .map((item, index) => {
                return (
                  <tr key={index} className="dark:bg-gray-900">
                    <td className="text-center">{index + 1}</td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      {item.butenNer}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-200">
                      {item.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-200">
                      {item.phone1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      {item.status}
                    </td>
                    <td className="space-x-2">
                      <button
                        onClick={() => {
                          navigate(`/control/suragch/${item._id}`);
                          // setexamOpen(true);
                        }}
                        className="hover:scale-110  rounded-lg p-1"
                      >
                        <DocumentCheckIcon className="w-5 h-5 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => {
                          const soum = addressState.address.find(
                            (u) => u.aimagCity === item.city
                          );
                          setSoum(soum?.soumDistrict);
                          setSuragch({ ...item, edit: true });
                          openModal();
                        }}
                        className="hover:scale-110  rounded-lg p-1"
                      >
                        <PencilIcon className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          toast.custom(
                            (t) => (
                              <div className="p-6 text-center space-y-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg ">
                                <TrashIcon className="mx-auto mb-2 text-gray-400 w-10 h-10 dark:text-gray-200" />
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                  Та устгахдаа итгэлтэй байна уу?
                                </h3>
                                <button
                                  onClick={() => {
                                    deleteSuragch(item);
                                    toast.dismiss(t.id);
                                  }}
                                  data-modal-toggle="popup-modal"
                                  type="button"
                                  className="text-white bg-red-600 hover:bg-red-800  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                                >
                                  Тиймээ би итгэлтэй байна
                                </button>
                                <button
                                  onClick={() => toast.dismiss(t.id)}
                                  data-modal-toggle="popup-modal"
                                  type="button"
                                  className="text-gray-500 bg-white hover:bg-gray-100  rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900  dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 "
                                >
                                  Үгүй, цуцлах
                                </button>
                              </div>
                            ),
                            { position: "top-center" }
                          );
                        }}
                        className="hover:scale-110  rounded-lg p-1"
                      >
                        <TrashIcon className="w-5 h-5 text-red-500 " />
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
};

export default SuragchList;
