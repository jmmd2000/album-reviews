/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { RatingChip, getRatingString } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import type {
  ReviewedTrack,
  AlbumReview,
  SpotifyImage,
  DisplayAlbum,
  Reason,
} from "~/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TrackCard } from "../album/[id]";

export default function ArtistDetail() {
  // const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [albums, setAlbums] = useState<DisplayAlbum[]>([]);
  const [albumReviews, setAlbumReviews] = useState<AlbumReview[]>([]);
  const [images, setImages] = useState<SpotifyImage[]>([]);
  const [reasons, setReasons] = useState<Reason[]>([]);

  const router = useRouter();
  const artistID = router.query.id as string;

  const {
    data: artist,
    // isLoading,
    isSuccess,
  } = api.artist.getArtistById.useQuery(artistID);

  const { data: artistAlbums } = api.artist.getArtistAlbums.useQuery(artistID);

  useEffect(() => {
    if (artistAlbums) {
      setAlbumReviews(artistAlbums);
    }
  }, [artistAlbums]);

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

  useEffect(() => {
    if (artist?.bonus_reason) {
      const bonusReasons = JSON.parse(artist.bonus_reason) as Reason[];
      setReasons(bonusReasons);
    }
  }, [artist]);

  if (artist === undefined) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>{artist?.name}</title>
      </Head>
      <div className="mx-auto mt-12 flex w-full flex-col items-center md:w-[70%]">
        {artist === undefined ? (
          <Loader />
        ) : (
          <div className="flex w-full flex-col items-center justify-start gap-4 md:max-h-[250px] md:w-[80%] md:flex-row md:gap-12">
            <img
              src={images[1]?.url}
              alt={artist?.name}
              className="aspect-square w-44 md:w-[250px]"
            />
            <div className="flex flex-col gap-2 md:mt-8 md:gap-4">
              <h1 className="inline-block w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold text-white md:w-full md:text-3xl">
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
            {artist?.total_score && (
              <div className="mt-4 md:mt-0">
                <RatingChip
                  ratingNumber={Math.round(artist?.total_score)}
                  form="label"
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-12 space-y-14">
        <div className="mx-auto w-full">
          <RatingBreakdown
            reasons={reasons}
            average_score={artist.average_score}
            total_score={artist.total_score}
          />
        </div>
        <div className="mx-auto w-full">
          <SongRanking albums={albumReviews} />
        </div>
        <div className="mx-auto w-full">
          <AlbumReviewChart reviews={albumReviews} />
        </div>
        <div className="mx-auto w-full">
          <AlbumGrid albums={albums} />
        </div>
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
    return url[2]!.url;
  }

  return (
    <div className="m-auto flex w-full justify-center rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition md:w-3/4">
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

interface SongRankingProps {
  albums: AlbumReview[];
}

const SongRanking = ({ albums }: SongRankingProps) => {
  const songsByRatingThenAlbum = useMemo(() => {
    const songs = albums.flatMap((album) =>
      (JSON.parse(album.scored_tracks) as ReviewedTrack[]).map((song) => ({
        ...song,
        albumName: album.name,
        albumArt: album.image_urls,
      })),
    );

    return songs.reduce(
      (acc, song) => {
        const { rating, album_id } = song;
        if (!acc[rating]) acc[rating] = {};
        if (!acc[rating][album_id]) {
          acc[rating][album_id] = {
            albumName: song.albumName,
            albumArt: song.albumArt,
            songs: [],
          };
        }
        acc[rating][album_id].songs.push(song);
        return acc;
      },
      {} as Record<
        number,
        Record<
          string,
          { albumName: string; albumArt: string; songs: ReviewedTrack[] }
        >
      >,
    );
  }, [albums]);

  function parseImageURL(urls: string) {
    const url = JSON.parse(urls) as SpotifyImage[];
    return url[1]!.url;
  }

  return (
    <Tabs
      defaultValue="10"
      className="m-auto flex w-full flex-col justify-center md:w-3/4"
    >
      <TabsList>
        {[...Array(11).keys()].reverse().map((rating) => (
          <TabsTrigger key={rating} value={rating.toString()}>
            {getRatingString(rating)}
          </TabsTrigger>
        ))}
      </TabsList>

      {[...Array(11).keys()].reverse().map((rating) => {
        const albumsAtRating = songsByRatingThenAlbum[rating] ?? {};
        return (
          <TabsContent value={rating.toString()} key={rating}>
            {Object.keys(albumsAtRating).length > 0 ? (
              Object.entries(albumsAtRating).map(
                ([albumId, { albumName, albumArt, songs }]) => (
                  <div key={albumId} className="mt-8 flex flex-col gap-1">
                    <div className="mb-2 flex items-center gap-2">
                      <img
                        src={parseImageURL(albumArt)}
                        alt={`Album art for ${albumName}`}
                        className="ml-2 aspect-square h-24 object-cover md:ml-0"
                      />
                      <h3 className="text-lg font-semibold text-[#D2D2D3]">
                        {albumName}
                      </h3>
                    </div>
                    {songs.map((song, index) => (
                      <TrackCard
                        key={index}
                        artists={song.track_artist}
                        duration={song.track_duration}
                        name={song.track_name}
                        trackID={song.track_id}
                        rating={song.rating}
                      />
                    ))}
                  </div>
                ),
              )
            ) : (
              <p className="m-10 text-center text-[#D2D2D3]">
                No songs with this rating.
              </p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

interface RatingBreakdownProps {
  average_score: number;
  total_score: number;
  reasons: Reason[];
}

const RatingBreakdown = (props: RatingBreakdownProps) => {
  const { reasons, average_score, total_score } = props;
  //* Group reasons by counting occurrences
  const groupedReasons = reasons.reduce<
    Record<string, { reason: string; value: number; count: number }>
  >((acc, { reason, value }) => {
    const key = `${reason}-${value}`; // Unique key to group

    if (!acc[key]) {
      acc[key] = { reason, value, count: 1 };
    } else {
      acc[key].count++;
    }

    return acc;
  }, {});

  return (
    <div className="m-auto w-full rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition md:w-1/2">
      {/* Header Row */}
      <div className="mb-2 grid grid-cols-[2fr_1fr_1fr_1fr]">
        <span>Average album score</span>
        <span></span>
        <span></span>
        <span className="text-right">
          {Number.isInteger(average_score)
            ? average_score
            : average_score.toFixed(1)}
        </span>
      </div>

      {/* Grid Container for Rows */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-y-2">
        {Object.values(groupedReasons).map(({ reason, value, count }) => (
          <>
            <span
              key={`${reason}-text`}
              className={value * count > 0 ? "text-green-400" : "text-red-400"}
            >
              {reason}
            </span>
            <span
              key={`${value}-value`}
              className={`text-right ${value * count > 0 ? "text-green-400" : "text-red-400"}`}
            >
              {value > 0 ? `+${value}` : value}
            </span>
            <span
              key={`${count}-count`}
              className={`text-right ${value * count > 0 ? "text-green-400" : "text-red-400"}`}
            >
              {count > 1 ? `x${count}` : ""}
            </span>
            <span
              key={`${value * count}-total`}
              className={`text-right ${value * count > 0 ? "text-green-400" : "text-red-400"}`}
            >
              {value * count > 0 ? `+${value * count}` : value * count}
            </span>
          </>
        ))}
      </div>

      {/* Total Row */}
      <div className="mt-2 grid grid-cols-[2fr_1fr_1fr_1fr] border-t-2 border-[#272727] pt-1 font-bold">
        <span>Total (rounded up)</span>
        <span></span>
        <span></span>
        <span className="text-right">
          {Number.isInteger(total_score) ? total_score : total_score.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
