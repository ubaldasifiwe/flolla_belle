import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ADMIN_EMAIL = "admin@florabelle.rw";
const ADMIN_PASSWORD = "florabelle2025";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem("florabelle_admin") === "true";
  });

  const login = (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("florabelle_admin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("florabelle_admin");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
