/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { api } from "~/utils/api";
import { useEffect, useRef, useState } from "react";
import { type SpotifyImage, type DisplayAlbum } from "src/types";
import { useTokenContext } from "~/context/TokenContext";
import { Loader } from "~/components/Loader";
import { RatingChip } from "~/components/RatingChip";
import ResponsiveImage from "~/components/ResponsiveImage";
import { toast } from "react-toastify";
import Head from "next/head";
// import { VisibilityObserver } from "~/components/VisibilityObserver";
import { Bookmark, BookmarkX, Search } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cva } from "class-variance-authority";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import React from "react";
import { useURLInteraction } from "~/hooks/useURLInteraction";
import { Button } from "~/components/ui/button";

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

  // useEffect(() => {
  // console.log(searchResults);
  // }, [searchResults]);

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

export type SortValues =
  | "all"
  | "album-az"
  | "album-za"
  | "score-asc"
  | "score-desc"
  | "year-asc"
  | "year-desc";

interface AlbumGridProps {
  albums?: DisplayAlbum[];
  controls?: boolean;
}

export const AlbumGrid = (props: AlbumGridProps) => {
  const { controls, albums } = props;
  const { createQueryString, setNewPathname, getSearchParams } =
    useURLInteraction();
  const [searchTerm, setSearchTerm] = useState("");
  const [albumGroup, setAlbumGroup] = useState<DisplayAlbum[]>(albums ?? []);

  const [sortKey, setSortKey] = useState<SortValues>(
    getSearchParams("sort", "all") as SortValues,
  );
  useEffect(() => {
    setSortKey(getSearchParams("sort", "all") as SortValues);
  }, [getSearchParams]);
  const [page, setPage] = useState(0);

  const {
    data: albumReviews,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = api.album.getPaginatedReviews.useQuery({
    page: page,
    limit: 35,
    sortValue: sortKey,
    searchTerm: searchTerm,
  });

  const handleSearch = () => {
    setSearchTerm(
      (document.getElementById("searchInput") as HTMLInputElement).value,
    );
    refetch()
      .then(() => {
        // console.log("done");
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

  useEffect(() => {
    if (albums) {
      setAlbumGroup(albums ?? []);
    } else if (isSuccess) {
      setAlbumGroup(albumReviews.displayAlbums);
    } else if (isError) {
      toast.error("Error fetching albums.", {
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    }
  }, [albumGroup, albumReviews, albums, isError, isSuccess]);

  const sortAlbums = async (sort: SortValues) => {
    //* This can only be called from the select, which only shows when albumGroup is AlbumReview[]. We can safely assume everything is AlbumReview[].
    //* Also update the sortKey to force a rerender of the off-screen cards.

    await setNewPathname(createQueryString("sort", sort));
    setSortKey(sort);
  };

  //! Really janky way to pass in the values
  //- TODO: Improve this
  return (
    <>
      {albumGroup && controls && (
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <div className="flex flex-row items-center gap-[2px]">
              <input
                type="text"
                className="w-full rounded-l-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-sm placeholder:text-[#d2d2d3a8]"
                placeholder="Filter by name, artist or year..."
                id="searchInput"
                onChange={(e) => {
                  if (e.target.value.length === 0) {
                    handleSearch();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                className="h-[50px] rounded-none rounded-r-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
              >
                <Search size={20} />
              </Button>
            </div>

            <select
              className="h-[50px] w-[50%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition sm:w-[30%] md:w-36 xl:text-base"
              onChange={(e) => {
                sortAlbums(e.target.value as SortValues).catch((error) => {
                  console.error("Error sorting albums:", error);
                });
              }}
              value={sortKey ?? "all"}
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
          <span className="md:ml-auto"></span>
          {albumReviews && (
            <p className="text-[#d2d2d3a8] ">
              {albumReviews.totalReviews} reviews
            </p>
          )}
        </div>
      )}
      {
        //? To solve the problem of the album grid being full width, we need a conditional class to set the width to 70% and the max cols to 5, use the cname package
        //? Removed the VisibilityObeserver in favour of pagination. To reenable, wrap below AlbumCard with the below code, and uncomment the visibility check in AlbumCard
        // <VisibilityObserver key={`${sortKey}-${album.spotify_id}`}>
        //   {(isVisible) => (
        //     <AlbumCard isVisible={isVisible}>
        //   )}
        // </VisibilityObserver>
      }
      <div className="mx-auto mb-5 grid w-full grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-6 2xl:grid-cols-7">
        {albumGroup.length !== 0
          ? albumGroup.map((album) => (
              <AlbumCard
                spotify_id={album.spotify_id}
                key={`${sortKey}-${album.spotify_id}`}
                name={album.name}
                release_year={album.release_year}
                image_url={album.image_urls[1]?.url}
                artist={{
                  name: album.artist_name,
                  spotify_id: album.artist_spotify_id,
                }}
                bookmarked={album.bookmarked}
                score={album.review_score}
                size="default"
              />
            ))
          : null}
      </div>
      {albumReviews && controls && (
        <div className="mt-5">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={page === 0}
                />
              </PaginationItem>
              {page !== 0 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationLink>
                  {isLoading ? <Loader size={25} /> : page + 1}
                </PaginationLink>
              </PaginationItem>
              {page + 1 < albumReviews.totalPages ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page + 1 === albumReviews.totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};

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
  // isVisible?: boolean;
  bookmarked?: boolean;
  size?: "default" | "small";
}

export const AlbumCard = (props: AlbumCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { token } = useTokenContext();

  const cardContainer = cva(
    [
      "relative",
      "flex",
      "max-h-max",
      "flex-col",
      "items-start",
      "overflow-hidden",
      "whitespace-nowrap",
      "text-start",
      "xl:w-full",
    ],
    {
      variants: {
        size: {
          default: "mt-5 max-w-[154px] sm:w-44 lg:max-w-[205px]",
          small: "mt-3 max-w-[124px] sm:w-36 lg:max-w-[175px]",
        },
      },
    },
  );

  const cardImage = cva(
    [
      "aspect-square",
      "transition-all",
      "hover:cursor-pointer",
      "hover:drop-shadow-2xl",
    ],
    {
      variants: {
        size: {
          default: "max-h-[154px] sm:h-44 sm:max-h-44 xl:h-52 xl:max-h-56",
          small: "max-h-[124px] sm:h-36 sm:max-h-36 xl:h-44 xl:max-h-44",
        },
      },
    },
  );

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

  // if (!props.isVisible) {
  //   return null;
  // }

  return (
    <div className={cardContainer({ size: props.size })} ref={cardRef}>
      <Link href={albumLink}>
        <ResponsiveImage
          src={props.image_url!}
          alt={`Photo of ${props.name}`}
          className={cardImage({ size: props.size })}
        />
      </Link>
      <div className="mb-1 mt-2 flex w-full flex-col items-start ">
        <Link href={albumLink}>
          <p className="mb-1 font-medium text-white xl:text-base ">
            {trimString(props.name, 22)}
          </p>
        </Link>
        <div className="mt-1 flex items-center gap-1">
          {props.artist?.name ? (
            <>
              <Link
                className="text-xs font-medium text-[#717171] transition hover:text-[#D2D2D3] hover:underline"
                href={artistLink}
              >
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <span>{trimString(props.artist.name, 16)}</span>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <ArtistHoverInfo
                      artistID={props.artist.spotify_id!}
                      artistName={props.artist.name}
                      token={token}
                      reviewed
                    />
                  </HoverCardContent>
                </HoverCard>
              </Link>
              <p className="text-xs font-medium text-[#717171]">-</p>
            </>
          ) : null}
          <p className="text-xs font-medium text-[#717171]">
            {props.release_year}
          </p>
        </div>
        {props.score ? (
          <div className="absolute bottom-0 right-0">
            <RatingChip ratingNumber={Math.round(props.score)} form="small" />
          </div>
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

export const trimString = (str: string, length: number) => {
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

interface ArtistHoverInfoProps {
  artistID: string;
  token: string;
  artistName: string;
  reviewed: boolean;
}

const ArtistHoverInfo = (props: ArtistHoverInfoProps) => {
  const [artistImage, setArtistImage] = useState("");
  // const { data: imageData } = api.spotify.getArtistImage.useQuery({
  //   id: props.artistID,
  //   accessToken: props.token,
  // });

  const { data, isSuccess } = api.artist.getArtistById.useQuery(
    props.artistID,
    {
      staleTime: 1000 * 60 * 10,
      // stale time increased to cache the data as this component is frequently unmounted and remounted
    },
  );

  useEffect(() => {
    if (isSuccess && data?.image_urls) {
      const urls = JSON.parse(data.image_urls) as SpotifyImage[];
      if (urls[2]) {
        setArtistImage(urls[2].url);
      }
    }
  }, [data, isSuccess]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {data?.image_urls && (
          <img
            src={artistImage}
            alt={props.artistName}
            className="aspect-square w-[35px]"
          />
        )}
        {/* {isLoading && <Loader size={30} />} */}
        {data && (
          <p className="font-base text-md text-gray-300">
            {trimString(props.artistName, 20)}
          </p>
        )}

        <div className="ml-auto">
          {data?.total_score && props.reviewed && (
            <RatingChip
              ratingNumber={Math.round(data.total_score)}
              form="small"
            />
          )}
        </div>
      </div>
      {data?.albums && (
        <>
          <div className="flex items-end">
            <p className="text-sm font-light text-gray-400">Top 3</p>
            <p className="ml-auto text-xs font-light text-gray-400">
              {data.albums.length === 1
                ? "1 review"
                : data.albums.length + " reviews"}
            </p>
          </div>
          <div className="flex gap-1">
            {data.albums
              .sort((a, b) => b.review_score! - a.review_score!)
              .slice(0, 3)
              .map((album, index) => (
                <img
                  src={album.image_urls[1]?.url}
                  alt=""
                  key={index}
                  className="aspect-square w-[30px]"
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};
