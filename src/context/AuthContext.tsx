import {
  type ReactNode,
  useContext,
  useState,
  createContext,
  useEffect,
} from "react";

interface AuthContextType {
  auth: boolean;
  updateAuth: (newValue: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<boolean>(false);

  useEffect(() => {
    // Check for window to ensure code is running in the browser
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth) as boolean;
        if (typeof parsedAuth === "boolean") {
          setAuth(parsedAuth);
        } else {
          console.error("Invalid auth value in local storage");
        }
      }
    }
  }, []);

  const updateAuth = (newValue: boolean) => {
    // check for window here to prevent server-side access to localStorage
    if (typeof window !== "undefined") {
      setAuth(newValue);
      localStorage.setItem("auth", JSON.stringify(newValue));
    }
  };

  const contextValues: AuthContextType = {
    auth,
    updateAuth,
  };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
}
