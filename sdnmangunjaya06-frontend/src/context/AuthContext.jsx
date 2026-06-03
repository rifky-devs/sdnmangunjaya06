import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("sdn_token"));
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("sdn_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async ({ username, password }) => {
    const credentials = {
      username: username?.trim(),
      password: password?.trim(),
    };
    const { data } = await api.post("/auth/login", credentials);
    console.log("Login response:", data);
    sessionStorage.setItem("sdn_token", data.token);
    sessionStorage.setItem("sessionStorage_user", JSON.stringify(data.user)); // Keep standard name key for simplicity or match item keys
    sessionStorage.setItem("sdn_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    sessionStorage.removeItem("sdn_token");
    sessionStorage.removeItem("sdn_user");
    setToken(null);
    setUser(null);
  };

  // 5 Minutes Inactivity Auto-Logout
  useEffect(() => {
    if (!token) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Inactivity detected, logging out...");
        logout();
      }, 5 * 60 * 1000); // 5 minutes inactivity
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token]);

  const updateUserSession = (updatedUser) => {
    const mergedUser = { ...user, ...updatedUser };
    sessionStorage.setItem("sdn_user", JSON.stringify(mergedUser));
    setUser(mergedUser);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      updateUserSession,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
}
