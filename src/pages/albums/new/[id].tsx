/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RatingCard, RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { useTokenContext } from "~/context/TokenContext";
import { type Id, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { type AlbumWithExtras, type ReviewedTrack } from "~/types";
import { api } from "~/utils/api";
import { ArtistProfile, TrackCard } from "~/pages/album/[id]";
import Head from "next/head";
import { BookmarkButton } from ".";
import { calculateAlbumScore } from "~/helpers/calculateAlbumScore";

export default function NewAlbumForm() {
  const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [tracks, setTracks] = useState<ReviewedTrack[]>([]);
  const [preliminaryTracks, setPreliminaryTracks] = useState<
    { trackID: string; rating: number }[]
  >([]);
  const [preliminaryRating, setPreliminaryRating] = useState<number>(0);
  const { token } = useTokenContext();
  const router = useRouter();
  const albumID = router.query.id as string;
  // console.log("albumID", router.query.id);
  let creatingToast: Id | null = null;
  let updatingToast: Id | null = null;
  let deletingToast: Id | null = null;

  const { data: review, isLoading: checkingIfExists } =
    api.album.getReviewById.useQuery(albumID, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });

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

  const handlePreliminaryRatingChange = (rating: number, trackID: string) => {
    console.log("rating", rating, "trackID", trackID);
    const updatedTracks = preliminaryTracks.map((track) => {
      if (track.trackID === trackID) {
        track.rating = rating;
      } else {
        console.log("rating", rating, "trackID", trackID);
      }
      return track;
    });
    setPreliminaryTracks(updatedTracks);
  };

  useEffect(() => {
    if (preliminaryTracks) {
      console.log("preliminaryTracks", preliminaryTracks);
      const score = calculateAlbumScore(preliminaryTracks);
      setPreliminaryRating(score);
    }
  }, [preliminaryTracks]);

  useEffect(() => {
    if (review) {
      setTracks(JSON.parse(review.scored_tracks) as ReviewedTrack[]);
      const parsedTracks = JSON.parse(review.scored_tracks) as ReviewedTrack[];
      const mappedTracks = parsedTracks.map((track) => {
        return { trackID: track.track_id, rating: track.rating };
      });
      setPreliminaryTracks(mappedTracks);
    }
  }, [review]);

  const {
    data: albumInfo,
    isError,
    isSuccess,
  } = api.spotify.getAlbumDetails.useQuery(
    {
      id: albumID,
      accessToken: token,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  useEffect(() => {
    //* If the query is successful and the albumInfo is not undefined, set the albumDetails state.
    if (isSuccess && albumInfo !== undefined) {
      setAlbumDetails(albumInfo);

      console.log("album setting tracks", albumInfo?.album?.tracks.items);
      albumInfo?.album?.tracks.items.forEach((track) => {
        const trackRating = {
          trackID: track.id,
          rating: 0,
        };
        setPreliminaryTracks((prev) => [...prev, trackRating]);
      });
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
  }, [isSuccess, isError, albumInfo]);

  const album = albumDetails?.album;

  const { data: bookmarked } = api.album.checkIfAlbumIsBookmarked.useQuery(
    albumID,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  useEffect(() => {
    if (bookmarked !== undefined) {
      setIsBookmarked(bookmarked);
    }
  }, [bookmarked]);

  const {
    mutate: createNewReview,
    isLoading: loadingCreate,
    // isSuccess: successfulCreate,
    // isError: errorOnCreate,
  } = api.album.createAlbumReview.useMutation({
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
  } = api.album.updateAlbumReview.useMutation({
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
  } = api.album.deleteAlbumReview.useMutation({
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

    updateCurrentReview({
      review_content: reviewContent,
      old_review_content: review!.review_content!,
      best_song: bestSong,
      old_best_song: review!.best_song,
      worst_song: worstSong,
      old_worst_song: review!.worst_song,
      scored_tracks: trackArray,
      old_scored_tracks: JSON.parse(review!.scored_tracks) as ReviewedTrack[],
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
        {album ? (
          <div className="flex w-full flex-col items-center justify-start gap-4 sm:max-h-[250px] sm:w-[80%] sm:flex-row sm:gap-12">
            <img
              src={album.images[1]?.url}
              alt={album.name}
              className="aspect-square w-[250px]"
            />
            <div className="flex flex-col gap-2 sm:mt-8 sm:gap-4">
              <h1 className="inline-block w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold text-white sm:w-full sm:text-3xl">
                {album?.name}
              </h1>

              <ArtistProfile
                artistID={album.artists[0]!.id}
                token={token}
                artistName={album.artists[0]!.name}
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
            {(review == null || review == undefined) && (
              <div>
                <BookmarkButton
                  onClick={handleToggleBookmark}
                  spotify_id={album.id}
                  bookmarked={isBookmarked}
                />
              </div>
            )}
            {preliminaryTracks && (
              <div className="mt-4 sm:mt-0">
                <RatingChip ratingNumber={preliminaryRating} form="label" />
              </div>
            )}
          </div>
        ) : (
          <Loader />
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
                  trackNumber={index + 1}
                  name={track.name}
                  artists={track.artists}
                  duration={track.duration_ms}
                  trackID={track.id}
                  select
                  setPreliminaryRating={handlePreliminaryRatingChange}
                />
              ))
            : tracks.map((track, index) => (
                <TrackCard
                  key={track.track_id}
                  trackNumber={index + 1}
                  name={track.track_name}
                  artists={track.track_artist}
                  duration={track.track_duration}
                  trackID={track.track_id}
                  rating={track.rating}
                  select
                  setPreliminaryRating={handlePreliminaryRatingChange}
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
    <div className="mt-8 flex w-full flex-col items-center gap-3">
      <label htmlFor={id} className="text-slate-600">
        *italic*, -bold-, _both_
      </label>
      <textarea
        name={name}
        id={id}
        className="h-[200px] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg sm:w-[80%]"
        placeholder="Write your review here..."
        defaultValue={value}
      ></textarea>
    </div>
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
