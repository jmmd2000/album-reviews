/* eslint-disable @next/next/no-img-element */
import { ReviewedAlbum } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { env } from "~/env.mjs";

import { RouterOutputs, api } from "~/utils/api";
import { getAccessToken } from "~/server/spotify";
import { JSX, use, useEffect, useState } from "react";
import {
  AlbumReview,
  SpotifyAlbum,
  SpotifyImage,
  SpotifySearchResponse,
} from "src/types";
import { set, z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTokenContext } from "~/context/TokenContext";
import { Loader } from "~/components/Loader";
import { RatingChip } from "~/components/RatingChip";
import { type } from "os";

export default function NewAlbumPage() {
  const [searchResults, setSearchResults] = useState<SpotifyAlbum[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, updateToken } = useTokenContext();

  //* Queries Spotify with a search term. Disabled by default, runs on button click.
  const { data: albumSearchResults, refetch: refetchResults } =
    api.spotify.searchAlbums.useQuery(
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
        console.log("done");
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  };

  return (
    <div className="m-10">
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
        <AlbumGrid searchedAlbums={searchResults} />
      ) : (
        <h2 className="m-16 text-xl text-[#D2D2D3]">
          Use the input to search for albums.
        </h2>
      )}
    </div>
  );
}

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
const AlbumCard = (props: {
  spotify_id: string;
  name: string;
  release_date?: string;
  release_year?: number;
  image_url: string | undefined;
  artist: {
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
      <div className="relative mt-5 flex max-h-max w-[208px] flex-col items-start overflow-hidden whitespace-nowrap text-start">
        <img
          src={props.image_url}
          alt="Album cover"
          className="aspect-square transition-all hover:cursor-pointer hover:drop-shadow-2xl sm:h-44 xl:h-52"
        />
        <div className="mb-1 mt-2 flex w-full flex-col items-start ">
          <p
            className={
              "mb-1 text-base font-medium text-white " + scrollAnimation
            }
          >
            {props.name}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <p className="text-xs font-medium text-[#717171]">
              {props.artist.name}
            </p>
            <p className="text-xs font-medium text-[#717171]">-</p>
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

interface AlbumGridProps {
  searchedAlbums?: SpotifyAlbum[];
  reviewedAlbums?: AlbumReview[];
}

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
export const AlbumGrid: React.FC<AlbumGridProps> = (props) => {
  const { searchedAlbums, reviewedAlbums } = props;
  // const artistData = api.artist.getByID.useQuery({ id: props.artists[0]!.id });
  // const artist = artistData.data;
  // console.log(artistData);

  let albumGroup: SpotifyAlbum[] | AlbumReview[] = [];

  if (searchedAlbums) {
    //* Filters out singles and EPs.
    const filteredAlbums = searchedAlbums.filter(
      (album) =>
        album.album_type === "album" || album.album_type === "compilation",
    );
    albumGroup = filteredAlbums;
    console.log(filteredAlbums, "filtered");
  } else if (reviewedAlbums) {
    albumGroup = reviewedAlbums;
    console.log(reviewedAlbums, "reviewed");
  }

  //! Really janky way to pass in the values
  //- TODO: Improve this
  return (
    <div className="grid grid-cols-1 place-items-center gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-7">
      {albumGroup.length !== 0
        ? albumGroup.map((album) => albumTypeCheck(album))
        : null}
    </div>
  );
};

function albumTypeCheck(album: SpotifyAlbum | AlbumReview) {
  if (album.hasOwnProperty("album_type")) {
    const spotifyAlbum = album as SpotifyAlbum;
    return (
      <AlbumCard
        spotify_id={spotifyAlbum.id}
        key={spotifyAlbum.id}
        name={spotifyAlbum.name}
        release_date={spotifyAlbum.release_date}
        image_url={spotifyAlbum.images[0]?.url}
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
        image_url={imageURL[0]?.url}
        artist={{
          name: albumReview.artist.name,
          spotify_id: albumReview.artist.spotify_id,
        }}
        score={albumReview.review_score}
      />
    );
  }
}
