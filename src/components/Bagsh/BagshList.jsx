import {
  ClipboardDocumentCheckIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import React, { Fragment, useContext, useEffect, useState } from "react";
import MainContext from "../../Context/MainContext";
import { BiSearch } from "react-icons/bi";
import { Dialog, Transition } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
const BagshList = () => {
  useEffect(() => {
    if (user?.role === "surguuli") {
      getBagshSurguuli(user?.id);
    }
    if (user?.role === "education") {
      getSurguuliAimag(user?.aimag);
    }
  }, []);

  const {
    user,
    getBagshSurguuli,
    bagshState,
    getSurguuliAimag,
    surguuliState,
    addBagsh,
    updateBagsh,
    deleteBagsh,
    changePasswordBagsh,
  } = useContext(MainContext);
  const [bname, setbname] = useState("");
  const [data, setData] = useState({ surguuli: "" });

  const [bagsh, setBagsh] = useState({});
  const changeBagsh = (prop) => (event) => {
    setBagsh({ ...bagsh, [prop]: event.target.value });
  };
  let [isOpen, setIsOpen] = useState(false);
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  let [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function openDeleteModal() {
    setIsDeleteOpen(true);
  }
  function closeDeleteModal() {
    setBagsh({});
    setIsDeleteOpen(false);
  }
  const [password, setPassword] = useState("");

  return (
    <div>
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
                        <TrashIcon className="mx-auto mb-2 text-gray-400 w-14 h-14 dark:text-gray-200" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                          Та устгахдаа итгэлтэй байна уу?
                        </h3>
                        <button
                          onClick={() => {
                            deleteBagsh(bagsh);
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
                              onChange={changeBagsh("lastname")}
                              value={bagsh.lastname}
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
                              onChange={changeBagsh("firstname")}
                              value={bagsh.firstname}
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
                              onChange={changeBagsh("regnum")}
                              value={bagsh.regnum}
                              type="text"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                              placeholder=""
                              required
                            />
                          </div>

                          <div className="w-full">
                            <label
                              htmlFor="teacher-region"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Хүйс
                            </label>
                            <select
                              onChange={changeBagsh("gender")}
                              value={bagsh.gender} id="teacher-region"
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
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Email
                            </label>
                            <input
                              onChange={changeBagsh("email")}
                              value={bagsh.email}
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
                              onChange={changeBagsh("phone1")}
                              value={bagsh.phone1}
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
                              Аймаг/Хот
                            </label>
                            <input
                              onChange={changeBagsh("city")}
                              value={bagsh.city}
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
                              Сум/Дүүрэг
                            </label>
                            <input
                              onChange={changeBagsh("soum")}
                              value={bagsh.soum}
                              type="text"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                              placeholder=""
                              required
                            />
                          </div>
                          <div className="w-full">
                            <label
                              htmlFor="teacher-status"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Төлөв
                            </label>
                            <select
                              onChange={changeBagsh("status")}
                              value={bagsh.status} id="teacher-status"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                              <option aria-label="None" value="" />
                              {["Ажиллаж байгаа", "Гарсан"].map((el, index) => (
                                <option key={index} value={el}>
                                  {el}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {(user?.role === "admin" ||
                          user?.role === "surguuli") &&
                          bagsh?._id && (
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
                                    changePasswordBagsh(bagsh._id, password);
                                  }}
                                  className="text-white absolute right-1 bottom-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-1 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                  Нууц үг солих
                                </button>
                              </div>
                            </div>
                          )}
                        <div className="flex items-center mb-4">
                          <button
                            onClick={() => {
                              if (bagsh._id) {
                                updateBagsh(bagsh);
                              } else {
                                addBagsh(bagsh);
                              }

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
      {data.surguuli && (
        <button
          onClick={() => {
            setBagsh({
              surguuli: data.surguuli,
              role: "bagsh",
              status: "Ажиллаж байгаа",
              isActive: true,
              password: "1234",
              edit: false,
            });
            openModal();
          }}
          type="button"
          className="text-white bg-[#2557D6] hover:bg-[#2557D6]/90  font-medium rounded-lg text-sm px-4 py-1 text-center inline-flex items-center  mr-2 mb-2 gap-2 mt-2"
        >
          <PlusIcon className="w-5 h-5" />
          Багш бүртгэх
        </button>
      )}
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
        <div className="relative flex items-center text-gray-400 focus-within:text-blue-500">
          <span className="absolute left-4 flex h-6 items-center border-r border-gray-300 pr-3 dark:border-gray-700">
            <BiSearch className="w-5 h-5" />
          </span>
          <input
            value={bname}
            onChange={(e) => setbname(e.target.value)}
            type="search"
            name="leadingIcon"
            id="leadingIcon"
            placeholder="Багшийн нэрээр хайх..."
            className="outline-none w-72 rounded-xl border border-gray-300 py-2 pl-14 pr-4 text-sm text-gray-600 transition focus:border-blue-300 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      <div role="region" aria-label="Багшийн жагсаалт" tabIndex={0} className="app-table-scroll">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th>№</th>
              <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">Багшийн нэр</div>
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
            {bagshState.bagsh
              .filter((e) =>
                e.butenNer.toLowerCase().includes(bname.toLowerCase())
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
                      {item.phone1} {item.phone2 && `, ${item.phone2}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <strong
                        className={`rounded text-white px-3 py-1.5 text-xs font-medium ${
                          item.status === "Ажиллаж байгаа"
                            ? "bg-green-600 dark:bg-green-700"
                            : "bg-orange-600 dark:bg-orange-700"
                        }`}
                      >
                        {item.status}
                      </strong>
                    </td>
                    <td className="space-x-2">
                      <button
                        onClick={() => {
                          setBagsh({ ...item, edit: true });
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
                                    deleteBagsh(item._id);
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
                          // setBagsh(item._id);
                          // openDeleteModal();
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

export default BagshList;
