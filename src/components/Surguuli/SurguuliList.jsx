import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import React, { Fragment, useContext, useEffect, useState } from "react";
import MainContext from "../../Context/MainContext";
import { BiSearch } from "react-icons/bi";
import { Dialog, Transition } from "@headlessui/react";

const SurguuliList = () => {
  useEffect(() => {
    if (user?.role === "education") {
      getSurguuliAimag(user?.aimag);
    }
  }, []);

  const {
    getSurguuliAimag,
    surguuliState,
    user,
    updateSurguuli,
    changePassword,
  } = useContext(MainContext);

  const [data, setData] = useState({
    sname: "",
  });
  const [surguuli, setsurguuli] = useState({});
  const [password, setPasswword] = useState("");

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const changeSurguuli = (prop) => (event) => {
    setsurguuli({ ...surguuli, [prop]: event.target.value });
  };

  return (
    <div>
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
                        <div className="w-full gap-2">
                          <div>
                            <label
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Нэр
                            </label>
                            <input
                              onChange={changeSurguuli("ner")}
                              value={surguuli.ner}
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
                              onChange={changeSurguuli("email")}
                              value={surguuli.email}
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
                              Захирал
                            </label>
                            <input
                              onChange={changeSurguuli("zahiral")}
                              value={surguuli.zahiral}
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
                              Богин нэр
                            </label>
                            <input
                              onChange={changeSurguuli("shortName")}
                              value={surguuli.shortName}
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
                              Утас 1
                            </label>
                            <input
                              onChange={changeSurguuli("utas1")}
                              value={surguuli.utas1}
                              type="number"
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
                              Утас 2
                            </label>
                            <input
                              onChange={changeSurguuli("utas2")}
                              value={surguuli.utas2}
                              type="number"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                              placeholder=""
                              required
                            />
                          </div>
                          <div className="w-full mt-4">
                            <label className="inline-flex relative items-center mb-4 cursor-pointer">
                              <input
                                onChange={(e) => {
                                  setsurguuli({
                                    ...surguuli,
                                    isActive: e.target.checked,
                                  });
                                }}
                                checked={surguuli.isActive}
                                type="checkbox"
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Хандах эрх
                              </span>
                            </label>
                          </div>

                          <div>
                            <label
                              htmlFor="search"
                              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                            >
                              Шинэ нууц үг
                            </label>
                            <div className="relative">
                              <input
                                onChange={(e) => {
                                  setPasswword(e.target.value);
                                }}
                                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Шинэ нууц үг"
                                required
                              />
                              <button
                                onClick={() => {
                                  changePassword(surguuli._id, password);
                                }}
                                className="text-white absolute right-1 bottom-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              >
                                Нууц үг солих
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center mb-4">
                          <button
                            onClick={() => {
                              updateSurguuli(surguuli);
                              closeModal();
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
              {["Ховд", "Увс", "Баян-Өлгий", "Завхан", "Говь-Алтай"].map(
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
        <div className="relative flex items-center text-gray-400 focus-within:text-blue-500">
          <span className="absolute left-4 flex h-6 items-center border-r border-gray-300 pr-3 dark:border-gray-700">
            <BiSearch className="w-5 h-5" />
          </span>
          <input
            value={data.sname}
            onChange={(e) => setData({ ...data, sname: e.target.value })}
            type="search"
            name="leadingIcon"
            id="leadingIcon"
            placeholder="Сургуулийн нэрээр хайх..."
            className="outline-none w-72 rounded-xl border border-gray-300 py-2 pl-14 pr-4 text-sm text-gray-600 transition focus:border-blue-300 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div role="region" aria-label="Сургуулийн жагсаалт" tabIndex={0} className="app-table-scroll">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  Сургуулийн нэр
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  Имэйл
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  Утас
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                Төлөв
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {surguuliState.surguuli
              .filter((e) =>
                e.ner.toLowerCase().includes(data.sname.toLowerCase())
              )
              .map((item, index) => {
                return (
                  <tr key={index} className="dark:bg-gray-900">
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      {item.ner}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-200">
                      {item.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-200">
                      {item.utas1}, {item.utas2}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <strong
                        className={`rounded text-white px-3 py-1.5 text-xs font-medium ${
                          item.isActive
                            ? "bg-green-600 dark:bg-green-700"
                            : "bg-red-600 dark:bg-red-700"
                        }`}
                      >
                        {item.isActive ? "Идэвхтэй" : "Цуцалсан"}
                      </strong>
                    </td>
                    <td className="space-x-2">
                      <button
                        onClick={() => {
                          setsurguuli(item);
                          openModal();
                        }}
                        className="hover:bg-gray-400 rounded-lg p-1"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-blue-600 hover:text-white" />
                      </button>
                      {/* <button className="hover:bg-gray-400 rounded-lg p-1">
                      <TrashIcon className="w-5 h-5 text-red-500 " />
                    </button> */}
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

export default SurguuliList;
