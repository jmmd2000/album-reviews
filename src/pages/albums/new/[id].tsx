import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTokenContext } from "~/context/TokenContext";
import { RatingValue, SpotifyAlbum } from "~/types";
import { api } from "~/utils/api";

export default function NewAlbumForm() {
  // const [token, setToken] = useState("");
  const [albumDetails, setAlbumDetails] = useState<SpotifyAlbum>();
  const [artistImageURL, setArtistImageURL] = useState("");
  const [artistID, setArtistID] = useState("");
  const { token } = useTokenContext();
  const router = useRouter();
  const albumID = router.query.id as string;

  // Queries Spotify with an album ID. Disabled by default, runs on button click.
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

  const { refetch: fetchArtistImage } =
    api.spotify.getArtistImageFromSpotify.useQuery(
      {
        id: artistID,
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

  // useEffect(() => {
  //   async function getDetails() {
  //     // If there is a token saved in state, try to refetch the search results.
  //     if (token !== "") {
  //       const { data, isLoading, isSuccess, isError } = await fetchAlbumInfo();

  //       // Handle loading state
  //       if (isLoading) {
  //         console.log("loading");
  //       }

  //       // If the search results are successfully fetched, and are not undefined, save them in state.
  //       if (isSuccess) {
  //         if (data !== undefined) {
  //           setAlbumDetails(data);
  //         }
  //       }

  //       // If there is an error, throw it.
  //       if (isError) {
  //         throw new Error("Error fetching album data.");
  //       }
  //     } else {
  //       throw new Error("No access token.");
  //     }
  //   }

  //   getDetails()
  //     .then(() => {
  //       console.log("done");
  //       console.log("albumDetails", albumDetails);
  //       if (albumDetails?.artists[0] !== undefined) {
  //         console.log("DING DING DING", albumDetails.artists[0].id);
  //         setArtistID(albumDetails.artists[0].id);
  //       }
  //     })
  //     .catch((error: Error) => {
  //       console.log(error.message);
  //     });
  // }, []);

  useEffect(() => {
    async function getDetails() {
      try {
        if (token) {
          const { data, isLoading, isSuccess, isError } =
            await fetchAlbumInfo();

          if (isLoading) {
            // console.log("loading");
          }

          if (isSuccess && data) {
            setAlbumDetails(data);
          }

          if (isError) {
            throw new Error("Error fetching album data.");
          }
        } else {
          throw new Error("No access token.");
        }
      } catch (error) {
        throw error; // Re-throw the error to propagate it
      }
    }

    getDetails()
      .then(() => {
        if (albumDetails?.artists[0]) {
          const artistId = albumDetails.artists[0].id;
          setArtistID(artistId);
        }
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }, [token, albumDetails]);

  useEffect(() => {
    async function getArtistImage() {
      // If there is a token saved in state, try to refetch the search results.
      if (token !== "") {
        const { data, isLoading, isSuccess, isError } =
          await fetchArtistImage();

        // Handle loading state
        if (isLoading) {
          // console.log("loading");
        }

        // If the search results are successfully fetched, and are not undefined, save them in state.
        if (isSuccess) {
          if (data !== undefined && data! !== null) {
            setArtistImageURL(data);
          }
        }

        // If there is an error, throw it.
        if (isError) {
          throw new Error("Error fetching artist image.");
        }
      } else {
        throw new Error("No access token.");
      }
    }

    getArtistImage()
      .then(() => {
        // console.log("done");
      })
      .catch((error: Error) => {
        // console.log(error.message);
      });
  }, [artistID]);

  // const [trackRatings, setTrackRatings] = useState<Record<string, RatingValue>>(
  //   Object.fromEntries(
  //     albumDetails!.tracks.map((track) => [track.id, "Perfect" as RatingValue]),
  //   ),
  // );

  // const handleRatingChange = (
  //   trackId: string,
  //   event: React.ChangeEvent<HTMLSelectElement>,
  // ) => {
  //   const selectedRating = event.target.value as RatingValue;
  //   setTrackRatings((prevRatings) => ({
  //     ...prevRatings,
  //     [trackId]: selectedRating,
  //   }));
  // };

  return (
    <div className="m-12">
      <h1 className="text-3xl text-white">{albumDetails?.name}</h1>
      <img src={albumDetails?.images[1]?.url} alt="" />
      <img src={artistImageURL} alt="" />
      {/* <div>
        <h1>{albumDetails?.name} - Track Ratings</h1>
        {albumDetails?.tracks.map((track) => (
          <div key={albumDetails?.id}>
            <p>{track.name}</p>
            <select
              value={trackRatings[track.id]}
              onChange={(event) => handleRatingChange(track.id, event)}
            >
              {RatingValue.values().map((rating, index) => (
              <option key={rating} value={index}>
                {rating}
              </option>
            ))}
            </select>
          </div>
        ))}
      </div> */}
    </div>
  );
}
