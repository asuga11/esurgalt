import { useContext } from "react";
import MainContext from "../Context/MainContext";
import AccountAction from "../components/General/AccountAction";

export default function ForgotPass() {
  const { forgotPass } = useContext(MainContext);
  return <AccountAction title="Нууц үг сэргээх" label="Имэйл хаяг" type="email" autoComplete="email" submitLabel="Илгээх" onSubmit={forgotPass} />;
}
