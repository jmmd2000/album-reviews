import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PropsWithChildren, useState, useEffect } from "react";
import { useAuthContext } from "~/context/AuthContext";
import { api } from "~/utils/api";
import { Analytics } from "@vercel/analytics/react";
import React from "react";
import { trimString } from "~/pages/albums/new";
import { Progress } from "./ui/progress";

export const Layout = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>{props.children}</main>
      <CurrentlyPlaying />
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
        {/* <NavLink href="/concerts" isActive={isActive("/concerts")}>
          Concerts
        </NavLink> */}
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

const CurrentlyPlaying = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data } = api.album.getCurrentlyPlaying.useQuery();
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`fixed bottom-3 right-3 flex ${isCollapsed ? "w-16" : "w-72"} flex-col items-start gap-2 whitespace-nowrap rounded-md border border-[#272727] bg-gray-800 bg-opacity-30 bg-clip-padding p-2 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-gray-700 `}
      onClick={toggleCollapse}
    >
      {!isCollapsed && (
        <p className="text-sm text-[#d2d2d3]">
          I&apos;m currently listening to:
        </p>
      )}
      <div className="flex w-full flex-row gap-2">
        {data?.image && (
          <Image
            src={data?.image}
            alt="Currently playing album cover"
            width={64}
            height={64}
          />
        )}
        {!isCollapsed && (
          <div className="flex w-full flex-col overflow-hidden">
            {data?.name && (
              <p className="text-[#D2D2D3]">{trimString(data?.name, 30)}</p>
            )}
            <p className="text-xs">{data?.artist}</p>
            <div className="flex w-full flex-row items-center gap-2">
              {data?.durationElapsed && data?.durationMS && (
                <>
                  <Progress
                    value={(data?.durationElapsed / data?.durationMS) * 100}
                    className="h-1 w-full rounded-sm bg-gray-700"
                  />
                  <p className="text-xs">{data?.durationString}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// const CurrentlyPlaying = () => {
//   const { data } = api.album.getCurrentlyPlaying.useQuery();
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   useEffect(() => {
//     if (data) {
//       console.log(data?.name, data?.artist, data?.image);
//     }
//     if (data?.durationElapsed && data?.durationMS) {
//       console.log(data?.durationElapsed, data?.durationMS);
//       console.log((data?.durationElapsed / data?.durationMS) * 100);
//     }
//   }, [data]);

//   const toggleCollapse = () => setIsCollapsed(!isCollapsed);

//   return (
//     <div className={`fixed bottom-3 right-3 flex ${isCollapsed ? 'w-16' : 'w-auto min-w-72 max-w-full'} flex-col items-start gap-2 whitespace-nowrap rounded-md border border-[#272727] bg-gray-800 bg-opacity-30 bg-clip-padding p-2 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out`}
//          onClick={toggleCollapse}>
//       {data?.image && (
//         <Image
//           src={data?.image}
//           alt="Currently playing album cover"
//           width={64}
//           height={64}
//           className="block"
//         />
//       )}
//       {!isCollapsed && (
//         <div className="flex w-full flex-col overflow-hidden">
//           {data?.name && (
//             <p className="text-[#D2D2D3]">{trimString(data?.name, 30)}</p>
//           )}
//           <p className="text-xs">{data?.artist}</p>
//           <div className="flex w-full flex-row items-center gap-2">
//             {data?.durationElapsed && data?.durationMS && (
//               <>
//                 <Progress
//                   value={(data?.durationElapsed / data?.durationMS) * 100}
//                   className="h-1 w-full rounded-sm bg-gray-700"
//                 />
//                 <p className="text-xs">{data?.durationString}</p>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
