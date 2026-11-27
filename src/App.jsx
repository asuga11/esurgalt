import React, { Component, lazy, Suspense, useContext, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import MainContext from "./Context/MainContext";
import ProtectedRoutes from "./ProtectedRoutes";
import Loader from "./components/General/Loader";
import ThemeToggle from "./components/General/ThemeToggle";
import CollectionState from "./components/General/CollectionState";

const MainLayout = lazy(() => import("./components/MainLayout"));
const TestList = lazy(() => import("./components/Tests/TestList"));
const ExamList = lazy(() => import("./components/Exam/ExamList"));
const SurguuliList = lazy(() => import("./components/Surguuli/SurguuliList"));
const AdminDash = lazy(() => import("./components/Analiz"));
const Home = lazy(() => import("./Pages/Home"));
const SuragchDash = lazy(() => import("./Pages/Suragch/SuragchDash"));
const SuragchList = lazy(() => import("./components/Suragch/SuragchList"));
const BagshDash = lazy(() => import("./Pages/Bagsh/BagshDash"));
const ExamOne = lazy(() => import("./components/Exam/ExamOne"));
const HomeLayout = lazy(() => import("./components/HomeLayout"));
const ShalgaltList = lazy(() => import("./components/Suragch/ShalgaltList"));
const ExamWork = lazy(() => import("./components/Suragch/Exam/ExamWork"));
const EduDash = lazy(() => import("./Pages/Education/EduDash"));
const SurguuliDash = lazy(() => import("./Pages/Surguuli/SurguuliDash"));
const BagshList = lazy(() => import("./components/Bagsh/BagshList"));
const StudDash = lazy(() => import("./Pages/Student/StudDash"));
const TeachDash = lazy(() => import("./Pages/Teacher/TeachDash"));
const SurgaltOne = lazy(() => import("./components/Surgalt/SurgaltOne"));
const SurgaltList = lazy(() => import("./components/Surgalt/SurgaltList"));
const BagshSurgalt = lazy(() => import("./Pages/Bagsh/BagshSurgalt"));
const SorilList = lazy(() => import("./components/Soril/SorilList"));
const TLogin = lazy(() => import("./Pages/TLogin"));
const SurgaltSuragch = lazy(() => import("./components/Surgalt/SurgaltSuragch"));
const CourseLearning = lazy(() => import("./components/Surgalt/CourseLearning"));
const Verif = lazy(() => import("./Pages/Verif"));
const ForgotPass = lazy(() => import("./Pages/ForgotPass"));
const Changepass = lazy(() => import("./Pages/Changepass"));
const SignUp = lazy(() => import("./Pages/SignUp"));

class RouteErrorBoundary extends Component {
  state = { failed: false, pathname: this.props.pathname };

  static getDerivedStateFromProps({ pathname }, previous) {
    return pathname === previous.pathname ? null : { pathname, failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return <Suspense fallback={<Loader />}>{this.props.children}</Suspense>;
    return (
      <main id="main-content" tabIndex={-1} className="app-container max-w-xl py-16">
        <CollectionState state="error" title="Хуудас ачаалагдсангүй"
          actionLabel="Хуудсыг дахин ачаалах" action={() => window.location.reload()} />
      </main>
    );
  }
}

const App = () => {
  const { pathname, hash } = useLocation();
  const { user } = useContext(MainContext);

  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <div className="app-shell relative min-h-screen bg-slate-50 font-nunito text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div aria-hidden="true" className="app-atmosphere" />
      <a href="#main-content" className="app-button-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60]">Үндсэн хэсэг рүү алгасах</a>
      <RouteErrorBoundary pathname={pathname}>
        <Routes>
          <Route element={<HomeLayout key="auth" fullscreen />}>
            <Route path="login" element={<SignUp />} />
          </Route>
          <Route element={<HomeLayout key="public" />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="soril/:stype" element={<SorilList key={pathname} />} />
            <Route path="tlogin/:tid" element={<TLogin />} />
            <Route path="training" element={<SurgaltList />} />
            <Route path="training/:id" element={<SurgaltOne key={pathname} />} />
            <Route path="verification/suragch" element={<Verif />} />
            <Route path="resetpass" element={<ForgotPass />} />

            <Route
              path="changepassword/suragch/:resetToken"
              element={<Changepass />}
            />
            <Route path="e/:eid" element={<ExamOne key={pathname} />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<ProtectedRoutes user={user} />}>
            <Route path="control" element={<MainLayout />}>
              <Route path="*" element={<NotFound dashboard />} />
              {["suragch", "Student"].includes(user?.role) && <Route path="learn/:courseId" element={<CourseLearning />} />}
              {user?.role === "admin" && (
                <>
                  <Route index element={<AdminDash />} />
                  <Route path="training" element={<BagshSurgalt />} />
                  <Route path="soril" element={<ExamList />} />
                  <Route path="test" element={<TestList />} />
                  <Route path="schools" element={<SurguuliList />} />
                  <Route path="bagsh" element={<BagshList />} />
                  <Route path="suragch" element={<SuragchList />} />
                </>
              )}
              {user?.role === "education" && (
                <>
                  <Route index element={<EduDash />} />
                  <Route path="soril" element={<ExamList />} />
                  <Route path="test" element={<TestList />} />
                  <Route path="schools" element={<SurguuliList />} />
                  <Route path="bagsh" element={<BagshList />} />
                  <Route path="suragch" element={<SuragchList />} />
                </>
              )}
              {user?.role === "surguuli" && (
                <>
                  <Route index element={<SurguuliDash />} />
                  <Route path="soril" element={<ExamList />} />
                  <Route path="test" element={<TestList />} />
                  <Route path="bagsh" element={<BagshList />} />
                  <Route path="suragch" element={<SuragchList />} />
                  <Route path="suragch/:sid" element={<ShalgaltList />} />
                  <Route path="soril/:eid/:sid" element={<ExamWork />} />
                  <Route path="soril/:eid" element={<ExamWork />} />
                </>
              )}
              {user?.role === "suragch" && (
                <>
                  <Route index element={<SuragchDash />} />
                  <Route path="soril" element={<ShalgaltList />} />
                  <Route path="training" element={<SurgaltSuragch />} />
                  <Route path="soril/:eid" element={<ExamWork />} />
                </>
              )}
              {user?.role === "Student" && (
                <>
                  <Route index element={<StudDash />} />
                  <Route path="soril" element={<ShalgaltList />} />
                  <Route path="soril/:eid" element={<ExamWork />} />
                  <Route path="training" element={<SurgaltSuragch />} />

                  <Route path="soril/:eid/:sid" element={<ExamWork />} />
                </>
              )}
              {user?.role === "bagsh" && (
                <>
                  <Route index element={<BagshDash />} />
                  <Route path="soril" element={<ExamList />} />
                  <Route path="soril/:eid" element={<ExamWork />} />
                  <Route path="training" element={<BagshSurgalt />} />
                  <Route path="test" element={<TestList />} />
                </>
              )}
              {user?.role === "teacher" && (
                <>
                  <Route index element={<TeachDash />} />
                  <Route path="soril" element={<ExamList />} />
                  <Route path="soril/:eid" element={<ExamWork />} />
                  <Route path="training" element={<BagshSurgalt />} />
                  <Route path="test" element={<TestList />} />
                </>
              )}
            </Route>
          </Route>
        </Routes>
      </RouteErrorBoundary>
      <ThemeToggle />
    </div>
  );
};

function NotFound({ dashboard = false }) {
  return (
    <section className="app-container py-16">
      <div className="app-panel mx-auto max-w-lg p-8 text-center">
        <p className="text-sm font-bold text-orange-700 dark:text-orange-300">404</p>
        <h1 className="mt-2 text-2xl font-extrabold">Хуудас олдсонгүй</h1>
        <Link to={dashboard ? "/control" : "/"} className="app-button-primary mt-5">
          {dashboard ? "Хянах самбар" : "Нүүр хуудас"}
        </Link>
      </div>
    </section>
  );
}

export default App;
