import Head from "next/head";
import { Loader } from "~/components/Loader";
import { RatingCard } from "~/components/RatingChip";
import { type RatingValue, type SpotifyImage } from "~/types";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Head>
        <title>JamesReviewsMusic</title>
      </Head>
      <div className="mb-10 flex w-full flex-col items-center justify-evenly lg:flex-row">
        <IntroductoryText />
        <TopFourGrid />
        {/* <StatsIntro /> */}
      </div>
    </>
  );
}

const IntroductoryText = () => {
  const ratings: RatingValue[] = [
    "Perfect",
    "Amazing",
    "Brilliant",
    "Great",
    "Good",
    "Meh",
    "OK",
    "Bad",
    "Awful",
    "Terrible",
    "Non-song",
  ];
  return (
    <div className="flex flex-col p-8 md:p-16 lg:max-w-[50%]">
      <h1 className="mb-5 text-2xl font-semibold text-white sm:text-3xl">
        Hey there!
      </h1>
      <p className="mb-8 text-lg font-light text-gray-50 sm:text-xl">
        Welcome to my album reviews. This is a personal project I built to keep
        track of new albums and what I think of them. Each review is based on my
        own enjoyment of the album, rather than technical standards.
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
        You can see a few of my top artists here also. I also have a{" "}
        <a
          href="https://open.spotify.com/playlist/7f87l51cuxevxtd34mjSUs?si=8655c0cd75ff4711"
          target="blank"
          className="text-fuchsia-400 hover:underline"
        >
          Spotify playlist
        </a>{" "}
        of all the songs I&apos;ve rated as <i>Perfect.</i>
      </p>
      <p className="mb-5 text-xl font-light text-gray-50">
        Thanks for visiting!
      </p>
      <p className="mb-5 text-xl font-light text-gray-50">James.</p>
    </div>
  );
};

const TopFourGrid = () => {
  const {
    data: topArtists,
    isLoading: isLoadingTopArtists,
    isError: isErrorTopArtists,
    isSuccess: isSuccessTopArtists,
  } = api.artist.getTopArtists.useQuery(4);

  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (isSuccessTopArtists) {
      console.log(topArtists);
      const urls = topArtists.map((artist) => {
        const images = JSON.parse(artist.image_urls) as SpotifyImage[];
        return images[0]!.url;
      });
      setUrls(urls);
    }
    if (isErrorTopArtists) {
      //console.log("Error fetching top four artists.");
    }
  }, [topArtists, isErrorTopArtists, isSuccessTopArtists]);
  return (
    <>
      <div className="relative m-12 mx-auto grid max-h-[448px] max-w-max  grid-cols-2 items-center justify-center xl:max-h-[640px]">
        <div className="absolute h-full w-full bg-gradient-to-b from-zinc-900 via-transparent lg:bg-gradient-to-r"></div>
        {isLoadingTopArtists ? (
          <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
            <Loader />
          </div>
        ) : isSuccessTopArtists ? (
          urls.map((url, index) => (
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

// const StatsIntro = () => {
//   // const {
//   //   data: topArtists,
//   //   isLoading: isLoadingTopArtists,
//   //   isSuccess: isSuccessTopArtists,
//   // } = api.artist.getTopArtists.useQuery(3);

//   const {
//     data: topAlbums,
//     isLoading: isLoadingTopAlbums,
//     isSuccess: isSuccessTopAlbums,
//   } = api.album.getAlbumsByField.useQuery({
//     count: 3,
//     field: "review_score",
//     sort: "desc",
//   });

//   const {
//     data: recentAlbums,
//     isLoading: isLoadingRecentAlbums,
//     isSuccess: isSuccessRecentAlbums,
//   } = api.album.getAlbumsByField.useQuery({
//     count: 3,
//     field: "createdAt",
//     sort: "desc",
//   });

//   return (
//     <div className="flex flex-col gap-5">
//       {/* <ImageRow
//         data={topArtists as unknown as ReviewedArtist[]}
//         title="Top Artists"
//         isLoading={isLoadingTopArtists}
//         isSuccess={isSuccessTopArtists}
//       /> */}
//       {topAlbums && (
//         <ImageRow
//           data={topAlbums}
//           title="Top Albums"
//           isLoading={isLoadingTopAlbums}
//           isSuccess={isSuccessTopAlbums}
//         />
//       )}
//       {recentAlbums && (
//         <ImageRow
//           data={recentAlbums}
//           title="Recent Reviews"
//           isLoading={isLoadingRecentAlbums}
//           isSuccess={isSuccessRecentAlbums}
//         />
//       )}
//     </div>
//   );
// };

// interface ImageRowProps {
//   // data?: ReviewedArtist[] | AlbumReview[];
//   data?: DisplayAlbum[];
//   title: string;
//   isLoading?: boolean;
//   isSuccess?: boolean;
// }

// const ImageRow = (props: ImageRowProps) => {
//   const { data, title, isLoading, isSuccess } = props;
//   console.log(data, isLoading, isSuccess);
//   return (
//     <div className="flex flex-col">
//       <h1 className="mb-2 text-xl font-semibold text-white sm:text-2xl">
//         {title}
//       </h1>
//       <div className="flex gap-2">
//         {isLoading ? (
//           <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
//             <Loader />
//           </div>
//         ) : isSuccess && data ? (
//           data.map(
//             (item, index) => (
//               <AlbumCard
//                 spotify_id={item.spotify_id}
//                 name={item.name}
//                 release_year={item.release_year}
//                 image_url={item.image_url}
//                 artist={{
//                   name: item.artist_name,
//                   spotify_id: item.artist_spotify_id,
//                 }}
//                 isVisible={true}
//                 bookmarked={false}
//                 score={item.review_score}
//                 key={index}
//                 size="small"
//               />
//               // <img
//               //   src={item.imageUrl}
//               //   alt={"Image of " + item.name}
//               //   title={item.name}
//               //   className="aspect-square max-h-28 xl:aspect-square xl:max-h-36"
//               //   key={index}
//               // />
//               // if the data is an album, display the album card, otherwise display the artist card

//               // if (typeof item === "string") {
//               //   <AlbumCard
//               //     spotify_id={item.spotify_id}
//               //     name={item.name}
//               //     release_year={item.release_year}
//               //     image_url={item.image_url}
//               //     artist={{
//               //       name: item.artist_name,
//               //       spotify_id: item.artist_spotify_id,
//               //     }}
//               //     isVisible={false}
//               //     bookmarked={false}
//               //     score={item.review_score}
//               //     key={index}
//               //   />
//               // } else {
//               //   <ArtistCard
//               //     spotify_id={item.spotify_id}
//               //     name={item.name}
//               //     image_urls={item.image_urls}
//               //     leaderboard_position={item.leaderboard_position}
//               //     average_score={item.average_score}
//               //     key={index}
//               //     num_albums={item.albums.length}
//               //   />
//               // }

//               // "review_score" in item ? (
//             ),
//             // ) : (
//             // <ArtistCard
//             //   spotify_id={item.spotify_id}
//             //   name={item.name}
//             //   image_urls={item.image_urls}
//             //   leaderboard_position={item.leaderboard_position}
//             //   average_score={item.average_score}
//             //   key={index}
//             //   num_albums={item.albums.length}
//             // />
//             // ),
//           )
//         ) : null}
//       </div>
//     </div>
//   );
// };
