import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ user }) => {
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

export default ProtectedRoutes;
