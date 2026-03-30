import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "../store/slices/authSlice";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(logout());
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/customers/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          dispatch(setCredentials({ user: data.customer, token }));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
}
