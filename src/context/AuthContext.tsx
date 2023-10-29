import { type ReactNode, useContext, useState, createContext } from "react";

// Define the type for your context values
interface AuthContextType {
  auth: boolean;
  updateAuth: (newValue: boolean) => void;
}

// Create a context object without type arguments
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook for accessing the context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

// Create the AuthProvider component to wrap your app with
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(false);

  const updateAuth = (newValue: boolean) => {
    setAuth(newValue);
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
