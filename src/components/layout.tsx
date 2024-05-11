import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PropsWithChildren, useState, useEffect } from "react";
import { useAuthContext } from "~/context/AuthContext";
import { api } from "~/utils/api";
import { Analytics } from "@vercel/analytics/react";

export const Layout = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>{props.children}</main>
      <Analytics />
    </>
  );
};

const Navbar = () => {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const router = useRouter();
  const { auth } = useAuthContext();

  //* Determine if a link is active
  const isActive = (href: string) => {
    if (href === "/" && router.pathname === "/") {
      return true;
    }

    return router.pathname === href;
  };

  return (
    <nav
      className="flex h-[90px] w-full items-center justify-start gap-8 bg-gray-900 bg-opacity-10 bg-clip-padding p-4 shadow-lg backdrop-blur-lg
    "
    >
      <Image
        src="/favicon.ico"
        alt="logo"
        width={50}
        height={50}
        priority
        onDoubleClick={() => {
          setShowPasswordInput(!showPasswordInput);
        }}
      />
      <div className="flex items-baseline justify-evenly gap-10">
        <NavLink href="/" isActive={isActive("/")}>
          Home
        </NavLink>
        <NavLink href="/albums" isActive={isActive("/albums")}>
          Albums
        </NavLink>
        <NavLink href="/artists" isActive={isActive("/artists")}>
          Artists
        </NavLink>
        {auth && (
          <>
            <NavLink href="/albums/new" isActive={isActive("/albums/new")}>
              New
            </NavLink>
            <NavLink href="/saved" isActive={isActive("/saved")}>
              Saved
            </NavLink>
            <NavLink href="/settings" isActive={isActive("/settings")}>
              Settings
            </NavLink>
          </>
        )}
      </div>
      {showPasswordInput && (
        <div className="ml-auto">
          <PasswordInput />
        </div>
      )}
    </nav>
  );
};

const NavLink = (props: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) => {
  const { href, children, isActive } = props;

  const fancyUnderlineStyle =
    "relative block w-fit text-center transition after:absolute after:block after:h-[3px] after:w-full after:origin-center after:scale-x-0 after:bg-white after:transition after:duration-300 after:content-[''] hover:text-white after:hover:scale-x-100 text-lg sm:text-2xl";

  const styles = isActive
    ? "text-white " + fancyUnderlineStyle
    : "text-gray-500 " + fancyUnderlineStyle;

  return (
    <Link href={href} className={styles}>
      {children}
    </Link>
  );
};

const PasswordInput = () => {
  const [passwordInput, setPasswordInput] = useState<string>("");

  const {
    data: isAuthed,
    isLoading: checkingIsAuthed,
    isSuccess: checkingAuthSuccess,
    refetch: checkAuth,
  } = api.spotify.checkAuth.useQuery(passwordInput, {
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { updateAuth } = useAuthContext();

  useEffect(() => {
    if (isAuthed === true) {
      //console.log("isAuthed", isAuthed);
      updateAuth(true);
    } else {
      updateAuth(false);
    }

    if (checkingAuthSuccess) {
      //console.log("checkingAuthSuccess", checkingAuthSuccess);
    }
    if (checkingIsAuthed) {
      //console.log("checkingIsAuthed", checkingIsAuthed);
    }
  }, [isAuthed, checkingAuthSuccess, checkingIsAuthed, updateAuth]);

  const submitPassword = () => {
    void checkAuth();
  };

  // const logOut = () => {
  //   updateAuth(false);
  // };

  return (
    <>
      <div className="z-10 flex w-full flex-row gap-2">
        <input
          type="password"
          className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-sm  placeholder:text-[#d2d2d3a8] xl:w-80"
          placeholder="Enter password..."
          onChange={(e) => {
            setPasswordInput(e.target.value);
          }}
        />
        <button
          className=" w-24 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600 xl:w-24 xl:text-base"
          onClick={submitPassword}
        >
          Submit
        </button>
      </div>
    </>
  );
};
