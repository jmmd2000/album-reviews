/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RatingCard, RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { removeFeaturedArtist } from "~/helpers/dateFormat";
import { formatDuration } from "~/helpers/durationConversion";
import { formatReviewContent } from "~/helpers/formatReviewContent";
import {
  type RatingChipValues,
  type ReviewedTrack,
  type ReviewedTrackArtist,
  type SpotifyImage,
} from "~/types";
import { api } from "~/utils/api";
import Link from "next/link";
import { useAuthContext } from "~/context/AuthContext";
import Head from "next/head";
import { useTokenContext } from "~/context/TokenContext";
import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export default function AlbumDetail() {
  // const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [tracks, setTracks] = useState<ReviewedTrack[]>([]);
  const [images, setImages] = useState<SpotifyImage[]>([]);
  const { auth } = useAuthContext();
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
  } = api.album.getReviewById.useQuery(albumID);

  useEffect(() => {
    if (isSuccess) {
      setTracks(JSON.parse(album!.scored_tracks) as ReviewedTrack[]);
      setImages(JSON.parse(album!.image_urls) as SpotifyImage[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <>
      <Head>
        <title>{album?.name}</title>
      </Head>
      <div className="mx-auto mb-28 mt-12 flex w-full flex-col items-center sm:w-[70%]">
        {album ? (
          <div className="flex w-full flex-col items-center justify-start gap-4 sm:max-h-[250px] sm:w-[80%] sm:flex-row sm:gap-12">
            <Dialog>
              <DialogTrigger>
                <img
                  src={images[1]?.url}
                  alt={album.name}
                  className="aspect-square w-44 sm:w-[250px]"
                />
              </DialogTrigger>
              <DialogContent>
                <img
                  src={images[0]?.url}
                  alt={album.name}
                  className="aspect-square w-[640px] p-0"
                />
              </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-2 sm:mt-8 sm:gap-4">
              <h1 className="inline-block min-w-[350px] max-w-[500px] overflow-hidden overflow-ellipsis text-xl font-bold text-white sm:w-full sm:text-3xl">
                {album?.name}
              </h1>

              <ArtistProfile
                artistName={album.artist.name}
                artistID={album.artist.spotify_id}
                token={token}
              />
              <div className="relative mt-4">
                <p className="text-base text-gray-500">
                  {tracks.length + " tracks"}
                </p>
                <p className="text-base text-gray-500">{album.runtime}</p>
                <p className="text-base text-gray-500">{album.release_date}</p>
              </div>
            </div>
            {album?.review_score && (
              <div className="mt-4 sm:mt-0">
                <RatingChip
                  ratingNumber={Math.round(album.review_score)}
                  form="label"
                />
              </div>
            )}
          </div>
        ) : (
          <Loader />
        )}

        {/* Review content */}
        {album?.review_content && (
          <div className="mt-4 w-full sm:mt-8 sm:w-[80%]">
            <p
              className="mx-2 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
              dangerouslySetInnerHTML={{
                __html: formatReviewContent(album?.review_content),
              }}
            ></p>
          </div>
        )}

        <BestWorst best={album?.best_song} worst={album?.worst_song} />

        <div className="mx-2 mb-4 mt-4 flex w-full flex-col gap-2 sm:mx-0 sm:mt-8 sm:w-[80%]">
          {/* //- Abstract this out to its own component */}
          {tracks.map((track, index) => (
            <TrackCard
              key={track.track_id}
              trackNumber={index + 1}
              name={track.track_name}
              artists={track.track_artist}
              duration={track.track_duration}
              rating={track.rating}
              trackID={track.track_id}
            />
          ))}
        </div>

        {auth && (
          <button
            className="my-4 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm transition hover:bg-gray-600"
            onClick={editReview}
          >
            Edit
          </button>
        )}
      </div>
    </>
  );
}

//* This displays the artist name and image
interface ArtistProfileProps {
  artistID: string;
  token: string;
  artistName: string;
}

export const ArtistProfile = (props: ArtistProfileProps) => {
  const { data: imageData } = api.spotify.getArtistImage.useQuery(
    {
      id: props.artistID,
      accessToken: props.token,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  return (
    <div className="flex items-center gap-2">
      {imageData?.image ? (
        <img
          src={imageData.image}
          alt={props.artistName}
          className="aspect-square w-[35px]"
        />
      ) : (
        <Loader />
      )}

      {imageData?.fromSpotify ? (
        <p className="font-base text-md text-gray-300">{props.artistName}</p>
      ) : (
        <Link
          href={`/artist/${props.artistID}`}
          className="font-base text-md text-gray-300 hover:underline"
        >
          {props.artistName}
        </Link>
      )}
    </div>
  );
};

//* This displays the best / worst song

interface BestWorstProps {
  best: string | undefined;
  worst: string | undefined;
}

const BestWorst = (props: BestWorstProps) => {
  return (
    <div className="mt-4 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:gap-8">
      <div className="flex items-center gap-2">
        <RatingCard rating="Best" form="medium" />
        {props.best === "-" ? (
          <p className="text-gray-500">None</p>
        ) : (
          <p className="text-[#D2D2D3]">{props.best}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <RatingCard rating="Worst" form="medium" />
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
  trackNumber?: number;
  name: string;
  trackID: string;
  artists: ReviewedTrackArtist[];
  duration: number;
  rating?: RatingChipValues;
  select?: boolean;
  setPreliminaryRating?: (rating: number, trackID: string) => void;
}) => {
  const ratingValues = [
    "Non-song",
    "Terrible",
    "Awful",
    "Bad",
    "OK",
    "Meh",
    "Good",
    "Great",
    "Brilliant",
    "Amazing",
    "Perfect",
  ];
  const {
    trackNumber,
    name,
    artists,
    duration,
    rating,
    select,
    trackID,
    setPreliminaryRating,
  } = props;

  // console.log(trackNumber, name);

  return (
    <div className="mx-2 flex h-[50px] max-w-full flex-row justify-between gap-2 sm:mx-0">
      <div className="flex w-full items-center justify-between rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-2 text-sm text-[#D2D2D3] shadow-lg sm:p-3 sm:text-base">
        <div className="flex w-full flex-row gap-2 overflow-hidden">
          {trackNumber && <p className="">{trackNumber + "."}</p>}
          {/* //- Change this to show all artists on bigger screens, but remove main artist on smaller */}
          <p className="inline-block max-w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap sm:w-full md:max-w-[380px]">
            {removeFeaturedArtist(name)}
          </p>
        </div>
        <div className="flex w-[20%] flex-row items-start justify-between gap-1 sm:w-full sm:gap-2">
          {window.innerWidth > 640 ? (
            <>
              <p className="relative overflow-hidden whitespace-nowrap text-gray-400">
                {artists.map((artist, index, artists) =>
                  index + 1 === artists.length
                    ? artist.name
                    : artist.name + ", ",
                )}
              </p>
              <p className="text-gray-400">
                {formatDuration(duration, "short")}
              </p>
            </>
          ) : (
            <p className="ml-auto text-gray-400">
              {formatDuration(duration, "short")}
            </p>
          )}
        </div>
      </div>
      {select ? (
        window.innerWidth < 640 ? (
          <select
            className="h-[50px] w-16 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-xs text-[#D2D2D3] shadow-lg"
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
          <select
            className="rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg"
            id={trackID}
            defaultValue={rating}
            onChange={(e) => setPreliminaryRating!(+e.target.value, trackID)}
          >
            {ratingValues.map((rating, index) => (
              <option key={rating} value={index} className="text-gray-900">
                {rating}
              </option>
            ))}
          </select>
        )
      ) : window.innerWidth < 640 ? (
        <RatingCard rating={rating!} form="small" />
      ) : (
        <RatingCard rating={rating!} form="medium" />
      )}
    </div>
  );
};
