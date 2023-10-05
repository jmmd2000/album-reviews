import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";

export const Layout = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>{props.children}</main>
    </>
  );
};

const Navbar = () => {
  const router = useRouter();

  // Define a function to determine if a link is active
  const isActive = (href: string) => {
    if (href === "/" && router.pathname === "/") {
      return true;
    }

    return router.pathname === href;
  };

  return (
    <nav
      className="flex h-[90px] w-screen items-center justify-start gap-8 bg-gray-700 bg-opacity-10 bg-clip-padding p-4 shadow-lg backdrop-blur-sm
    "
    >
      <Image src="/favicon.ico" alt="logo" width={50} height={50} priority />
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
      </div>
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
    "relative block w-fit text-center transition after:absolute after:block after:h-[3px] after:w-full after:origin-center after:scale-x-0 after:bg-white after:transition after:duration-300 after:content-[''] hover:text-white after:hover:scale-x-100 text-2xl";

  const styles = isActive
    ? "text-white " + fancyUnderlineStyle
    : "text-gray-500 " + fancyUnderlineStyle;

  return (
    <Link href={href} className={styles}>
      {children}
    </Link>
  );
};
