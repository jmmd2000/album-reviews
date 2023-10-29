/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RatingChip } from "~/components/RatingChip";
import { Loader } from "~/components/Loader";
import { type AlbumReview, type SpotifyImage } from "~/types";
import { api } from "~/utils/api";
import { AlbumGrid } from "../albums/new";
import Head from "next/head";

export default function ArtistDetail() {
  // const [albumDetails, setAlbumDetails] = useState<AlbumWithExtras>();
  const [albums, setAlbums] = useState<AlbumReview[]>([]);
  const [images, setImages] = useState<SpotifyImage[]>([]);

  const router = useRouter();
  const artistID = router.query.id as string;

  const {
    data: artist,
    // isLoading,
    isSuccess,
  } = api.spotify.getArtistById.useQuery(artistID);

  // const {
  //   data: artist_tracks,
  //   // isLoading,
  //   isSuccess: artistTracksSuccess,
  // } = api.spotify.getArtistTracks.useQuery(artistID);

  useEffect(() => {
    //console.log("artist", artist);
    if (isSuccess && artist) {
      setImages(JSON.parse(artist.image_urls) as SpotifyImage[]);
      setAlbums(artist.albums);
    }

    // if (artistTracksSuccess && artist_tracks) {
    //   setTracks(artist_tracks);
    //   console.log("artist_tracks", artist_tracks);
    // }
  }, [isSuccess, artist]);

  return (
    <>
      <Head>
        <title>{artist?.name}</title>
      </Head>
      <div className="mx-auto mt-12 flex w-full flex-col items-center sm:w-[70%]">
        {artist === undefined ? (
          <Loader />
        ) : (
          <div className="flex w-full flex-col items-center justify-start gap-4 sm:max-h-[250px] sm:w-[80%] sm:flex-row sm:gap-12">
            <img
              src={images[1]?.url}
              alt={artist?.name}
              className="aspect-square w-44 sm:w-[250px]"
            />
            <div className="flex flex-col gap-2 sm:mt-8 sm:gap-4">
              <h1 className="inline-block w-[200px] overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-bold text-white sm:w-full sm:text-3xl">
                {artist?.name}
              </h1>

              <div className="relative mt-4">
                <p className="text-base text-gray-500">
                  {artist?.albums.length}{" "}
                  {artist?.albums.length === 1 ? "review" : "reviews"}
                </p>
                <p className="text-base text-gray-500">
                  Rank #{artist?.leaderboard_position}
                </p>
              </div>
            </div>
            {artist?.average_score && (
              <div className="mt-4 sm:mt-0">
                <RatingChip
                  ratingNumber={Math.round(artist?.average_score)}
                  form="label"
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mx-auto mt-12 w-full">
        <AlbumGrid reviewedAlbums={albums} />
      </div>
    </>
  );
}
