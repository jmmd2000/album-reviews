import { type AppType } from "next/app";
import { Inter } from "next/font/google";


import { api } from "~/utils/api";

const inter = Inter({ subsets: ["latin"] });

//* Main things left to add:
//- Something more interesting on the Artist detail page

import "~/styles/globals.css";
import { Layout } from "~/components/layout";
import { TokenProvider } from "~/context/TokenContext";
import { AuthProvider } from "~/context/AuthContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <TokenProvider>
        <div className={inter.className}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </TokenProvider>
    </AuthProvider>
  );
};

export default api.withTRPC(MyApp);
