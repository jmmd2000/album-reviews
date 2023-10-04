/* eslint-disable @next/next/no-img-element */
import { ReviewedAlbum } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { env } from "../env.mjs";

import { RouterOutputs, api } from "~/utils/api";
import { getAccessToken } from "~/server/spotify";
import { JSX, use, useEffect, useState } from "react";
import { SpotifyAlbum, SpotifySearchResponse } from "src/types";
import { set, z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SpotifyAlbum[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

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
          setToken(data.access_token);
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

  // return (
  //   <div className="bg-red-100">
  //     <input type="text" onChange={(e) => setInputValue(e.target.value)} />
  //     <button onClick={handleClick}>Submit</button>
  //     <AlbumGrid albums={searchResults} />
  //   </div>
  // );

  return <div></div>;
}

// type AlbumReview = RouterOutputs["album"]["getAll"][number];
const AlbumCard = (props: SpotifyAlbum) => {
  // const { id, name, artist_id, image_urls } = props;
  // const artistData = api.artist.getByID.useQuery({ id: props.artists[0]!.id });
  // const artist = artistData.data;
  // console.log(artistData);
  return (
    <div className="flex aspect-square h-72 flex-col items-center p-6">
      <p className="">{props.name}</p>
      <img
        src={props.images[0]!.url}
        alt="Album cover"
        className="aspect-square h-52 transition-all hover:cursor-pointer hover:drop-shadow-2xl sm:h-44"
      />
      <div className="flex">
        <p>{props.artists[0]?.name}</p>
        <p>{props.release_date}</p>
      </div>
    </div>
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
    (album) => album.album_type === "album",
  );
  return (
    <div className="m-5 grid grid-cols-1 place-items-center bg-green-200 p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {filteredAlbums.length !== 0 ? (
        filteredAlbums.map((album) => <AlbumCard {...album} key={album.id} />)
      ) : (
        <div>loading</div>
      )}
    </div>
  );
};
