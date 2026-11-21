export default function Loader() {
  return (
    <div role="status" className="grid min-h-[40vh] place-items-center px-4 py-10 text-center">
      <div>
        <span aria-hidden="true" className="mx-auto block size-9 animate-spin rounded-full border-[3px] border-orange-200 border-t-orange-600 dark:border-orange-950 dark:border-t-orange-400" />
        <p className="mt-4 font-extrabold">Боловсруулж байна</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Түр хүлээнэ үү ...</p>
      </div>
    </div>
  );
}
