import { api } from "~/utils/api";
import { AlbumGrid } from "./new/index";
import { Loader } from "~/components/Loader";
import { type DisplayAlbum } from "~/types";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";

export default function AlbumsPage() {
  const [reviews, setReviews] = useState<DisplayAlbum[]>([]);

  const {
    data: albumReviews,
    isLoading,
    isSuccess,
    isError,
  } = api.album.getAllReviews.useQuery();

  useEffect(() => {
    if (isSuccess) {
      setReviews(albumReviews);
      console.log(albumReviews);
    }

    if (isError) {
      toast.error("Error fetching albums.", {
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
        <title>Albums</title>
      </Head>
      <div className="m-2 xl:m-10">
        {isLoading ? (
          <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
            <Loader />
          </div>
        ) : isSuccess ? (
          reviews ? (
            <AlbumGrid albums={albumReviews} controls />
          ) : (
            <h2 className="m-16 text-xl text-[#D2D2D3]">
              No albums have been reviewed yet :(
            </h2>
          )
        ) : isError ? (
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            Error fetching albums :(
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
