import { api } from "~/utils/api";
import { AlbumGrid } from "./new/index";
import { Loader } from "~/components/Loader";
import { AlbumReview } from "~/types";
import { useEffect, useState } from "react";

export default function AlbumsPage() {
  const [reviews, setReviews] = useState<AlbumReview[]>([]);

  const {
    data: albumReviews,
    isLoading,
    isSuccess,
    isError,
  } = api.spotify.getAllReviews.useQuery();

  useEffect(() => {
    if (isSuccess) {
      setReviews(albumReviews as AlbumReview[]);
    }
  }, [isSuccess]);

  // const {
  //   data,
  //   isLoading: loading,
  //   isSuccess: success,
  // } = api.spotify.getAllArtists.useQuery();

  if (isSuccess) {
    console.log(albumReviews);
  }

  // if (success) {
  //   console.log(data);
  // }

  return (
    <div className="m-10">
      <div className="flex flex-row gap-2">
        <input
          type="text"
          className="w-80 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm placeholder:text-[#D2D2D3]"
          // onChange={(e) => setInputValue(e.target.value)}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter") {
          //     e.preventDefault();
          //     handleClick();
          //   }
          // }}
          placeholder="Filter by album name, artist or year..."
        />
        <button
          className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
          // onClick={handleClick}
        >
          Submit
        </button>
      </div>
      {/* {
        // If there are search results, render them.
        searchResults.length !== 0 ? (
          <AlbumGrid albums={searchResults} />
        ) : (
          // If there are no search results, render a message.
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            Use the input to search for albums.
          </h2>
        )
      } */}
      {isLoading ? (
        <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
          <Loader />
        </div>
      ) : isSuccess ? (
        reviews ? (
          <AlbumGrid reviewedAlbums={reviews} />
        ) : (
          // <AlbumGrid reviewedAlbums={albumReviews as AlbumReview[]} />
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            No albums have been reviewed yet :(
          </h2>
        )
      ) : isError ? (
        <h2 className="m-16 text-xl text-[#D2D2D3]">
          Error fetching albums :(
        </h2>
      ) : null}
    </div>
  );
}
