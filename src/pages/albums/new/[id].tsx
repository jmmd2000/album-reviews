/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RatingCard, RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { useTokenContext } from "~/context/TokenContext";
// import { removeFeaturedArtist } from "~/helpers/dateFormat";
// import { formatDuration } from "~/helpers/durationConversion";
import {
  type AlbumWithExtras,
  // RatingValue,
  type ReviewedTrack,
  // SpotifyAlbum,
  // SpotifyImage,
} from "~/types";
import { api } from "~/utils/api";
import { TrackCard } from "~/pages/album/[id]";

export default function NewAlbumForm() {
  // const [token, setToken] = useState("");
  const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [tracks, setTracks] = useState<ReviewedTrack[]>([]);
  // const [images, setImages] = useState<SpotifyImage[]>([]);
  // const [artistID, setArtistID] = useState("");
  const { token } = useTokenContext();
  const router = useRouter();
  const albumID = router.query.id as string;

  const {
    data: review,
    isLoading: checkingIfExists,
    isSuccess: reviewExists,
  } = api.spotify.getReviewById.useQuery(albumID);

  useEffect(() => {
    if (reviewExists) {
      setTracks(JSON.parse(review!.scored_tracks) as ReviewedTrack[]);
      // setImages(JSON.parse(review!.image_urls) as SpotifyImage[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewExists, checkingIfExists]);

  useEffect(() => {
    console.log("albumID is:", albumID);
  }, [albumID]);

  const {
    // data: albumInfo,
    // isLoading,
    // isSuccess,
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

  useEffect(() => {
    async function getDetails() {
      //* If there is a token saved in state, try to refetch the search results.
      if (token !== "" && albumID !== undefined && !reviewExists) {
        const { data, isLoading, isSuccess, isError } = await fetchAlbumInfo();

        //* Handle loading state
        if (isLoading) {
          console.log("loading");
        }

        //* If the search results are successfully fetched, and are not undefined, save them in state.
        if (isSuccess) {
          if (data !== undefined) {
            setAlbumDetails(data);
          }
        }

        //* If there is an error, throw it.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, albumID]);

  const album = albumDetails?.album;

  const {
    mutate: createNewReview,
    // isLoading: loadingCreate,
    // isSuccess: successfulCreate,
    // isError: errorOnCreate,
  } = api.spotify.createAlbumReview.useMutation({
    onSuccess: (data) => {
      console.log("successful create", data);
    },
    onError: (error) => {
      console.log("error on create", error);
    },
  });

  const {
    mutate: updateCurrentReview,
    // isLoading: loadingUpdate,
    // isSuccess: successfulUpdate,
    // isError: errorOnUpdate,
  } = api.spotify.updateAlbumReview.useMutation({
    onSuccess: (data) => {
      console.log("successful update", data);
    },
    onError: (error) => {
      console.log("error on update", error);
    },
  });

  const {
    mutate: deleteCurrentReview,
    // isLoading: loadingDelete,
    // isSuccess: successfulDelete,
    // isError: errorOnDelete,
  } = api.spotify.deleteAlbumReview.useMutation({
    onSuccess: (data) => {
      console.log("successful delete", data);
    },
    onError: (error) => {
      console.log("error on delete", error);
    },
  });

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
    <div className="mx-auto mt-12 flex w-[80%] flex-col items-center">
      {album === undefined ? (
        <Loader />
      ) : (
        <div className="flex max-h-[250px] w-[80%] items-center justify-start gap-12">
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
            </div>
          </div>
          <RatingChip ratingNumber={100} form="label" />
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
      <div className="mt-8 flex w-[80%] flex-col gap-2">
        {/*//* If a review exists, use the tracks from that review so we can get the scores */}
        {!reviewExists
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
      {reviewExists ? (
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
  );
}

const ArtistProfile = (props: {
  artistID: string | undefined;
  token: string;
  artistName: string | undefined;
}) => {
  // const [artistImageURL, setArtistImageURL] = useState("");

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
      className="mt-8 h-[120px] w-[80%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
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
    <div className="mt-8 flex gap-4">
      <div className="flex items-center gap-2">
        <RatingCard rating="Best" form="small" />
        <input
          type="text"
          name={name}
          id={bestID}
          className="max-h-[40px] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
          defaultValue={bestValue}
        />
      </div>
      <div className="flex items-center gap-2">
        <RatingCard rating="Worst" form="small" />
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
