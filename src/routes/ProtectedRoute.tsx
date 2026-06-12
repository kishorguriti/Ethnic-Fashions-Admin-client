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
// import type { JSX } from "react";

interface Props {
  // children: JSX.Element;
  role?: "admin" | "customer";
}

const ProtectedRoute = ({ role }: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return <Navigate to="/login" />;

  if (role && user.role === role) {
    return <Outlet />;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
