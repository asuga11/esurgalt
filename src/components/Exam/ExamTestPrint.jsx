import { Dialog, Transition } from "@headlessui/react";
import { decode } from "html-entities";
import renderRichText from "../../renderRichText";
import React, { Fragment, useRef, useState } from "react";

import { useReactToPrint } from "react-to-print";

const ExamTestPrint = ({ handleClosePOpen, data, info }) => {
  class ComponentToPrint extends React.PureComponent {
    render() {
      let dollarUSLocale = Intl.NumberFormat("en-US");

      return (
        <div className="w-[297mm] min-h-[210mm] px-4 mt-4">
          {data.listTests.map((item, index) => {
            return (
              <div className="border-b">
                <div>
                  <p className="text-sm font-bold">Асуулт № {index + 1}</p>
                  <div>{renderRichText(decode(item.question))}</div>
                </div>
                {item.answers.map((el, index) => {
                  return (
                    <div className="flex">
                      <span
                        className={`mr-4 ${
                          el.correct && correct && "font-bold"
                        }`}
                      >
                        {index + 1}.{" "}
                      </span>
                      <div> {renderRichText(decode(el.answer))}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }
  }
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  const [correct, setCorrect] = useState(false);

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          handleClosePOpen();
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
              <Dialog.Panel className="w-full transform overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all max-w-6xl">
                <div className="relative w-full h-full  md:h-auto">
                  <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button
                      onClick={handleClosePOpen}
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
                      <div className="flex gap-2 items-center mt-4">
                        <input
                          className="rounded-lg"
                          type="checkbox"
                          onChange={(e) => setCorrect(e.target.checked)}
                        />
                        Зөв хариу харуулах эсэх
                      </div>
                      <div className="grid gap-6 px-4 pt-6 sm:px-0 sm:grid-cols-2 md:grid-cols-3">
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

export default ExamTestPrint;
