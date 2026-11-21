import { ExclamationCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function CollectionState({ state, title, detail, actionLabel, action }) {
  const Icon = state === "error" ? ExclamationCircleIcon : MagnifyingGlassIcon;

  return (
    <div className="app-panel flex flex-col items-center gap-3 px-5 py-8 text-center sm:py-10">
      {state === "loading" ? (
        <span aria-hidden="true" className="size-8 animate-spin rounded-full border-[3px] border-orange-200 border-t-orange-700 dark:border-orange-950 dark:border-t-orange-300" />
      ) : (
        <Icon aria-hidden="true" className="size-8 text-orange-800 dark:text-orange-300" />
      )}
      <div role={state === "error" ? "alert" : "status"}>
        <p className="font-extrabold">{title}</p>
        {detail && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{detail}</p>}
      </div>
      {action && (
        <button type="button" className="app-button-secondary mt-1" onClick={action}>{actionLabel}</button>
      )}
    </div>
  );
}
