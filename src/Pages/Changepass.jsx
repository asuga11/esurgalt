import { useContext } from "react";
import { useParams } from "react-router-dom";
import MainContext from "../Context/MainContext";
import AccountAction from "../components/General/AccountAction";

export default function Changepass() {
  const { changePass } = useContext(MainContext);
  const { resetToken } = useParams();
  return <AccountAction title="Нууц үг солих" label="Шинэ нууц үг" type="password" autoComplete="new-password" submitLabel="Нууц үг солих" onSubmit={(password) => changePass(password, resetToken)} />;
}
