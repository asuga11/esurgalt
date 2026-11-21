import { DocumentCheckIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainContext from "../../Context/MainContext";

import moment from "moment";
const ShalgaltList = () => {
  const navigate = useNavigate();
  const { sid } = useParams();
  const { getShalgaltMember, user } = useContext(MainContext);
  const isSchool = user?.role === "surguuli";
  const memberId = isSchool ? sid : user?.id;
  const [list, setList] = useState({ memberId: null, status: "loading", exams: [] });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!memberId) return;
    const controller = new AbortController();
    setList({ memberId, status: "loading", exams: [] });
    getShalgaltMember(memberId, controller.signal)
      .then((exams) => {
        if (!controller.signal.aborted) setList({ memberId, status: "ready", exams });
      })
      .catch(() => {
        if (!controller.signal.aborted) setList({ memberId, status: "error", exams: [] });
      });
    return () => controller.abort();
  }, [getShalgaltMember, memberId, reload]);

  const status = list.memberId === memberId ? list.status : "loading";
  const exams = list.memberId === memberId ? list.exams.filter((item) => item.shalgalt?._id) : [];
  return (
    <div>
      <div>
        <h1 className="font-bold mb-2">Оролцсон сорилууд</h1>
      </div>
      {status === "loading" && <p role="status">Сорилуудыг ачаалж байна…</p>}
      {status === "error" && (
        <div role="alert">
          <p>Оролцсон сорилуудыг ачаалж чадсангүй.</p>
          <button type="button" className="app-button-secondary mt-3" onClick={() => setReload(reload + 1)}>
            Дахин ачаалах
          </button>
        </div>
      )}
      {status === "ready" && exams.length === 0 && <p>Оролцсон сорил байхгүй байна.</p>}
      {exams.length > 0 && <div role="region" aria-label="Оролцсон сорилууд" tabIndex={0} className="app-table-scroll">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-900 uppercase bg-gray-300 dark:bg-gray-900 dark:text-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3">
                №
              </th>
              <th scope="col" className="px-6 py-3"></th>
              <th scope="col" className="px-6 py-3">
                Сорилын нэр
              </th>
              <th scope="col" className="px-6 py-3">
                Эхлэх цаг
              </th>
              <th scope="col" className="px-6 py-3">
                Үргэлжлэх хугацаа
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Төлөв
              </th>
            </tr>
          </thead>
          <tbody>
            {exams.map((item, i) => {
              return (
                <tr key={item.shalgalt._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-2">{i + 1}</td>
                  <td className="px-6 pt-1 items-center flex gap-2">
                    {(!isSchool || item.info?.examStatus === "Дууссан") && (
                      <button
                        type="button"
                        className="text-slate-600 dark:text-white"
                        aria-label={item.info?.examStatus === "Дууссан" ? "Сорилын үр дүн" : "Сорил нээх"}
                        onClick={() => navigate(
                          `/control/soril/${item.shalgalt._id}${isSchool ? `/${memberId}` : ""}`
                        )}
                      >
                        {item.info?.examStatus === "Дууссан"
                          ? <DocumentCheckIcon className="size-6" />
                          : <PlayIcon className="size-6" />}
                      </button>
                    )}
                  </td>
                  <th
                    scope="row"
                    className="px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {item.shalgalt.name}
                  </th>

                  <td className="px-6 ">
                    {/* <Timer
                      exDate={item.shalgalt.shalgaltHugatsaa}
                      css={"tracking-widest font-bold "}
                    /> */}
                    {item.shalgalt.isStartTime
                      ? moment(item.shalgalt.examDate).format(
                          "yyyy-MM-DD HH:mm"
                        )
                      : "Хэзээ ч болно"}
                  </td>
                  <td className="px-6">{item.shalgalt?.examTime} мин</td>
                  <td className="px-6">
                    {item.info?.examStatus === "Хуваарилсан" && (
                      <p className=" bg-sky-600 rounded-full text-center text-white px-2">
                        {item.info?.examStatus}
                      </p>
                    )}
                    {item.info?.examStatus === "Дууссан" && (
                      <p className=" bg-rose-600 rounded-full text-center text-white px-2">
                        {item.info?.examStatus}
                      </p>
                    )}
                    {item.info?.examStatus === "Ажиллаж байна" && (
                      <p className=" bg-green-600 rounded-full text-center text-white px-2">
                        {item.info?.examStatus}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>}
    </div>
  );
};

export default ShalgaltList;
