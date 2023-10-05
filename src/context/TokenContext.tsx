import { ReactNode, useContext, useState, createContext } from "react";

// Define the type for your context values
interface TokenContextType {
  token: string;
  updateToken: (newValue: string) => void;
}

// Create a context object without type arguments
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// Create a custom hook for accessing the context
export function useTokenContext() {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokenContext must be used within an TokenProvider");
  }
  return context;
}

// Create the TokenProvider component to wrap your app with
export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>("initialValue");
  console.log(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nunc eget ultricies aliquam, nunc nunc aliquet nunc, nec aliqua",
  );

  const updateToken = (newValue: string) => {
    setToken(newValue);
  };

  const contextValues: TokenContextType = {
    token,
    updateToken,
  };

  return (
    <TokenContext.Provider value={contextValues}>
      {children}
    </TokenContext.Provider>
  );
}
