/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { RatingValue } from "~/types";

export default function Home() {
  const ratings: RatingValue[] = [
    "Perfect",
    "Amazing",
    "Brilliant",
    "Great",
    "Good",
    "Decent",
    "OK",
    "Bad",
    "Awful",
    "Terrible",
    "Non-song",
  ];
  return (
    <>
      <Navbar />
      <div className="flex w-full justify-evenly">
        {/* Home Content */}
        <div className="flex max-w-[50%] flex-col p-16">
          <h1 className="mb-5 text-3xl font-semibold text-white">Hey there!</h1>
          <p className="mb-8 text-xl font-light text-gray-50">
            Welcome to my album reviews. This is a personal project I built to
            keep track of new albums and what I think of them. Each review is
            based on my own enjoyment of the album, rather than technical
            standards.
          </p>
          <p className="mb-5 text-xl font-light text-gray-50">
            Each song in an album is given a rating as follows:
          </p>
          <div className="mb-8 grid max-w-max grid-cols-6 gap-4">
            {ratings.map((rating, index) => (
              <RatingCard rating={rating} key={index} />
            ))}
          </div>

          <p className="mb-10 text-xl font-light text-gray-50">
            You can view album and artist ratings via the links up top.
          </p>
          <p className="mb-5 text-xl font-light text-gray-50">
            Thanks for visiting!
          </p>
          <p className="mb-5 text-xl font-light text-gray-50">James.</p>
        </div>

        {/* Image grid */}
        <div className="relative m-12 grid max-h-max max-w-max grid-cols-2 items-center justify-center">
          <div className="absolute h-full w-full bg-gradient-to-r from-zinc-900"></div>
          <div className="max-h-max max-w-max">
            <img
              src="https://i.scdn.co/image/ab6761610000f1786be070445b03e0b63147c2c1"
              alt=""
              className="h-80 w-80"
            />
          </div>
          <div className="max-h-max max-w-max">
            <img
              src="https://i.scdn.co/image/ab6761610000f178d8b9980db67272cb4d2c3daf"
              alt=""
              className="h-80 w-80"
            />
          </div>
          <div className="max-h-max max-w-max">
            <img
              src="https://i.scdn.co/image/ab6761610000f178ea7538654040e553a7b0fc28"
              alt=""
              className="h-80 w-80"
            />
          </div>
          <div className="max-h-max max-w-max">
            <img
              src="https://i.scdn.co/image/ab6761610000f178207b21f3ed0ee96adce3166a"
              alt=""
              className="h-80 w-80"
            />
          </div>
        </div>
      </div>
    </>
  );
}

const Navbar = () => {
  return (
    <nav
      className="flex h-[90px] w-screen items-center justify-start gap-8 bg-gray-700 bg-opacity-10 bg-clip-padding p-4 shadow-lg backdrop-blur-sm
    "
    >
      <Image src="/favicon.ico" alt="logo" width={50} height={50} priority />
      <div className="flex items-baseline justify-evenly gap-10">
        <NavLink href="/" active>
          Home
        </NavLink>
        <NavLink href="/" active={false}>
          Albums
        </NavLink>
        <NavLink href="/" active={false}>
          Artists
        </NavLink>
      </div>
    </nav>
  );
};

const NavLink = (props: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) => {
  const { href, children, active } = props;

  const fancyUnderlineStyle =
    "relative block w-fit text-center transition after:absolute after:block after:h-[3px] after:w-full after:origin-center after:scale-x-0 after:bg-white after:transition after:duration-300 after:content-[''] hover:text-white after:hover:scale-x-100 text-2xl";

  const styles = active
    ? "text-white " + fancyUnderlineStyle
    : "text-gray-400 " + fancyUnderlineStyle;

  return (
    <a href={href} className={styles}>
      {children}
    </a>
  );
};

interface RatingCardProps {
  rating: RatingValue;
}

const RatingCard = (props: { rating: RatingValue }) => {
  const ratingClassMap = {
    Perfect: "text-fuschia-600 bg-fuchsia-600 border-fuchsia-600",
    Amazing: "text-violet-600 bg-violet-600 border-violet-600",
    Brilliant: "text-blue-600 bg-blue-600 border-blue-600",
    Great: "text-cyan-600 bg-cyan-600 border-cyan-600",
    Good: "text-emerald-600 bg-emerald-600 border-emerald-600",
    Decent: "text-lime-600 bg-lime-600 border-lime-600",
    OK: "text-yellow-600 bg-yellow-600 border-yellow-600",
    Bad: "text-orange-600 bg-orange-600 border-orange-600",
    Awful: "text-red-600 bg-red-600 border-red-600",
    Terrible: "text-slate-600 bg-slate-600 border-slate-600",
    "Non-song": "text-slate-700 bg-slate-700 border-slate-700",
  };

  const textColorClassMap = {
    Perfect: "text-fuchsia-600",
    Amazing: "text-violet-600",
    Brilliant: "text-blue-600",
    Great: "text-cyan-600",
    Good: "text-emerald-600",
    Decent: "text-lime-600",
    OK: "text-yellow-600",
    Bad: "text-orange-600",
    Awful: "text-red-600",
    Terrible: "text-slate-600",
    "Non-song": "text-slate-700",
  };

  const colorClass = ratingClassMap[props.rating];
  const textColorClass = textColorClassMap[props.rating];
  return (
    <div
      className={
        "flex h-14 w-28 items-center justify-center rounded-md border-2 bg-opacity-40 " +
        colorClass
      }
    >
      <h2 className={"text-lg font-semibold " + textColorClass}>
        {props.rating}
      </h2>
    </div>
  );
};
