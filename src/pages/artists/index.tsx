import { api } from "~/utils/api";
import { type ReviewedArtist, type SpotifyImage } from "~/types";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { RatingChip } from "~/components/RatingChip";
import ResponsiveImage from "~/components/ResponsiveImage";
import Head from "next/head";
import { VisibilityObserver } from "~/components/VisibilityObserver";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ReviewedArtist[]>([]);
  const {
    data: reviewedArtists,
    isSuccess,
    isError,
  } = api.artist.getAllArtists.useQuery();

  useEffect(() => {
    if (isSuccess) {
      // console.log(reviewedArtists, "reviewedArtists success");
      setArtists(reviewedArtists as unknown as ReviewedArtist[]);
    }

    if (isError) {
      toast.error("Error fetching artists.", {
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    }
  }, [isSuccess, isError, reviewedArtists]);

  // const {
  //   data,
  //   isLoading: loading,
  //   isSuccess: success,
  // } = api.spotify.getAllArtists.useQuery();

  if (isSuccess) {
    console.log(reviewedArtists);
    // console.log(reviewedArtists[0]?.albums);
  }

  return (
    <>
      <Head>
        <title>Artists</title>
      </Head>
      <div className="m-2 xl:m-10">
        <ArtistGrid artists={artists} />
        <ToastContainer
          toastStyle={{
            //* same as bg-gray-700 bg-opacity-10
            background: "rgba(55, 65, 81, 0.1)",
            color: "#D2D2D3",
            borderRadius: "0.375rem",
            backdropFilter: "blur(10px)",
          }}
          progressStyle={{
            borderRadius: "0.375rem",
          }}
          position="top-right"
        />
      </div>
    </>
  );
}

export const ArtistGrid = (props: { artists: ReviewedArtist[] }) => {
  const { artists } = props;
  const [reviewedArtists, setReviewedArtists] = useState<ReviewedArtist[]>([]);
  const [sortKey, setSortKey] = useState("all");

  useEffect(() => {
    // Apply the sorting whenever the component mounts or artists data changes
    if (sortKey === "all") {
      setReviewedArtists(artists);
    } else {
      sortArtists(sortKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artists, sortKey]);

  const filterArtists = (filterText: string) => {
    const filteredArtists: ReviewedArtist[] = reviewedArtists.filter(
      (album) => {
        const { name } = album;
        return name.toLowerCase().includes(filterText.toLowerCase());
      },
    );

    return filteredArtists;
  };

  const sortArtists = (sort: string) => {
    let sortedArtists: ReviewedArtist[] = [...reviewedArtists];

    switch (sort) {
      case "all":
        sortedArtists = reviewedArtists!;
        setSortKey("all");
        break;
      case "artist-az":
        sortedArtists = sortedArtists.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setSortKey("artist-az");
        break;
      case "artist-za":
        sortedArtists = sortedArtists.sort((a, b) =>
          b.name.localeCompare(a.name),
        );
        setSortKey("artist-za");
        break;
      case "score-asc":
        sortedArtists = sortedArtists.sort(
          (a, b) => a.average_score - b.average_score,
        );
        setSortKey("score-asc");
        break;
      case "score-desc":
        sortedArtists = sortedArtists.sort(
          (a, b) => b.average_score - a.average_score,
        );
        setSortKey("score-desc");
        break;
      case "num-reviews-asc":
        sortedArtists = sortedArtists.sort(
          (a, b) => a.albums.length - b.albums.length,
        );
        setSortKey("num-reviews-asc");
        break;
      case "num-reviews-desc":
        sortedArtists = sortedArtists.sort(
          (a, b) => b.albums.length - a.albums.length,
        );
        setSortKey("num-reviews-desc");
        break;
      default:
        sortedArtists = reviewedArtists!;
    }

    setReviewedArtists(sortedArtists);
  };

  //! Really janky way to pass in the values
  //- TODO: Improve this
  return (
    <>
      {reviewedArtists && (
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
          <div className="flex flex-row items-center gap-2">
            <input
              type="text"
              className="w-[70%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-sm placeholder:text-[#d2d2d3a8] md:w-80"
              placeholder="Filter by artist name..."
              onChange={(e) => {
                const filterText = e.target.value;
                if (filterText.length === 0) {
                  setReviewedArtists(artists);
                } else {
                  const filteredArtists = filterArtists(filterText);
                  setReviewedArtists(filteredArtists);
                }
              }}
            />
            <select
              className="h-[50px] w-[30%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition md:w-36 "
              onChange={(e) => sortArtists(e.target.value)}
            >
              <option
                value="all"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                All
              </option>
              <option
                value="artist-az"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Artist A-Z
              </option>
              <option
                value="artist-za"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Artist Z-A
              </option>
              <option
                value="score-asc"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Score asc.
              </option>
              <option
                value="score-desc"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Score desc.
              </option>
              <option
                value="num-reviews-asc"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                # of reviews asc.
              </option>
              <option
                value="num-reviews-desc"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                # of reviews desc.
              </option>
            </select>
          </div>
          <p className="text-[#d2d2d3a8] md:ml-auto">
            {reviewedArtists.length} artists
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-6 2xl:grid-cols-7">
        {reviewedArtists.map((artist) => (
          <VisibilityObserver key={`${sortKey}-${artist.spotify_id}`}>
            {(isVisible) => (
              <ArtistCard
                spotify_id={artist.spotify_id}
                name={artist.name}
                image_urls={artist.image_urls}
                leaderboard_position={artist.leaderboard_position}
                average_score={artist.average_score}
                key={artist.spotify_id}
                num_albums={artist.albums.length}
                isVisible={isVisible}
              />
            )}
          </VisibilityObserver>
        ))}
      </div>
    </>
  );
};

export const ArtistCard = (props: {
  spotify_id: string;
  name: string;
  image_urls: string;
  leaderboard_position: number;
  num_albums: number;
  average_score: number;
  isVisible: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const urls = JSON.parse(props.image_urls) as SpotifyImage[];
  const image_url = urls[1]!.url;

  if (!props.isVisible) {
    return null;
  }

  return (
    <Link href={`/artist/${props.spotify_id}`}>
      <div
        className="relative mt-5 flex max-h-max flex-col items-start overflow-hidden whitespace-nowrap text-start sm:w-44 xl:w-full"
        ref={cardRef}
      >
        <ResponsiveImage
          src={image_url}
          alt={`Photo of ${props.name}`}
          className="aspect-square max-h-[154px] rounded-full transition-all hover:cursor-pointer hover:drop-shadow-2xl sm:h-44 sm:max-h-44 xl:h-52 xl:max-h-56"
        />
        <div className="mb-1 mt-2 flex w-full flex-col items-start sm:w-44 ">
          <p className="mb-1 text-sm font-medium text-white xl:text-base ">
            {props.name}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <p className="text-xs font-medium text-[#717171]">
              {props.num_albums === 1
                ? "1 review"
                : props.num_albums + " reviews"}
            </p>
            <p className="text-xs font-medium text-[#717171]">-</p>
            <p className="text-xs font-medium text-[#717171]">
              Rank #{props.leaderboard_position}
            </p>
          </div>
          {props.average_score ? (
            <div className="absolute bottom-0 right-0">
              <RatingChip
                ratingNumber={Math.round(props.average_score)}
                form="small"
              />
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
};
