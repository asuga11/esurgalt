import { Dialog, Transition } from "@headlessui/react";
import { decode } from "html-entities";
import React, { Fragment, useRef, useState } from "react";

import { useReactToPrint } from "react-to-print";

const ExamMemberPrint = ({ data, setmemberPrint }) => {
  class ComponentToPrint extends React.PureComponent {
    render() {
      let dollarUSLocale = Intl.NumberFormat("en-US");

      return (
        <div className="">
          <div className="relative overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Нэр
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Сургууль
                  </th>{" "}
                  <th scope="col" className="px-6 py-3">
                    Оноо
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.shalgaltdun
                  .sort((a, b) => (a.onooZuvHariu > b.onooZuvHariu ? -1 : 1))
                  .map((el, index) => {
                    return (
                      <tr key={el._id || index} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                        <th
                          scope="row"
                          className="whitespace-nowrap px-2 font-medium text-gray-900 dark:text-white"
                        >
                          {el.member_name}
                          <p className="text-[8px]"> {el.member_class}</p>
                        </th>
                        <td className="text-[8px]">{el.member_school}</td>
                        <td className="px-2"> {el.onooZuvHariu} оноо </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setmemberPrint(false);
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
              <Dialog.Panel className="w-full transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all max-w-lg">
                <div className="relative w-full h-full  md:h-auto">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button
                      onClick={() => setmemberPrint(false)}
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
                      <button
                        className="bg-blue-600 text-white py-1 px-4 rounded-lg"
                        onClick={handlePrint}
                      >
                        Хэвлэх
                      </button>

                      <div className="w-full mt-8">
                        <div ref={componentRef}>
                          <ComponentToPrint />
                        </div>
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
  );
};

export default ExamMemberPrint;
