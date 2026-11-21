import { useContext } from "react";
import MainContext from "../Context/MainContext";

const metrics = [
  ["surguuli", "Сургууль"],
  ["bagsh", "Багш"],
  ["suragch", "Сурагч"],
  ["testsan", "Тест"],
  ["shalgalt", "Шалгалт"],
  ["surgalt", "Сургалт"],
];
const number = new Intl.NumberFormat("mn-MN");

export default function Analiz() {
  const { analiz } = useContext(MainContext);

  return (
    <section>
      <h1 className="mb-5 text-2xl font-extrabold sm:text-3xl">Нийт үзүүлэлт</h1>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
        {metrics.map(([key, label]) => (
          <div key={key} className="app-panel p-4 sm:p-6">
            <dt className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</dt>
            <dd className="mt-2 break-words text-2xl font-extrabold tabular-nums sm:text-3xl">
              {analiz?.[key] == null ? "—" : number.format(analiz[key])}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
