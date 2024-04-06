/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { api } from "~/utils/api";
import { useEffect, useRef, useState } from "react";
import { type DisplayAlbum } from "src/types";
import { useTokenContext } from "~/context/TokenContext";
import { Loader } from "~/components/Loader";
import { RatingChip } from "~/components/RatingChip";
import ResponsiveImage from "~/components/ResponsiveImage";
import { toast } from "react-toastify";
import Head from "next/head";
import { VisibilityObserver } from "~/components/VisibilityObserver";
import { Bookmark, BookmarkX } from "lucide-react";

export default function NewAlbumPage() {
  const [searchResults, setSearchResults] = useState<DisplayAlbum[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useTokenContext();

  //* Queries Spotify with a search term. Disabled by default, runs on button click.
  const { refetch: refetchResults } = api.spotify.searchAlbums.useQuery(
    {
      query: inputValue,
      accessToken: token,
    },
    {
      enabled: false,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    console.log(searchResults);
  }, [searchResults]);

  //* Queries Spotify with a search term and saves the results in state.
  async function handleSearch() {
    toast.error("Error fetching search results.", {
      autoClose: 5000,
      progressStyle: {
        backgroundColor: "#DC2626",
      },
    });
    //* If there is a token saved in state, try to refetch the search results.
    if (token !== "") {
      const { data, isLoading, isSuccess, isError } = await refetchResults();

      //* Handle loading state
      if (isLoading) {
        setLoading(true);
      }

      //* If the search results are successfully fetched, and are not undefined, save them in state.
      if (isSuccess) {
        if (data !== undefined) {
          setLoading(false);
          setSearchResults(data);
        }
      }

      //* If there is an error, throw it.
      if (isError) {
        throw new Error("Error fetching search results");
      }
    } else {
      throw new Error("No access token.");
    }
  }

  //* Function to handle button click
  const handleClick = () => {
    handleSearch()
      .then(() => {
        //console.log("done");
      })
      .catch(() => {
        toast.error("Error fetching search results.", {
          autoClose: 5000,
          progressStyle: {
            backgroundColor: "#DC2626",
          },
        });
      });
  };

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>
      <div className="m-2 xl:m-10">
        <div className="flex flex-row gap-2">
          <input
            type="text"
            className="w-80 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-[#D2D2D3]"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleClick();
              }
            }}
            placeholder="Search for an album..."
          />
          <button
            className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
            onClick={handleClick}
          >
            Submit
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : searchResults.length !== 0 ? (
          <AlbumGrid albums={searchResults} />
        ) : (
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            Use the input to search for albums.
          </h2>
        )}
      </div>
    </>
  );
}

interface AlbumGridProps {
  albums: DisplayAlbum[];
  controls?: boolean;
}

export const AlbumGrid = (props: AlbumGridProps) => {
  const { controls, albums } = props;
  const [albumGroup, setAlbumGroup] = useState<DisplayAlbum[]>(albums);
  const [sortKey, setSortKey] = useState("all");

  const filterAlbums = (filterText: string) => {
    const filteredAlbums: DisplayAlbum[] = albumGroup.filter((album) => {
      const { name, artist_name, release_year } = album;
      return (
        name.toLowerCase().includes(filterText.toLowerCase()) ||
        artist_name.toLowerCase().includes(filterText.toLowerCase()) ||
        release_year.toString().includes(filterText)
      );
    });

    return filteredAlbums;
  };

  useEffect(() => {
    setAlbumGroup(albums);
  }, [albums]);

  const sortAlbums = (sort: string) => {
    //* This can only be called from the select, which only shows when albumGroup is AlbumReview[]. We can safely assume everything is AlbumReview[].
    //* Also update the sortKey to force a rerender of the off-screen cards.
    let sortedAlbums = [...albumGroup];

    switch (sort) {
      case "all":
        sortedAlbums = albums;
        setSortKey("all");
        break;
      case "album-az":
        sortedAlbums = sortedAlbums.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        setSortKey("album-az");
        break;
      case "album-za":
        sortedAlbums = sortedAlbums.sort((a, b) =>
          b.name.localeCompare(a.name),
        );
        setSortKey("album-za");
        break;
      case "score-asc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => a.review_score! - b.review_score!,
        );
        setSortKey("score-asc");
        break;
      case "score-desc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => b.review_score! - a.review_score!,
        );
        setSortKey("score-desc");
        break;
      case "year-asc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => a.release_year - b.release_year,
        );
        setSortKey("year-asc");
        break;
      case "year-desc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => b.release_year - a.release_year,
        );
        setSortKey("year-desc");
        break;
      default:
        sortedAlbums = albums;
    }

    setAlbumGroup(sortedAlbums);
  };

  //! Really janky way to pass in the values
  //- TODO: Improve this
  return (
    <>
      {albums && controls && (
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
          <div className="flex flex-row items-center gap-2">
            <input
              type="text"
              className="w-[70%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-sm  placeholder:text-[#d2d2d3a8] md:w-80"
              placeholder="Filter by album name, artist or year..."
              onChange={(e) => {
                const filterText = e.target.value;
                if (filterText.length === 0) {
                  setAlbumGroup(albums);
                } else {
                  const filteredAlbums = filterAlbums(filterText);
                  setAlbumGroup(filteredAlbums);
                }
              }}
            />
            <select
              className="w-[30%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition md:w-36 xl:text-base "
              onChange={(e) => sortAlbums(e.target.value)}
            >
              <option
                value="all"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                All
              </option>
              <option
                value="album-az"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Album A-Z
              </option>
              <option
                value="album-za"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Album Z-A
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
                value="year-asc"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Year asc.
              </option>
              <option
                value="year-desc"
                className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
              >
                Year desc.
              </option>
            </select>
          </div>
          <p className="text-[#d2d2d3a8] md:ml-auto">
            {albumGroup.length} reviews
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-6 2xl:grid-cols-7">
        {albumGroup.length !== 0
          ? albumGroup.map((album) => (
              <VisibilityObserver key={`${sortKey}-${album.spotify_id}`}>
                {(isVisible) => (
                  <AlbumCard
                    spotify_id={album.spotify_id}
                    key={`${sortKey}-${album.spotify_id}`}
                    name={album.name}
                    release_year={album.release_year}
                    image_url={album.image_url}
                    artist={{
                      name: album.artist_name,
                      spotify_id: album.artist_spotify_id,
                    }}
                    isVisible={isVisible}
                    bookmarked={album.bookmarked}
                    score={album.review_score}
                  />
                )}
              </VisibilityObserver>
            ))
          : null}
      </div>
    </>
  );
};

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
interface AlbumCardProps {
  spotify_id: string;
  name: string;
  release_year?: number;
  image_url: string | undefined;
  artist?: {
    name: string | undefined;
    spotify_id: string | undefined;
  };
  score?: number;
  isVisible?: boolean;
  bookmarked?: boolean;
}

export const AlbumCard = (props: AlbumCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [scrollAnimation, setScrollAnimation] = useState("");

  const { token } = useTokenContext();

  const {
    mutate: toggleBookmarked,
    // isLoading,
    // isSuccess,
    // isError,
  } = api.album.toggleAlbumBookmark.useMutation();

  const handleToggleBookmark = (spotify_id: string) => {
    toggleBookmarked({
      id: spotify_id,
      accessToken: token,
    });
  };

  let albumLink = "";
  if (props.score) {
    albumLink = `/album/${props.spotify_id}`;
  } else {
    albumLink = `/albums/new/${props.spotify_id}`;
  }

  const artistLink = `/artist/${props.artist?.spotify_id}`;

  //* Apply custom marquee scroll animation to albums with names longer than the card width
  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current && cardRef.current) {
        if (titleRef.current.offsetWidth > cardRef.current.offsetWidth) {
          setScrollAnimation("animate-marquee");
        }
      }
    };

    checkOverflow();
    // Check on window resize
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  if (!props.isVisible) {
    return null;
  }

  return (
    <div
      className="relative mt-5 flex max-h-max max-w-[154px] flex-col items-start overflow-hidden whitespace-nowrap text-start sm:w-44 lg:max-w-[205px] xl:w-full"
      ref={cardRef}
    >
      <Link href={albumLink}>
        <ResponsiveImage
          src={props.image_url!}
          alt={`Photo of ${props.name}`}
          className="aspect-square max-h-[154px] transition-all hover:cursor-pointer hover:drop-shadow-2xl sm:h-44 sm:max-h-44 xl:h-52 xl:max-h-56"
        />
      </Link>
      <div className="mb-1 mt-2 flex w-full flex-col items-start ">
        <Link href={albumLink}>
          <p
            className={
              "mb-1 text-sm font-medium text-white xl:text-base " +
              scrollAnimation
            }
            ref={titleRef}
          >
            {props.name}
          </p>
        </Link>
        <div className="mt-1 flex items-center gap-1">
          {props.artist?.name ? (
            <>
              <Link
                className="text-xs font-medium text-[#717171] transition hover:text-[#D2D2D3] hover:underline"
                href={artistLink}
              >
                {trimString(props.artist.name, 20)}
              </Link>
              <p className="text-xs font-medium text-[#717171]">-</p>
            </>
          ) : null}
          <p className="text-xs font-medium text-[#717171]">
            {props.release_year}
          </p>
        </div>
        {props.score ? (
          <RatingChip ratingNumber={Math.round(props.score)} form="small" />
        ) : (
          <div className="absolute bottom-0 right-0">
            <BookmarkButton
              onClick={handleToggleBookmark}
              spotify_id={props.spotify_id}
              bookmarked={props.bookmarked!}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const trimString = (str: string, length: number) => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};

interface BookmarkButtonProps {
  bookmarked: boolean;
  spotify_id: string;
  onClick: (spotify_id: string) => void;
}

export const BookmarkButton = (props: BookmarkButtonProps) => {
  const [bookmarked, setBookmarked] = useState(props.bookmarked);
  const [isHovering, setIsHovering] = useState(false);

  const handleToggleBookmark = () => {
    setBookmarked(!bookmarked);
    props.onClick(props.spotify_id);
  };

  const fillColor =
    isHovering && bookmarked
      ? "#dc2626"
      : bookmarked
      ? "#22c55e"
      : "transparent";
  const strokeColor =
    isHovering && bookmarked
      ? "white"
      : bookmarked
      ? "#22c55e"
      : isHovering
      ? "#22c55e"
      : "#717171";

  return (
    <button
      className="rounded-md bg-gray-700 bg-opacity-10 bg-clip-padding p-1 backdrop-blur-sm transition-colors hover:bg-gray-700 hover:text-[#D2D2D3]"
      onClick={handleToggleBookmark}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && bookmarked ? (
        <BookmarkX size={20} fill={fillColor} stroke={strokeColor} />
      ) : (
        <Bookmark size={20} fill={fillColor} stroke={strokeColor} />
      )}
    </button>
  );
};
