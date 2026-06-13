// // src/routes/ProtectedRoute.tsx
// import { Navigate } from "react-router-dom";
// import { useAppSelector } from "../hooks";

// interface Props {
//   children: JSX.Element;
//   role?: "admin" | "customer";
// }

// const ProtectedRoute = ({ children, role }: Props) => {
//   const user = useAppSelector((state) => state.auth.user);

//   if (!user) return <Navigate to="/login" />;

//   if (role && user.role !== role) {
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks";

const ADMIN_ROLES = ["super_admin", "admin", "partner"];

const ProtectedRoute = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" />;

  if (ADMIN_ROLES.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
