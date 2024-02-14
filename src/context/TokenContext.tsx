import {
  type ReactNode,
  useContext,
  useState,
  createContext,
  useEffect,
} from "react";
import { api } from "~/utils/api";

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
  const [token, setToken] = useState<string>("");

  // Fetches the access token to be used with queries.
  // Disabled by default, runs once on mount.
  const { refetch: retryFetch } = api.spotify.fetchAccessToken.useQuery("", {
    retry: false,
    enabled: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // useEffect(() => {
  //   console.log(
  //     "Provider has mounted, or token has been updated, token is: ",
  //     token,
  //   );
  // }, [token]);

  useEffect(() => {
    // Function to retrieve the token and its expiration time from local storage
    function getTokenAndExpirationFromLocalStorage() {
      const storedToken = localStorage.getItem("accessToken");
      console.log("Stored token is: ", storedToken);
      const storedExpiration = localStorage.getItem("tokenExpiration");
      // if (storedToken && storedExpiration) {
      //   console.log("Stored token is: ", storedToken);
      //   console.log("Stored expiration is: ", storedExpiration);
      // }
      return {
        token: storedToken ?? null,
        expiration: storedExpiration ?? null,
      };
    }

    // Fetches a new token and updates it in local storage and context
    async function fetchAndSetToken() {
      try {
        const { data, isSuccess } = await retryFetch();

        if (isSuccess) {
          if (data?.access_token) {
            const newToken = data.access_token;
            const expirationTime =
              new Date().getTime() + data.expires_in * 1000; // Convert to milliseconds

            // Save the new token and its expiration time in local storage
            localStorage.setItem("accessToken", newToken);
            localStorage.setItem("tokenExpiration", expirationTime.toString());

            // Update the context with the new token
            updateToken(newToken);
          }
        } else {
          throw new Error("Error fetching access token");
        }
      } catch (error) {
        console.error("Error fetching and setting token:", error);
        // Handle the error
      }
    }

    const { token, expiration } = getTokenAndExpirationFromLocalStorage();

    if (token && expiration) {
      const currentTime = new Date().getTime();

      // Check if the token is expired
      if (currentTime >= Number(expiration)) {
        // Token is expired, fetch a new one
        fetchAndSetToken()
          .then(() => {
            // console.log("done");
          })
          .catch(() => {
            //console.log(error.message);
          });
      } else {
        // Token is still valid, use it
        updateToken(token);
      }
    } else {
      // Token not found in local storage, fetch a new one
      fetchAndSetToken()
        .then(() => {
          // //console.log("done");
        })
        .catch(() => {
          //console.log(error.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
