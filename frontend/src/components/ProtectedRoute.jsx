import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    if (user.role === "APPLICANT") {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/internal-login" />;
    }
  }

  return children;
}

export default ProtectedRoute;