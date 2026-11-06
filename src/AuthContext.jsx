import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the login after a page refresh. A 401 just means "not logged in".
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const account = await api("/auth/login", { method: "POST", body: { email, password } });
    setUser(account);
    return account;
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Where each role lands after login.
export function homePath(role) {
  if (role === "admin") return "/admin/orders";
  if (role === "courier") return "/assigned";
  return "/orders/new";
}
