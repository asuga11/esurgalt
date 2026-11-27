import { useContext, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Bars3Icon, BookOpenIcon, HomeIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, NavLink, useLocation, useMatch } from "react-router-dom";
import MainContext from "../Context/MainContext";
import Brand from "../components/General/Brand";
import NavItem from "../components/General/NavItem";

export const defaultExamTypes = ["ЭЕШ-ын сорил", "Олимпиад"];

export default function Nav({ authTitle }) {
  const { pathname } = useLocation();
  const examCategory = useMatch("/soril/:stype")?.params.stype;
  const courseId = useMatch("/training/:id")?.params.id;
  const isPasswordChange = !!useMatch("/changepassword/suragch/:resetToken");
  const { user, sorilType, surgaltStateOne } = useContext(MainContext);
  const pageTitle = authTitle || examCategory || {
    "/training": "Сургалтууд",
    "/verification/suragch": "Баталгаажуулалт",
    "/resetpass": "Нууц үг сэргээх",
  }[pathname.replace(/\/$/, "")] ||
    (courseId ? (surgaltStateOne?._id === courseId && surgaltStateOne.name) || "Сургалт"
      : isPasswordChange ? "Нууц үг солих" : "");
  const [menuPath, setMenuPath] = useState(null);
  const closeMenu = () => setMenuPath(null);
  const route = user ? "/control" : "/login";
  const actionLabel = user ? "Хянах самбар" : "Нэвтрэх";
  const types = (sorilType?.content || []).map((item) => item?.examType);
  const examItems = [...new Set([defaultExamTypes[0], ...types, examCategory].filter(Boolean))].map((label) => ({
    label,
    to: `/soril/${encodeURIComponent(label)}`,
  }));
  const isExamPage = pathname.startsWith("/soril/") || pathname.startsWith("/e/");

  return (
    <header className="app-header">
      <div className="app-container flex min-h-16 items-center justify-between gap-1 max-[360px]:px-2 sm:gap-4 md:min-h-[4.5rem]">
        <Link to="/" aria-label="e-Сургалт, нүүр хуудас" className="shrink-0 rounded-xl">
          <Brand />
        </Link>
        <nav aria-label="Үндсэн цэс" className="hidden items-center gap-1 rounded-2xl border border-slate-200/75 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <NavLink to="/" end className="app-nav-link" data-current={pathname === "/home" || undefined}><HomeIcon aria-hidden="true" className="size-[17px]" />Нүүр хуудас</NavLink>
          <NavLink to="/training" className="app-nav-link"><BookOpenIcon aria-hidden="true" className="size-[17px]" />Сургалт</NavLink>
          <NavItem label="Сорил" items={examItems} active={isExamPage} />
        </nav>
        <div className="flex min-w-0 items-center gap-1 max-[360px]:gap-0 sm:gap-2">
          <Link to={route} aria-label={actionLabel} className={user ? "app-button-secondary max-sm:px-3" : "app-button-primary max-sm:px-3"}>
            {user ? <><UserIcon aria-hidden="true" className="size-5 shrink-0" /><span className="max-w-36 truncate max-sm:sr-only">{user.name || actionLabel}</span></> : actionLabel}
          </Link>

          <button type="button" onClick={() => setMenuPath(pathname)} aria-label="Үндсэн цэс нээх" aria-expanded={menuPath === pathname} className="app-icon-button md:hidden">
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
      </div>
      {pageTitle && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="app-container py-2">
            <h1 id="page-title" tabIndex={-1} className="break-words text-base font-extrabold sm:text-lg">{pageTitle}</h1>
          </div>
        </div>
      )}
      <Dialog open={menuPath === pathname} onClose={closeMenu} className="relative z-50 md:hidden">
        <DialogBackdrop className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs" />
        <DialogPanel className="fixed inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <DialogTitle className="font-extrabold">Үндсэн цэс</DialogTitle>
            <button type="button" onClick={closeMenu} aria-label="Цэс хаах" className="app-icon-button">
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <nav aria-label="Гар утасны үндсэн цэс" className="flex-1 space-y-1">
            <NavLink to="/" end onClick={closeMenu} className="app-nav-link" data-current={pathname === "/home" || undefined}>Нүүр хуудас</NavLink>
            <NavLink to="/training" onClick={closeMenu} className="app-nav-link">Сургалт</NavLink>
            <Disclosure defaultOpen={isExamPage}>
              <DisclosureButton type="button" className="app-nav-link group w-full justify-between" data-current={isExamPage || undefined}>
                Сорил
                <ChevronDownIcon aria-hidden="true" className="size-4 transition-transform group-data-open:rotate-180" />
              </DisclosureButton>
              <DisclosurePanel className="space-y-1 pl-3 pt-1">
                {examItems.map(({ label, to }) => (
                  <NavLink key={to} to={to} onClick={closeMenu} className="app-nav-link">{label}</NavLink>
                ))}
              </DisclosurePanel>
            </Disclosure>
          </nav>
          <Link to={route} onClick={closeMenu} className="app-button-primary mt-4">{actionLabel}</Link>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
