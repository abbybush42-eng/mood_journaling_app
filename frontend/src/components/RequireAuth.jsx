// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import { Navigate } from "react-router-dom";

// export default function RequireAuth({ children }) {
//   const { token } = useContext(AuthContext);
//   return token ? children : <Navigate to="/login" />;
// }

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { token } = useContext(AuthContext);

  // fallback for page refresh
  const storedToken = localStorage.getItem("token");

  if (!token && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}