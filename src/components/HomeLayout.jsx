import { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Pages/Footer";
import Nav from "../Pages/Nav";

export default function HomeLayout({ fullscreen = false }) {
  const [isSigningIn, setIsSigningIn] = useState(true);
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav authTitle={fullscreen ? (isSigningIn ? "Нэвтрэх" : "Бүртгүүлэх") : undefined} />
      <main id="main-content" tabIndex={-1} className={fullscreen ? "flex min-w-0 flex-1 flex-col" : "min-w-0 flex-1"}>
        <Outlet context={{ isSigningIn, setIsSigningIn }} />
      </main>
      {!fullscreen && <Footer />}
    </div>
  );
}
