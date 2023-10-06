/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { RatingCard, RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { useTokenContext } from "~/context/TokenContext";
import { removeFeaturedArtist } from "~/helpers/dateFormat";
import { formatDuration } from "~/helpers/durationConversion";
import { AlbumWithExtras, RatingValue, SpotifyAlbum } from "~/types";
import { api } from "~/utils/api";

export default function NewAlbumForm() {
  // const [token, setToken] = useState("");
  const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  // const [artistID, setArtistID] = useState("");
  const { token } = useTokenContext();
  const router = useRouter();
  const albumID = router.query.id as string;

  useEffect(() => {
    console.log("albumID is:", albumID);
  }, [albumID]);

  const {
    data: albumInfo,
    isLoading,
    isSuccess,
    refetch: fetchAlbumInfo,
  } = api.spotify.getAlbumDetails.useQuery(
    {
      id: albumID,
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

  // // Queries Spotify with an album ID.
  // if (albumDetails === undefined) {
  //   console.log("albumDetails is undefined, fetching");

  //   const { data, isLoading, isSuccess, isError } = await fetchAlbumInfo();

  //   if (isLoading) {
  //     // console.log("loading");
  //   }

  //   if (isSuccess && albumInfo) {
  //     // console.log("albumInfo", albumInfo);
  //     // console.log("setting albumDetails");
  //     setAlbumDetails(albumInfo);
  //     // console.log("albumDetails set", albumDetails);
  //     if (albumInfo.album.artists[0] !== undefined) {
  //     } else {
  //       console.log("no artists found");
  //     }
  //   }
  // }

  useEffect(() => {
    async function getDetails() {
      // If there is a token saved in state, try to refetch the search results.
      if (token !== "" && albumID !== undefined) {
        const { data, isLoading, isSuccess, isError } = await fetchAlbumInfo();

        // Handle loading state
        if (isLoading) {
          console.log("loading");
        }

        // If the search results are successfully fetched, and are not undefined, save them in state.
        if (isSuccess) {
          if (data !== undefined) {
            setAlbumDetails(data);
          }
        }

        // If there is an error, throw it.
        if (isError) {
          throw new Error("Error fetching album data.");
        }
      } else {
        throw new Error("No access token.");
      }
    }

    getDetails()
      .then(() => {
        console.log("done");
        // console.log("albumDetails", albumDetails);
        // if (albumDetails?.artists[0] !== undefined) {
        //   console.log("DING DING DING", albumDetails.artists[0].id);
        //   setArtistID(albumDetails.artists[0].id);
        // }
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }, [token, albumID]);

  const ratingValues = [
    "Non-song",
    "Terrible",
    "Awful",
    "Bad",
    "OK",
    "Decent",
    "Good",
    "Great",
    "Brilliant",
    "Amazing",
    "Perfect",
  ];

  const album = albumDetails?.album;

  // const {
  //   mutate,
  //   isLoading: loading,
  //   isSuccess: success,
  //   isError,
  // } = api.spotify.create.useMutation({
  //   onSuccess: (data) => {
  //     console.log("success", data);
  //   },
  //   onError: (error) => {
  //     console.log("error", error);
  //   },
  // });

  const handleClick = () => {
    // const reviewInput = document.getElementById(
    //   "review_content",
    // ) as HTMLInputElement;
    // const bestInput = document.getElementById("best") as HTMLInputElement;
    // const worstInput = document.getElementById("worst") as HTMLInputElement;
    // const reviewContent = reviewInput.value;
    // const bestSong = bestInput.value;
    // const worstSong = worstInput.value;
    // const trackArray: {
    //   track_id: string;
    //   track_name: string;
    //   track_duration: number;
    //   track_artist: {
    //     external_urls: { spotify: string };
    //     href: string;
    //     id: string;
    //     name: string;
    //     type: string;
    //     uri: string;
    //   }[];
    //   album_id: string;
    //   rating: string;
    // }[] = [];
    // album?.tracks.items.forEach((track) => {
    //   const ratingInput = document.getElementById(
    //     track.id,
    //   ) as HTMLSelectElement;
    //   const ratingValue = ratingInput.value;
    //   trackArray.push({
    //     track_id: track.id,
    //     track_name: track.name,
    //     track_duration: track.duration_ms,
    //     track_artist: track.artists,
    //     album_id: album.id,
    //     rating: ratingValue,
    //   });
    // });
    // const finalReview = {
    //   album: album,
    //   review_content: reviewContent,
    //   best_song: bestSong,
    //   worst_song: worstSong,
    //   tracks: trackArray,
    // };
    // console.log(finalReview);
  };

  return (
    <div className="mx-auto mt-12 flex w-[60%] flex-col items-center">
      {album === undefined ? (
        <Loader />
      ) : (
        <div className="flex max-h-[250px] w-[80%] justify-start gap-12">
          <img
            src={album?.images[1]?.url}
            alt={album?.name}
            className="aspect-square w-[250px]"
          />
          <div className="mt-8 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-white">{album?.name}</h1>

            <ArtistProfile
              artistID={album.artists[0]?.id}
              token={token}
              artistName={album?.artists[0]?.name}
            />
            <div className="relative mt-4">
              <p className="text-base text-gray-500">
                {album?.total_tracks + " tracks"}
              </p>
              <p className="text-base text-gray-500">
                {albumDetails?.formatted_runtime}
              </p>
              <p className="text-base text-gray-500">
                {albumDetails?.formatted_release_date}
              </p>
              <RatingChip ratingNumber={100} form="label" />
            </div>
          </div>
        </div>
      )}
      {/* <RatingCard ratingString="Perfect" form="large" />
      <RatingCard ratingString="Brilliant" form="medium" />
      <RatingCard ratingString="Best" form="small" />
      <RatingCard ratingString="Worst" form="small" /> */}
      <textarea
        name="review_content"
        id="review_content"
        className="mt-8 h-[120px] w-[80%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
        placeholder="Write your review here..."
      ></textarea>
      <div className="mt-8 flex gap-4">
        <div className="flex items-center gap-2">
          <RatingCard ratingString="Best" form="small" />
          <input
            type="text"
            name="rating"
            id="best"
            className="max-h-[40px] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <RatingCard ratingString="Worst" form="small" />
          <input
            type="text"
            name="rating"
            id="worst"
            className="max-h-[40px] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
          />
        </div>
      </div>
      <div className="mt-8 flex w-[80%] flex-col gap-2">
        {album?.tracks.items.map((track, index) => (
          <div
            key={track.id}
            className="flex h-[50px] flex-row justify-between gap-2"
          >
            <div className="flex w-full justify-between rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg">
              <div className="flex w-full flex-row gap-2 overflow-hidden">
                <p className="">{index + 1 + "."}</p>
                <p className="">{removeFeaturedArtist(track.name)}</p>
              </div>
              <div className="flex w-full flex-row items-start justify-between gap-2">
                <p className="inline-block overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-400">
                  {track.artists.map((artist, index, artists) =>
                    index + 1 === artists.length
                      ? artist.name
                      : artist.name + ", ",
                  )}
                </p>
                <p className="text-gray-400">
                  {formatDuration(track.duration_ms, "short")}
                </p>
              </div>
            </div>
            <select
              // value={trackRatings[track.id]}
              // onChange={(event) => handleRatingChange(track.id, event)}
              className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
              id={track.id}
            >
              {ratingValues.map((rating, index) => (
                <option key={rating} value={index} className="text-gray-900">
                  {rating}
                </option>
              ))}
            </select>
            {/* <RatingCard ratingString="Brilliant" form="medium" /> */}
          </div>
        ))}
      </div>
      <button
        className="my-8 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
        // onClick={() =>
        //   mutate({
        //     title: "James",
        //     age: 23,
        //     country: "Ireland",
        //   })
        // }
      >
        {/* {loading ? <Loader /> : "Submit"} */}
      </button>
    </div>
  );
}

const ArtistProfile = (props: {
  artistID: string | undefined;
  token: string;
  artistName: string | undefined;
}) => {
  const [artistImageURL, setArtistImageURL] = useState("");

  const {
    data: imageURL,
    isLoading,
    isSuccess,
  } = api.spotify.getArtistImageFromSpotify.useQuery({
    id: props.artistID!,
    accessToken: props.token,
  });

  if (isLoading) {
    console.log("loading url");
  }

  if (isSuccess && imageURL) {
    // console.log("imageURL", imageURL);
    // setArtistImageURL(imageURL);
  }

  return (
    <div className="flex items-center gap-2">
      {imageURL ? (
        <img
          src={imageURL}
          alt={props.artistName}
          className="aspect-square w-[35px]"
        />
      ) : (
        <Loader />
      )}
      <p className="font-base text-md text-gray-300">{props.artistName}</p>
    </div>
  );
};
