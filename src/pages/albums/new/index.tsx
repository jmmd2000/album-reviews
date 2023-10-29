/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import {
  type AlbumReview,
  type SpotifyAlbum,
  type SpotifyImage,
} from "src/types";
import { useTokenContext } from "~/context/TokenContext";
import { Loader } from "~/components/Loader";
import { RatingChip } from "~/components/RatingChip";
import ResponsiveImage from "~/components/ResponsiveImage";

export default function NewAlbumPage() {
  const [searchResults, setSearchResults] = useState<SpotifyAlbum[]>([]);
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

  // const { data } = api.spotify.getAll.useQuery();
  // console.log(data);

  // useEffect(() => {
  //   // Fetches token and saves it in state.
  //   async function getToken() {
  //     const { data, isSuccess, isError } = await retryFetch();

  //     // If the token is successfully fetched, and is not undefined, save it in state.
  //     if (isSuccess) {
  //       if (data !== undefined) {
  //         updateToken(data.access_token);
  //       }
  //     }

  //     // If there is an error, throw it.
  //     if (isError) {
  //       throw new Error("Error fetching access token");
  //     }
  //   }

  //   getToken()
  //     .then(() => {
  //       console.log("done");
  //     })
  //     .catch((error: Error) => {
  //       console.log(error.message);
  //     });
  // }, []);

  //* Queries Spotify with a search term and saves the results in state.
  async function handleSearch() {
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
          setSearchResults(data.albums.items);
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
        //console.log(error.message);
      });
  };

  return (
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
      {/* {
        //* If there are search results, render them.
        searchResults.length !== 0 ? (
          <AlbumGrid albums={searchResults} />
        ) : (
          //* If there are no search results, render a message.
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            Use the input to search for albums.
          </h2>
        )
      } */}
      {loading ? (
        <Loader />
      ) : searchResults.length !== 0 ? (
        <AlbumGrid searchedAlbums={searchResults} controls />
      ) : (
        <h2 className="m-16 text-xl text-[#D2D2D3]">
          Use the input to search for albums.
        </h2>
      )}
    </div>
  );
}

interface AlbumGridProps {
  searchedAlbums?: SpotifyAlbum[];
  reviewedAlbums?: AlbumReview[];
  controls?: boolean;
}

export const AlbumGrid: React.FC<AlbumGridProps> = (props) => {
  const { searchedAlbums, reviewedAlbums, controls } = props;
  const [albumGroup, setAlbumGroup] = useState<SpotifyAlbum[] | AlbumReview[]>(
    [],
  );

  useEffect(() => {
    //* Only show "albums" and "compilations" from Spotify, not "singles" etc.
    if (searchedAlbums) {
      const filteredAlbums = searchedAlbums.filter(
        (album) =>
          album.album_type === "album" || album.album_type === "compilation",
      );
      setAlbumGroup(filteredAlbums);
    } else if (reviewedAlbums) {
      setAlbumGroup(reviewedAlbums);
    }
  }, [searchedAlbums, reviewedAlbums]);

  const filterAlbums = (filterText: string) => {
    //* This can only be called from the select, which only shows when albumGroup is AlbumReview[]. We can safely assume everything is AlbumReview[].
    const filteredAlbums: AlbumReview[] = (albumGroup as AlbumReview[]).filter(
      (album) => {
        const { name, artist, release_year } = album;
        return (
          name.toLowerCase().includes(filterText.toLowerCase()) ||
          artist.name.toLowerCase().includes(filterText.toLowerCase()) ||
          release_year.toString().includes(filterText)
        );
      },
    );

    return filteredAlbums;
  };

  const sortAlbums = (sort: string) => {
    //* This can only be called from the select, which only shows when albumGroup is AlbumReview[]. We can safely assume everything is AlbumReview[].
    let sortedAlbums: AlbumReview[] = [...(albumGroup as AlbumReview[])];

    switch (sort) {
      case "all":
        sortedAlbums = reviewedAlbums!;
        break;
      case "album-az":
        sortedAlbums = sortedAlbums.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        break;
      case "album-za":
        sortedAlbums = sortedAlbums.sort((a, b) =>
          b.name.localeCompare(a.name),
        );
        break;
      case "score-asc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => a.review_score - b.review_score,
        );
        break;
      case "score-desc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => b.review_score - a.review_score,
        );
        break;
      case "year-asc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => a.release_year - b.release_year,
        );
        break;
      case "year-desc":
        sortedAlbums = sortedAlbums.sort(
          (a, b) => b.release_year - a.release_year,
        );
        break;
      default:
        sortedAlbums = reviewedAlbums!;
    }

    setAlbumGroup(sortedAlbums);
  };

  //! Really janky way to pass in the values
  //- TODO: Improve this
  return (
    <>
      {reviewedAlbums && controls && (
        <div className="flex w-full flex-row gap-2 ">
          <input
            type="text"
            className="w-[70%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-sm  placeholder:text-[#d2d2d3a8] xl:w-80"
            placeholder="Filter by album name, artist or year..."
            onChange={(e) => {
              const filterText = e.target.value;
              if (filterText.length === 0) {
                setAlbumGroup(reviewedAlbums);
              } else {
                const filteredAlbums = filterAlbums(filterText);
                setAlbumGroup(filteredAlbums);
              }
            }}
          />
          <select
            className="w-[30%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition xl:w-36 xl:text-base "
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
      )}
      <div className="grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:gap-x-6 2xl:grid-cols-7">
        {albumGroup.length !== 0
          ? albumGroup.map((album) => albumTypeCheck(album))
          : null}
      </div>
    </>
  );
};

//* Check if its a SpotifyAlbum or AlbumReview (if its from Spotify or from the database).
function albumTypeCheck(album: SpotifyAlbum | AlbumReview) {
  if (album.hasOwnProperty("album_type")) {
    const spotifyAlbum = album as SpotifyAlbum;
    return (
      <AlbumCard
        spotify_id={spotifyAlbum.id}
        key={spotifyAlbum.id}
        name={spotifyAlbum.name}
        release_date={spotifyAlbum.release_date}
        image_url={spotifyAlbum.images[1]?.url}
        artist={{
          name: spotifyAlbum.artists[0]?.name,
          spotify_id: spotifyAlbum.artists[0]?.id,
        }}
      />
    );
  } else if (album.hasOwnProperty("spotify_id")) {
    const albumReview = album as AlbumReview;
    const imageURL = JSON.parse(albumReview.image_urls) as SpotifyImage[];
    return (
      <AlbumCard
        spotify_id={albumReview.spotify_id}
        key={albumReview.spotify_id}
        name={albumReview.name}
        release_year={albumReview.release_year}
        image_url={imageURL[1]?.url}
        artist={{
          name: albumReview.artist ? albumReview.artist.name : undefined,
          spotify_id: albumReview.artist
            ? albumReview.artist.spotify_id
            : undefined,
        }}
        score={albumReview.review_score}
      />
    );
  }
}

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
export const AlbumCard = (props: {
  spotify_id: string;
  name: string;
  release_date?: string;
  release_year?: number;
  image_url: string | undefined;
  artist?: {
    name: string | undefined;
    spotify_id: string | undefined;
  };
  score?: number;
}) => {
  //* Get just the year from the release date
  let year = 0;
  let href = "";
  if (props.release_date) {
    const date = new Date(props.release_date);
    year = date.getFullYear();
    href = `/albums/new/${props.spotify_id}`;
  } else if (props.release_year) {
    year = props.release_year;
    href = `/album/${props.spotify_id}`;
  }

  //* Apply custom marquee scroll animation to
  //*  albums with names longer than 25 characters. (arbitrary)
  let scrollAnimation = "";
  if (props.name.length !== undefined) {
    if (props.name.length > 25) {
      scrollAnimation = "animate-marquee";
    }
  }

  return (
    <Link href={href}>
      <div className="relative mt-5 flex max-h-max max-w-[154px] flex-col items-start overflow-hidden whitespace-nowrap text-start sm:w-44 lg:max-w-[205px] xl:w-full">
        <ResponsiveImage
          src={props.image_url!}
          alt={`Photo of ${props.name}`}
          className="aspect-square max-h-[154px] transition-all hover:cursor-pointer hover:drop-shadow-2xl sm:h-44 sm:max-h-44 xl:h-52 xl:max-h-56"
        />
        <div className="mb-1 mt-2 flex w-full flex-col items-start ">
          <p
            className={
              "mb-1 text-sm font-medium text-white xl:text-base " +
              scrollAnimation
            }
          >
            {props.name}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {props.artist?.name ? (
              <>
                <p className="text-xs font-medium text-[#717171]">
                  {props.artist.name}
                </p>
                <p className="text-xs font-medium text-[#717171]">-</p>
              </>
            ) : null}
            <p className="text-xs font-medium text-[#717171]">{year}</p>
          </div>
          {props.score ? (
            <RatingChip ratingNumber={Math.round(props.score)} form="small" />
          ) : null}
        </div>
      </div>
    </Link>
  );
};
