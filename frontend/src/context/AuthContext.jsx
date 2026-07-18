import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sahayak_user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(userData, token) {
    localStorage.setItem("sahayak_token", token);
    localStorage.setItem("sahayak_user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("sahayak_token");
    localStorage.removeItem("sahayak_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
