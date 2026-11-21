import { useContext } from "react";
import MainContext from "../Context/MainContext";
import AccountAction from "../components/General/AccountAction";

export default function Verif() {
  const { emailVerif } = useContext(MainContext);
  return <AccountAction title="Баталгаажуулалт" label="Баталгаажуулах код" type="text" autoComplete="one-time-code" inputMode="numeric" submitLabel="Баталгаажуулах" onSubmit={emailVerif} />;
}
