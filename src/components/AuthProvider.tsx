import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "../store/slices/authSlice";
import { clearCart, setCartItems } from "../store/slices/cartSlice";
import { fetchCart } from "../services/cartApi";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const storedUser = localStorage.getItem("user");

      // If both token and isLoggedIn flag exist, immediately restore auth state
      if (token && isLoggedIn === "true" && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch(setCredentials({ user, token }));

          try {
            const cartResponse = await fetchCart(token);
            dispatch(setCartItems(cartResponse.cart.items));
          } catch (cartError) {
            console.error("Failed to hydrate cart from server:", cartError);
            dispatch(clearCart());
          }
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          dispatch(logout());
          dispatch(clearCart());
        }
      } else {
        dispatch(logout());
        dispatch(clearCart());
      }

      // Validate token with backend in background
      if (token) {
        try {
          const response = await fetch("https://api.hangrysweet.com/api/customers/me", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            // Update with fresh data from backend
            dispatch(setCredentials({ user: data.customer, token }));
            localStorage.setItem("user", JSON.stringify(data.customer));

            try {
              const cartResponse = await fetchCart(token);
              dispatch(setCartItems(cartResponse.cart.items));
            } catch (cartError) {
              console.error("Failed to sync cart from server:", cartError);
              dispatch(clearCart());
            }
          } else {
            // Token is invalid, clear auth
            localStorage.removeItem("token");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("user");
            dispatch(logout());
            dispatch(clearCart());
          }
        } catch (error) {
          console.error("Auth validation failed:", error);
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  return <>{children}</>;
}
