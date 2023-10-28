/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { RatingCard } from "~/components/RatingChip";
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
              <RatingCard rating={rating} key={index} form="medium" />
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

        {/*//* Image grid */}
        <div className="relative m-12 grid max-h-max max-w-max grid-cols-2 items-center justify-center">
          <div className="absolute h-full w-full bg-gradient-to-r from-zinc-900 via-transparent"></div>
          <div className="max-h-max max-w-max">
            <Image
              src="https://i.scdn.co/image/ab6761610000f1786be070445b03e0b63147c2c1"
              alt=""
              className="h-80 w-80"
              height={320}
              width={320}
            />
          </div>
          <div className="max-h-max max-w-max">
            <Image
              src="https://i.scdn.co/image/ab6761610000f178d8b9980db67272cb4d2c3daf"
              alt=""
              className="h-80 w-80"
              height={320}
              width={320}
            />
          </div>
          <div className="max-h-max max-w-max">
            <Image
              src="https://i.scdn.co/image/ab6761610000f178ea7538654040e553a7b0fc28"
              alt=""
              className="h-80 w-80"
              height={320}
              width={320}
            />
          </div>
          <div className="max-h-max max-w-max">
            <Image
              src="https://i.scdn.co/image/ab6761610000f178207b21f3ed0ee96adce3166a"
              alt=""
              className="h-80 w-80"
              height={320}
              width={320}
            />
          </div>
        </div>
      </div>
    </>
  );
}
