import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/General/Brand";
import { defaultExamTypes } from "./Nav";
import MainContext from "../Context/MainContext";

export default function Footer() {
  const year = new Date().getFullYear();
  const { sorilType } = useContext(MainContext);
  const firstExamType = sorilType?.content?.[0]?.examType || defaultExamTypes[0];

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-orange-950/40" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="inline-flex rounded-xl"><Brand /></Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Цахим сургалт, сорил, шалгалтын нэгдсэн платформ.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              Үндсэн цэс
            </h3>

            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/" className="transition hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                  Нүүр хуудас
                </Link>
              </li>
              <li>
                <Link to="/training" className="transition hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                  Сургалт
                </Link>
              </li>
              <li>
                {firstExamType && (
                  <Link
                    to={`/soril/${encodeURIComponent(firstExamType)}`}
                    className="transition hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  >
                    Сорил
                  </Link>
                )}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              Холбоо барих
            </h3>

            <div className="space-y-3 text-sm text-slate-300">
              <a href="tel:+97699994976" className="block hover:text-orange-400">
                📞 +976 9999-4976
              </a>

              <a
                href="mailto:tsakhimsurgalt.mn@gmail.com"
                className="block hover:text-orange-400"
              >
                ✉️ tsakhimsurgalt.mn@gmail.com
              </a>

              <a
                href="https://www.facebook.com/Tsakhim.Surgalt"
                target="_blank"
                rel="noreferrer"
                className="block hover:text-orange-400"
              >
                Facebook page
              </a>

              <a
                href="https://www.facebook.com/groups/tsakhim.surgalt"
                target="_blank"
                rel="noreferrer"
                className="block hover:text-orange-400"
              >
                Facebook group
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} E-SURGALT.west.edu.mn</p>
          <p>Бүх эрх хуулиар хамгаалагдсан.</p>
        </div>
      </div>
    </footer>
  );
}