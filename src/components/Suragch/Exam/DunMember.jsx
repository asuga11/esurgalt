import { useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MainContext from "../../../Context/MainContext";
import CollectionState from "../../General/CollectionState";
import ExamResultDetails from "./ExamResultDetails";

export default function DunMember({ closeDun }) {
  const { dunMember } = useContext(MainContext);
  const result = dunMember?.shalgaltdun;
  return (
    <Dialog open onClose={closeDun} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/60" />
      <div className="fixed inset-0 overflow-auto p-2 sm:p-5">
        <DialogPanel className="app-panel mx-auto w-full max-w-6xl overflow-clip shadow-xl">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
            <DialogTitle className="font-extrabold">Оролцогчийн дүн</DialogTitle>
            <button type="button" aria-label="Хаах" onClick={closeDun} className="app-icon-button"><XMarkIcon aria-hidden="true" className="size-5" /></button>
          </header>
          <div className="p-3 sm:p-5">
            {dunMember?.success && result ? <ExamResultDetails result={result} examName={result.member_name} showAnswers />
              : dunMember?.success === false && dunMember?.error ? <CollectionState state="error" title="Дүнгийн мэдээлэл ачаалагдсангүй" />
                : <CollectionState state="loading" title="Үр дүнг ачаалж байна…" />}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
