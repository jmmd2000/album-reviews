import { api } from "~/utils/api";
import { AlbumCard, AlbumGrid } from "~/pages/albums/new/index";
import { Loader } from "~/components/Loader";
import { type DisplayAlbum } from "~/types";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<DisplayAlbum[]>([]);
  const [chosenAlbum, setChosenAlbum] = useState<DisplayAlbum | null>(null);

  const {
    data: savedAlbums,
    isLoading,
    isSuccess,
    isError,
  } = api.album.getAllBookmarkedAlbums.useQuery();

  const { data } = api.album.chooseRandomBookmarkedAlbum.useQuery();

  useEffect(() => {
    if (data) {
      setChosenAlbum(data);
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      setBookmarks(savedAlbums);
    }

    if (isError) {
      toast.error("Error fetching saved albums.", {
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError]);

  return (
    <>
      <Head>
        <title>Saved</title>
      </Head>
      <div className="m-2 xl:m-10">
        {chosenAlbum && (
          <div className="flex w-full flex-col items-center justify-center">
            <h1 className="text-2xl font-medium text-white sm:text-3xl">
              Selected album
            </h1>
            <AlbumCard
              spotify_id={chosenAlbum.spotify_id}
              name={chosenAlbum.name}
              release_year={chosenAlbum.release_year}
              image_url={chosenAlbum.image_urls?.[0]?.url}
              artist={{
                name: chosenAlbum.artist_name,
                spotify_id: chosenAlbum.artist_spotify_id,
              }}
              bookmarked={chosenAlbum.bookmarked}
              isVisible
              size="default"
            />
          </div>
        )}
        {isLoading ? (
          <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
            <Loader />
          </div>
        ) : isSuccess ? (
          bookmarks && bookmarks.length !== 0 ? (
            <AlbumGrid albums={bookmarks} controls />
          ) : (
            <h2 className="m-16 text-xl text-[#D2D2D3]">
              No albums have been saved yet :(
            </h2>
          )
        ) : isError ? (
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            Error fetching saved albums :(
          </h2>
        ) : null}
        <ToastContainer
          toastStyle={{
            // same as bg-gray-700 bg-opacity-10
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
