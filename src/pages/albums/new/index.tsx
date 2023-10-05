/* eslint-disable @next/next/no-img-element */
import { ReviewedAlbum } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { env } from "~/env.mjs";

import { RouterOutputs, api } from "~/utils/api";
import { getAccessToken } from "~/server/spotify";
import { JSX, use, useEffect, useState } from "react";
import { SpotifyAlbum, SpotifySearchResponse } from "src/types";
import { set, z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTokenContext } from "~/context/TokenContext";

export default function NewAlbumPage() {
  const [searchResults, setSearchResults] = useState<SpotifyAlbum[]>([]);
  const [inputValue, setInputValue] = useState("");
  // const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, updateToken } = useTokenContext();

  // Fetches the access token to be used with queries.
  // Disabled by default, runs once on mount.
  const { data: fetchedToken, refetch: retryFetch } =
    api.spotify.fetchAccessToken.useQuery("", {
      retry: false,
      enabled: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  // Queries Spotify with a search term. Disabled by default, runs on button click.
  // Runs once on mount, but no query value is set so its a wasted request.
  // Needs to be refactored to run on button click only.
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

  useEffect(() => {
    // Fetches token and saves it in state.
    async function getToken() {
      const { data, isSuccess, isError } = await retryFetch();

      // If the token is successfully fetched, and is not undefined, save it in state.
      if (isSuccess) {
        if (data !== undefined) {
          updateToken(data.access_token);
        }
      }

      // If there is an error, throw it.
      if (isError) {
        throw new Error("Error fetching access token");
      }
    }

    getToken()
      .then(() => {
        console.log("done");
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }, []);

  // Queries Spotify with a search term and saves the results in state.
  async function handleSearch() {
    // If there is a token saved in state, try to refetch the search results.
    if (token !== "") {
      const { data, isLoading, isSuccess, isError } = await refetchResults();

      // Handle loading state
      if (isLoading) {
        console.log("loading");
      }

      // If the search results are successfully fetched, and are not undefined, save them in state.
      if (isSuccess) {
        if (data !== undefined) {
          setSearchResults(data.albums.items);
        }
      }

      // If there is an error, throw it.
      if (isError) {
        throw new Error("Error fetching search results");
      }
    } else {
      throw new Error("No access token.");
    }
  }

  // Function to handle button click
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
          placeholder="Search album, artist or year..."
        />
        <button
          className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
          onClick={handleClick}
        >
          Submit
        </button>
      </div>
      {
        // If there are search results, render them.
        searchResults.length !== 0 ? (
          <AlbumGrid albums={searchResults} />
        ) : (
          // If there are no search results, render a message.
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            Use the input to search for albums.
          </h2>
        )
      }
    </div>
  );
}

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
const AlbumCard = (props: SpotifyAlbum) => {
  // const { id, name, artist_id, image_urls } = props;
  // const artistData = api.artist.getByID.useQuery({ id: props.artists[0]!.id });
  // const artist = artistData.data;
  // console.log(artistData);
  // Get just the year from the release date
  const date = new Date(props.release_date);
  const year = date.getFullYear();

  // Apply custom marquee scroll animation to
  // albums with names longer than 25 characters. (arbitrary)
  let scrollAnimation = "";
  if (props.name.length > 25) {
    scrollAnimation = "animate-marquee";
  }

  return (
    <Link href={`/albums/new/${props.id}`}>
      <div className="mt-5 flex max-h-max w-[208px] flex-col items-start overflow-hidden whitespace-nowrap text-start">
        <img
          src={props.images[0]!.url}
          alt="Album cover"
          className="aspect-square transition-all hover:cursor-pointer hover:drop-shadow-2xl sm:h-44 2xl:h-52"
        />
        <div className="mb-1 mt-2 flex w-full flex-col items-start ">
          <p
            className={
              "mb-1 text-base font-medium text-white " + scrollAnimation
            }
          >
            {props.name}
          </p>
          <div className="mt-1 flex gap-1">
            <p className="text-xs font-medium text-[#717171]">
              {props.artists[0]?.name}
            </p>
            <p className="text-xs font-medium text-[#717171]">-</p>
            <p className="text-xs font-medium text-[#717171]">{year}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface AlbumGridProps {
  albums: SpotifyAlbum[];
}

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
const AlbumGrid: React.FC<AlbumGridProps> = (props) => {
  // const { id, name, artist_id, image_urls } = props;
  // const artistData = api.artist.getByID.useQuery({ id: props.artists[0]!.id });
  // const artist = artistData.data;
  // console.log(artistData);

  // Filters out singles and EPs.
  const filteredAlbums = props.albums.filter(
    (album) =>
      album.album_type === "album" || album.album_type === "compilation",
  );
  console.log(filteredAlbums);
  return (
    <div className="grid grid-cols-1 place-items-center gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
      {filteredAlbums.length !== 0
        ? filteredAlbums.map((album) => <AlbumCard {...album} key={album.id} />)
        : null}
    </div>
  );
};
