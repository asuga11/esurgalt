import logo from "../../assets/esurgalt-logo.png";

export default function Brand() {
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <img
        src={logo}
        alt="e-Surgalt"
        width={1511}
        height={362}
        className="h-auto w-36 px-1 py-0.5 max-[360px]:w-28 sm:w-44"
      />
      <span className="hidden text-xs font-semibold opacity-75 sm:block">
        МУИС · Баруун бүсийн сургууль
      </span>
    </span>
  );
}
