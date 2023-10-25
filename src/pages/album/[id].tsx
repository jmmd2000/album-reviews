/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RatingCard, RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { useTokenContext } from "~/context/TokenContext";
import { removeFeaturedArtist } from "~/helpers/dateFormat";
import { formatDuration } from "~/helpers/durationConversion";
import {
  // type AlbumWithExtras,
  type RatingChipValues,
  // RatingValue,
  // ReviewedArtist,
  type ReviewedTrack,
  type ReviewedTrackArtist,
  // SpotifyAlbum,
  type SpotifyImage,
} from "~/types";
import { api } from "~/utils/api";

export default function AlbumDetail() {
  // const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [tracks, setTracks] = useState<ReviewedTrack[]>([]);
  const [images, setImages] = useState<SpotifyImage[]>([]);
  const { token } = useTokenContext();
  const router = useRouter();
  const albumID = router.query.id as string;

  const editReview = () => {
    void router.push(`/albums/new/${albumID}`);
  };

  const {
    data: album,
    // isLoading,
    isSuccess,
  } = api.spotify.getReviewById.useQuery(albumID);

  useEffect(() => {
    if (isSuccess) {
      setTracks(JSON.parse(album!.scored_tracks) as ReviewedTrack[]);
      setImages(JSON.parse(album!.image_urls) as SpotifyImage[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <div className="mx-auto mt-12 flex w-[70%] flex-col items-center">
      {album === undefined ? (
        <Loader />
      ) : (
        <div className="flex max-h-[250px] w-[80%] items-center justify-start gap-12">
          <img
            src={images[1]?.url}
            alt={album?.name}
            className="aspect-square w-[250px]"
          />
          <div className="mt-8 flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-white">{album?.name}</h1>

            <ArtistProfile
              artistID={album?.artist.spotify_id}
              token={token}
              artistName={album?.artist.name}
            />
            <div className="relative mt-4">
              <p className="text-base text-gray-500">
                {tracks.length + " tracks"}
              </p>
              <p className="text-base text-gray-500">{album?.runtime}</p>
              <p className="text-base text-gray-500">{album?.release_date}</p>
            </div>
          </div>
          {album?.review_score && (
            <RatingChip
              ratingNumber={Math.round(album?.review_score)}
              form="label"
            />
          )}
        </div>
      )}

      <div className="mt-8 w-[80%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg">
        {album?.review_content}
      </div>

      <BestWorst best={album?.best_song} worst={album?.worst_song} />
      <div className="mt-8 flex w-[80%] flex-col gap-2">
        {/* //- Abstract this out to its own component */}
        {tracks.map((track, index) => (
          <TrackCard
            key={track.track_id}
            trackNumber={index}
            name={track.track_name}
            artists={track.track_artist}
            duration={track.track_duration}
            rating={track.rating}
            trackID={track.track_id}
          />
        ))}
      </div>

      <button
        className="my-8 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
        onClick={editReview}
      >
        Edit
      </button>
    </div>
  );
}

//* This displays the artist name and image
//! This queries the Spotify API for the artist image even though we already have it in the database
//- FIX THIS
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

//* This displays the best / worst song
const BestWorst = (props: {
  best: string | undefined;
  worst: string | undefined;
}) => {
  return (
    <div className="mt-8 flex gap-8">
      <div className="flex items-center  gap-2">
        <RatingCard rating="Best" form="small" />
        {props.best === "-" ? (
          <p className="text-gray-500">None</p>
        ) : (
          <p className="text-[#D2D2D3]">{props.best}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <RatingCard rating="Worst" form="small" />
        {props.worst === "-" ? (
          <p className="text-gray-500">None</p>
        ) : (
          <p className="text-[#D2D2D3]">{props.worst}</p>
        )}
      </div>
    </div>
  );
};

export const TrackCard = (props: {
  trackNumber: number;
  name: string;
  trackID: string;
  artists: ReviewedTrackArtist[];
  duration: number;
  rating?: RatingChipValues;
  select?: boolean;
}) => {
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
  const { trackNumber, name, artists, duration, rating, select, trackID } =
    props;

  return (
    <div className="flex h-[50px] flex-row justify-between gap-2">
      <div className="flex w-full justify-between rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg">
        <div className="flex w-full flex-row gap-2 overflow-hidden">
          <p className="">{trackNumber + 1 + "."}</p>
          {/* //- Change this to show all artists on bigger screens, but remove main artist on smaller */}
          <p className="">{removeFeaturedArtist(name)}</p>
        </div>
        <div className="flex w-full flex-row items-start justify-between gap-2">
          <p className="inline-block overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-400">
            {artists.map((artist, index, artists) =>
              index + 1 === artists.length ? artist.name : artist.name + ", ",
            )}
          </p>
          <p className="text-gray-400">{formatDuration(duration, "short")}</p>
        </div>
      </div>
      {select ? (
        <select
          // value={trackRatings[track.id]}
          // onChange={(event) => handleRatingChange(track.id, event)}
          className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
          id={trackID}
          defaultValue={rating}
        >
          {ratingValues.map((rating, index) => (
            <option key={rating} value={index} className="text-gray-900">
              {rating}
            </option>
          ))}
        </select>
      ) : (
        <RatingCard rating={rating!} form="medium" />
      )}
    </div>
  );
};
