//! This file is actually disgusting, held together with duct tape and paperclips.
//- URGENTLY needs a tidy up and refactor.

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RatingCard, RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { useTokenContext } from "~/context/TokenContext";
import { type Id, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  type AlbumWithExtras,
  type ReviewedTrack,
  // type SpotifyImage,
} from "~/types";
import { api } from "~/utils/api";
import { ArtistProfile, TrackCard } from "~/pages/album/[id]";
import Head from "next/head";
// import { useAuthContext } from "~/context/AuthContext";

export default function NewAlbumForm() {
  // const [token, setToken] = useState("");
  const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [tracks, setTracks] = useState<ReviewedTrack[]>([]);
  // const [images, setImages] = useState<SpotifyImage[]>([]);
  // const [artistID, setArtistID] = useState("");
  const { token } = useTokenContext();
  // const { auth } = useAuthContext();
  const router = useRouter();
  const albumID = router.query.id as string;
  let creatingToast: Id | null = null;
  let updatingToast: Id | null = null;
  let deletingToast: Id | null = null;

  const {
    data: review,
    isLoading: checkingIfExists,
    isSuccess: reviewExists,
  } = api.spotify.getReviewById.useQuery(albumID);

  useEffect(() => {
    //console.log("review", review);
    //console.log("isLoading", isLoading);
    //console.log("reviewExists", reviewExists);
    if (reviewExists) {
      if (review?.scored_tracks) {
        setTracks(JSON.parse(review.scored_tracks) as ReviewedTrack[]);
      }
      // setImages(JSON.parse(review!.image_urls) as SpotifyImage[]);
    }
  }, [reviewExists, checkingIfExists]);

  useEffect(() => {
    //console.log("albumID is:", albumID);
  }, [albumID]);

  const { refetch: fetchAlbumInfo } = api.spotify.getAlbumDetails.useQuery(
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

  useEffect(() => {
    async function getDetails() {
      //* If there is a token saved in state, try to refetch the search results.
      if (token !== "" && albumID !== undefined && !reviewExists) {
        const { data, isLoading, isSuccess, isError } = await fetchAlbumInfo();

        //* Handle loading state
        if (isLoading) {
          //console.log("loading");
        }

        //* If the search results are successfully fetched, and are not undefined, save them in state.
        if (isSuccess) {
          if (data !== undefined) {
            setAlbumDetails(data);
          }
        }

        //* If there is an error, throw it.
        if (isError) {
          toast.error("Error fetching album data.", {
            progressStyle: {
              backgroundColor: "#DC2626",
            },
          });
          throw new Error("Error fetching album data.");
        }
      } else {
        toast.error("No access token.", {
          progressStyle: {
            backgroundColor: "#DC2626",
          },
        });
        throw new Error("No access token.");
      }
    }

    getDetails()
      .then(() => {
        //console.log("done");
        // console.log("albumDetails", albumDetails);
        // if (albumDetails?.artists[0] !== undefined) {
        //   console.log("DING DING DING", albumDetails.artists[0].id);
        //   setArtistID(albumDetails.artists[0].id);
        // }
      })
      .catch(() => {
        //console.log(error.message);
      });
  }, [token, albumID]);

  const album = albumDetails?.album;

  const {
    mutate: createNewReview,
    isLoading: loadingCreate,
    // isSuccess: successfulCreate,
    // isError: errorOnCreate,
  } = api.spotify.createAlbumReview.useMutation({
    onSuccess: () => {
      // console.log("successful create", data);
      toast.update(creatingToast!, {
        render: "Review created successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        progressStyle: {
          backgroundColor: "#059669",
        },
      });
    },
    onError: () => {
      // console.log("error on create", error);
      toast.update(creatingToast!, {
        render: "Error creating review.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    },
  });

  const {
    mutate: updateCurrentReview,
    isLoading: loadingUpdate,
    // isSuccess: successfulUpdate,
    // isError: errorOnUpdate,
  } = api.spotify.updateAlbumReview.useMutation({
    onSuccess: () => {
      toast.update(updatingToast!, {
        render: "Review updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        progressStyle: {
          backgroundColor: "#059669",
        },
      });
    },
    onError: () => {
      toast.update(updatingToast!, {
        render: "Error updating review.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    },
  });

  const {
    mutate: deleteCurrentReview,
    isLoading: loadingDelete,
    // isSuccess: successfulDelete,
    // isError: errorOnDelete,
  } = api.spotify.deleteAlbumReview.useMutation({
    onSuccess: () => {
      toast.update(deletingToast!, {
        render: "Review deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
        progressStyle: {
          backgroundColor: "#059669",
        },
      });
    },
    onError: () => {
      toast.update(creatingToast!, {
        render: "Error deleting review.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    },
  });

  //! This is not the proper way to manage these updates
  //- Fix this later
  useEffect(() => {
    if (loadingUpdate) {
      updatingToast = toast.loading("Updating review...", {});
    }

    if (loadingCreate) {
      creatingToast = toast.loading("Creating review...", {});
    }

    if (loadingDelete) {
      deletingToast = toast.loading("Deleting review...", {});
    }
  }, [loadingCreate, loadingUpdate, loadingDelete]);

  const createReview = () => {
    const reviewInput = document.getElementById(
      "review_content",
    ) as HTMLInputElement;
    const bestInput = document.getElementById("best") as HTMLInputElement;
    const worstInput = document.getElementById("worst") as HTMLInputElement;
    const reviewContent = reviewInput.value;
    const bestSong = bestInput.value;
    const worstSong = worstInput.value;
    const trackArray: {
      track_id: string;
      track_name: string;
      track_duration: number;
      track_artist: {
        external_urls: { spotify: string };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
      }[];
      album_id: string;
      rating: number;
    }[] = [];
    album?.tracks.items.forEach((track) => {
      const ratingInput = document.getElementById(
        track.id,
      ) as HTMLSelectElement;
      const ratingValue = parseFloat(ratingInput.value);
      trackArray.push({
        track_id: track.id,
        track_name: track.name,
        track_duration: track.duration_ms,
        track_artist: track.artists,
        album_id: album.id,
        rating: ratingValue,
      });
    });
    // const finalReview = {
    //   album: album,
    //   review_content: reviewContent,
    //   best_song: bestSong,
    //   worst_song: worstSong,
    //   tracks: trackArray,
    //   formatted_release_date: albumDetails?.formatted_release_date,
    //   formatted_runtime: albumDetails?.formatted_runtime,
    // };

    createNewReview({
      album: album!,
      review_content: reviewContent,
      best_song: bestSong,
      worst_song: worstSong,
      scored_tracks: trackArray,
      formatted_release_date: albumDetails!.formatted_release_date,
      formatted_runtime: albumDetails!.formatted_runtime,
      access_token: token,
    });
  };

  const updateReview = () => {
    const reviewInput = document.getElementById(
      "review_content",
    ) as HTMLInputElement;
    const bestInput = document.getElementById("best") as HTMLInputElement;
    const worstInput = document.getElementById("worst") as HTMLInputElement;
    const reviewContent = reviewInput.value;
    const bestSong = bestInput.value;
    const worstSong = worstInput.value;
    const trackArray: {
      track_id: string;
      track_name: string;
      track_duration: number;
      track_artist: {
        external_urls: { spotify: string };
        href: string;
        id: string;
        name: string;
        type: string;
        uri: string;
      }[];
      album_id: string;
      rating: number;
    }[] = [];
    tracks.forEach((track) => {
      const ratingInput = document.getElementById(
        track.track_id,
      ) as HTMLSelectElement;
      const ratingValue = parseFloat(ratingInput.value);
      trackArray.push({
        track_id: track.track_id,
        track_name: track.track_name,
        track_duration: track.track_duration,
        track_artist: track.track_artist,
        album_id: track.album_id,
        rating: ratingValue,
      });
    });
    // const finalReview = {
    //   review_content: reviewContent,
    //   best_song: bestSong,
    //   worst_song: worstSong,
    //   tracks: trackArray,
    //   artist_id: review?.artist.spotify_id,
    // };

    updateCurrentReview({
      review_content: reviewContent,
      best_song: bestSong,
      worst_song: worstSong,
      scored_tracks: trackArray,
      artist_id: review!.artist.spotify_id,
      album_spotify_id: review!.spotify_id,
    });
  };

  const deleteReview = () => {
    deleteCurrentReview({
      album_spotify_id: review!.spotify_id,
      artist_spotify_id: review!.artist.spotify_id,
    });
  };

  return (
    <>
      <Head>
        <title>Edit: {album?.name}</title>
      </Head>
      <div className="mx-auto mt-12 flex w-full flex-col items-center justify-center sm:w-[70%]">
        {album === undefined ? (
          <Loader />
        ) : (
          <div className="flex w-full flex-col items-center justify-start gap-4 sm:max-h-[250px] sm:w-[80%] sm:flex-row sm:gap-12">
            <img
              src={album?.images[1]?.url}
              alt={album?.name}
              className="aspect-square w-[250px]"
            />
            <div className="flex flex-col gap-2 sm:mt-8 sm:gap-4">
              <h1 className="inline-block w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold text-white sm:w-full sm:text-3xl">
                {album?.name}
              </h1>

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
              </div>
            </div>
            {review !== null && review !== undefined && (
              <div className="mt-4 sm:mt-0">
                <RatingChip ratingNumber={review.review_score!} form="label" />
              </div>
            )}
          </div>
        )}

        <ReviewContentInput
          name="review_content"
          id="review_content"
          value={review?.review_content ?? ""}
        />

        <BestWorstInput
          name="best"
          bestID="best"
          worstID="worst"
          bestValue={review?.best_song ?? ""}
          worstValue={review?.worst_song ?? ""}
        />

        <div className="mx-2 mt-4 flex w-full flex-col gap-2 sm:mx-0 sm:mt-8 sm:w-[80%]">
          {/*//* If a review exists, use the tracks from that review so we can get the scores */}
          {review === null
            ? album?.tracks.items.map((track, index) => (
                <TrackCard
                  key={track.id}
                  trackNumber={index}
                  name={track.name}
                  artists={track.artists}
                  duration={track.duration_ms}
                  trackID={track.id}
                  select
                />
              ))
            : tracks.map((track, index) => (
                <TrackCard
                  key={track.track_id}
                  trackNumber={index}
                  name={track.track_name}
                  artists={track.track_artist}
                  duration={track.track_duration}
                  trackID={track.track_id}
                  rating={track.rating}
                  select
                />
              ))}
        </div>
        {review ? (
          <div className="flex gap-4">
            <button
              className="my-8 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
              onClick={updateReview}
            >
              Update
            </button>
            <button
              className="my-8 rounded-md border border-[#551d1d] bg-red-800  bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-red-600"
              onClick={deleteReview}
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            className="my-8 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
            onClick={createReview}
          >
            {checkingIfExists ? <Loader /> : "Submit"}
          </button>
        )}
      </div>
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
        position="bottom-center"
      />
    </>
  );
}

const ReviewContentInput = (props: {
  name: string;
  id: string;
  value?: string;
}) => {
  const { name, id, value } = props;
  return (
    <textarea
      name={name}
      id={id}
      className="mt-8 h-[120px] w-full rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg sm:w-[80%]"
      placeholder="Write your review here..."
      defaultValue={value}
    ></textarea>
  );
};

const BestWorstInput = (props: {
  name: string;
  bestID: string;
  worstID: string;
  bestValue: string;
  worstValue: string;
}) => {
  const { name, bestID, worstID, bestValue, worstValue } = props;
  return (
    <div className="mt-4 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:gap-8">
      <div className="flex items-center gap-2">
        <RatingCard rating="Best" form="medium" />
        <input
          type="text"
          name={name}
          id={bestID}
          className="max-h-[40px] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
          defaultValue={bestValue}
        />
      </div>
      <div className="flex items-center gap-2">
        <RatingCard rating="Worst" form="medium" />
        <input
          type="text"
          name={name}
          id={worstID}
          className="max-h-[40px] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
          defaultValue={worstValue}
        />
      </div>
    </div>
  );
};
