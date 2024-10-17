import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");//Authentication
  }, [isAuthenticated, navigate]);

  return <div>{isAuthenticated ? children : null}</div>;
}

export default ProtectedRoute;
