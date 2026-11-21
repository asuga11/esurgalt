import { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainContext from "../Context/MainContext";
import Loader from "../components/General/Loader";
import axios from "../AxiosDB";

export default function TLogin() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const { activateSession } = useContext(MainContext);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function signIn() {
      try {
        const user = jwtDecode(tid);
        if (!user.role || (user.exp && user.exp * 1000 <= Date.now())) {
          setError(true);
          return;
        }

        const { data } = await axios.get("settings/loginTime", {
          headers: { Authorization: `Bearer ${tid}` },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (!data?.success || !(Number(data.logoutTime) > 0) || !activateSession(tid, data)) {
          setError(true);
          return;
        }

        navigate("/control", { replace: true });
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    setError(false);
    signIn();
    return () => controller.abort();
  }, [tid, navigate, activateSession]);

  if (!error) return <Loader />;
  return (
    <section className="app-container py-12">
      <div className="app-panel mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-extrabold">Нэвтрэх холбоос ажиллахгүй байна</h1>
        <Link to="/login" replace className="app-button-primary mt-5">Нэвтрэх хэсэг</Link>
      </div>
    </section>
  );
}
