/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { Loader } from "~/components/Loader";
import { RatingCard } from "~/components/RatingChip";
import { type RatingValue } from "~/types";
import { api } from "~/utils/api";

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
      <Head>
        <title>JamesReviewsMusic</title>
      </Head>
      <div className="flex w-full flex-col items-center justify-evenly lg:flex-row">
        {/* Home Content */}
        <div className="flex flex-col p-8 md:p-16 lg:max-w-[50%]">
          <h1 className="mb-5 text-2xl font-semibold text-white sm:text-3xl">
            Hey there!
          </h1>
          <p className="mb-8 text-lg font-light text-gray-50 sm:text-xl">
            Welcome to my album reviews. This is a personal project I built to
            keep track of new albums and what I think of them. Each review is
            based on my own enjoyment of the album, rather than technical
            standards.
          </p>
          <p className="mb-5 text-xl font-light text-gray-50">
            Each song in an album is given a rating as follows:
          </p>

          <div className="mb-8 grid max-w-max grid-cols-3 gap-2 md:grid-cols-5 lg:gap-4 xl:grid-cols-6">
            {ratings.map((rating, index) => (
              <RatingCard rating={rating} key={index} form="medium" />
            ))}
          </div>

          <p className="mb-10 text-xl font-light text-gray-50">
            You can see a few of my top artists here also.
          </p>
          <p className="mb-5 text-xl font-light text-gray-50">
            Thanks for visiting!
          </p>
          <p className="mb-5 text-xl font-light text-gray-50">James.</p>
        </div>
        <TopFourGrid />
      </div>
    </>
  );
}

const TopFourGrid = () => {
  const { data, isLoading, isSuccess, isError } =
    api.spotify.getTopFourArtists.useQuery();
  useEffect(() => {
    if (isSuccess) {
      //console.log(data);
    }
    if (isError) {
      //console.log("Error fetching top four artists.");
    }
  }, [data, isError, isSuccess]);
  return (
    <>
      <div className="relative m-12 mx-auto grid max-h-[448px] max-w-max  grid-cols-2 items-center justify-center xl:max-h-[640px]">
        <div className="absolute h-full w-full bg-gradient-to-b from-zinc-900 via-transparent lg:bg-gradient-to-r"></div>
        {isLoading ? (
          <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
            <Loader />
          </div>
        ) : isSuccess ? (
          data.map((url, index) => (
            <div
              className="flex flex-col items-center justify-center"
              key={index}
            >
              <Image
                src={url}
                alt=""
                className="h-56 w-56 xl:h-80 xl:w-80"
                height={320}
                width={320}
              />
            </div>
          ))
        ) : null}
        {/* <div className="max-h-max max-w-max">
          <Image
            src="https://i.scdn.co/image/ab6761610000f1786be070445b03e0b63147c2c1"
            alt=""
            className="h-80 w-80"
            height={320}
            width={320}
          />
        </div> */}
      </div>
    </>
  );
};
