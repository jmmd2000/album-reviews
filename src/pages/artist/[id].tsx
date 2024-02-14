/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { type AlbumReview, type SpotifyImage } from "~/types";
import { api } from "~/utils/api";
import { AlbumGrid } from "../albums/new";
import Head from "next/head";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";

export default function ArtistDetail() {
  // const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [albums, setAlbums] = useState<AlbumReview[]>([]);
  const [images, setImages] = useState<SpotifyImage[]>([]);

  const router = useRouter();
  const artistID = router.query.id as string;

  const {
    data: artist,
    // isLoading,
    isSuccess,
  } = api.spotify.getArtistById.useQuery(artistID);

  useEffect(() => {
    //console.log("artist", artist);
    if (isSuccess && artist) {
      setImages(JSON.parse(artist.image_urls) as SpotifyImage[]);
      setAlbums(artist.albums);
    }

    // if (artistTracksSuccess && artist_tracks) {
    //   setTracks(artist_tracks);
    //   console.log("artist_tracks", artist_tracks);
    // }
  }, [isSuccess, artist]);

  return (
    <>
      <Head>
        <title>{artist?.name}</title>
      </Head>
      <div className="mx-auto mt-12 flex w-full flex-col items-center sm:w-[70%]">
        {artist === undefined ? (
          <Loader />
        ) : (
          <div className="flex w-full flex-col items-center justify-start gap-4 sm:max-h-[250px] sm:w-[80%] sm:flex-row sm:gap-12">
            <img
              src={images[1]?.url}
              alt={artist?.name}
              className="aspect-square w-44 sm:w-[250px]"
            />
            <div className="flex flex-col gap-2 sm:mt-8 sm:gap-4">
              <h1 className="inline-block w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold text-white sm:w-full sm:text-3xl">
                {artist?.name}
              </h1>

              <div className="relative mt-4">
                <p className="text-base text-gray-500">
                  {artist?.albums.length}{" "}
                  {artist?.albums.length === 1 ? "review" : "reviews"}
                </p>
                <p className="text-base text-gray-500">
                  Rank #{artist?.leaderboard_position}
                </p>
              </div>
            </div>
            {artist?.average_score && (
              <div className="mt-4 sm:mt-0">
                <RatingChip
                  ratingNumber={Math.round(artist?.average_score)}
                  form="label"
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 w-full">
        <AlbumReviewChart reviews={albums} />
      </div>
      <div className="mx-auto mt-12 w-full">
        <AlbumGrid reviewedAlbums={albums} />
      </div>
    </>
  );
}

interface AlbumReviewChartProps {
  reviews: AlbumReview[];
}

const AlbumReviewChart = (props: AlbumReviewChartProps) => {
  const { reviews } = props;

  const sortedReviews = reviews.sort((a, b) => a.release_year - b.release_year);

  const data = sortedReviews.map((review, index) => ({
    id: index,
    url: parseImageURL(review.image_urls), // Used for the X-axis
    review_score: review.review_score, // Used for the Y-axis
  }));

  function parseImageURL(urls: string) {
    const url = JSON.parse(urls) as SpotifyImage[];
    console.log("url", url[2]!.url);
    return url[2]!.url;
  }

  return (
    <div className="m-auto flex w-3/4 justify-center rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition">
      <ResponsiveContainer width="100%" height={300} className="-ml-[40px]">
        <LineChart
          width={1000}
          height={300}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="1 10" />
          <XAxis dataKey="url" height={70} interval={0} tick={CustomTick} />
          <YAxis domain={[0, 100]} />
          <Line type="monotone" dataKey="review_score" stroke="#fff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CustomTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
    coordinate: number;
    index?: number;
    offset?: number;
  };
  visibleTicksCount?: number;
  width?: number;
  height?: number;
}

const CustomTick = (props: CustomTickProps) => {
  const { x, y, payload } = props;
  console.log("payload", payload.value);
  return (
    <foreignObject x={x - 32} y={y} width="64" height="64">
      <img
        src={payload.value}
        alt="album art"
        className="h-12 w-12 object-cover md:h-16 md:w-16"
      />
    </foreignObject>
  );
};
