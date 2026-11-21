import { useContext, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  ArrowRightStartOnRectangleIcon, Bars3Icon, BuildingLibraryIcon, ClipboardDocumentCheckIcon,
  HomeIcon, QuestionMarkCircleIcon, UserGroupIcon, UserIcon, VideoCameraIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import MainContext from "../Context/MainContext";
import ExpTimer from "./ExpTimer";
import Brand from "./General/Brand";

const sections = {
  "": { label: "Хянах самбар", icon: HomeIcon },
  training: { label: "Сургалт", icon: VideoCameraIcon },
  soril: { label: "Сорил", icon: ClipboardDocumentCheckIcon },
  test: { label: "Тестийн сан", icon: QuestionMarkCircleIcon },
  schools: { label: "Сургууль", icon: BuildingLibraryIcon },
  bagsh: { label: "Багш", icon: UserIcon },
  suragch: { label: "Сурагчид", icon: UserGroupIcon },
};

const staffSections = ["", "training", "soril", "test"];
const studentSections = ["", "soril", "training"];
const roleSections = {
  admin: [...staffSections, "schools", "bagsh", "suragch"],
  education: ["", "soril", "test", "schools", "bagsh", "suragch"],
  surguuli: ["", "soril", "test", "bagsh", "suragch"],
  bagsh: staffSections,
  teacher: staffSections,
  suragch: studentSections,
  Student: studentSections,
};

const roleLabels = {
  admin: "Админ",
  education: "Удирдлага",
  surguuli: "Сургууль",
  bagsh: "Багш",
  teacher: "Их сургуулийн багш",
  suragch: "Сурагч",
  Student: "Оюутан",
};

function Sidebar({ user, onNavigate, onLogout }) {
  return (
    <>
      <Link to="/" aria-label="e-Сургалт, нүүр хуудас" onClick={onNavigate} className="my-3 flex w-fit rounded-xl p-1">
        <Brand />
      </Link>
      <div className="my-4 flex min-w-0 items-center gap-3 border-y border-slate-200 py-4 dark:border-slate-800">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          <UserIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-extrabold [overflow-wrap:anywhere]">{user.name || "Хэрэглэгч"}</p>
          {roleLabels[user.role] && <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{roleLabels[user.role]}</p>}
        </div>
      </div>
      <nav aria-label="Удирдлагын цэс" className="flex-1">
        <ul className="space-y-1">
          {(roleSections[user.role] || [""]).map((path) => {
            const { label, icon: Icon } = sections[path];
            return (
              <li key={path}>
                <NavLink to={path ? `/control/${path}` : "/control"} end={!path} onClick={onNavigate} className="app-nav-link">
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <button type="button" onClick={onLogout} className="app-nav-link mt-4 w-full text-red-700 dark:text-red-300">
        <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-5" />
        Гарах
      </button>
    </>
  );
}

export default function MainLayout() {
  const { logout, user, expTime, setSigInOpen } = useContext(MainContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuPath, setMenuPath] = useState(null);
  const section = sections[pathname.split("/")[2] || ""] || sections[""];
  const closeMenu = () => setMenuPath(null);
  const signOut = () => {
    closeMenu();
    setSigInOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-shell min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
      <Dialog open={menuPath === pathname} onClose={closeMenu} className="relative z-50 lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-slate-950/55 backdrop-blur-xs" />
        <DialogPanel className="fixed inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col overflow-y-auto bg-white p-4 shadow-2xl dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="font-extrabold">Удирдлагын цэс</DialogTitle>
            <button type="button" onClick={closeMenu} aria-label="Цэс хаах" className="app-icon-button">
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <Sidebar user={user} onNavigate={closeMenu} onLogout={signOut} />
        </DialogPanel>
      </Dialog>
      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <Sidebar user={user} onNavigate={closeMenu} onLogout={signOut} />
      </aside>
      <div className="min-w-0">
        <header className="app-header">
          <div className="mx-auto flex min-h-16 max-w-[100rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" onClick={() => setMenuPath(pathname)} aria-label="Удирдлагын цэс нээх" aria-expanded={menuPath === pathname} className="app-icon-button -ml-2 lg:hidden">
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
              <p className="truncate text-base font-extrabold sm:text-lg">{section.label}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {expTime.success && expTime.logoutTime > 0 && (
                <div aria-label="Сесс дуусах хугацаа" className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold tabular-nums dark:bg-slate-800">
                  <ExpTimer key={expTime.logoutTime} exDate={expTime.logoutTime} logout={logout} />
                </div>
              )}

            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="mx-auto min-w-0 max-w-[100rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
