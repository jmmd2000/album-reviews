import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { formatDate } from "~/helpers/dateFormat";
import { getTotalDuration } from "~/helpers/durationConversion";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type SpotifyImage,
  // AlbumReview,
  type SpotifyAlbum,
  type SpotifyArtist,
  type SpotifySearchResponse,
  type ReviewedArtist,
  type ReviewedTrack,
} from "~/types";

/*
 -TODO: REMOVE NON-SPOTIFY API PROCEDURES AND PUT THEM IN A SEPARATE ROUTER.
*/

// const ReveiewedAlbumSchema = z.object({
//   artist_id: z.string(),
//   name: z.string(),
//   spotify_id: z.string(),
//   release_date: z.string(),
//   image_urls: z.string(),
//   best_song: z.string(),
//   worst_song: z.string(),
//   runtime: z.string(),
//   review: z.string(),
//   review_score: z.number(),
//   review_date: z.string(),
// });

// const ArtistSchema = z.object({
//   name: z.string(),
//   spotify_id: z.string(),
//   image_urls: z.string(),
//   average_score: z.number(),
//   leaderboard_position: z.number(),
// });

// const TrackSchema = z.object({
//   name: z.string(),
//   spotify_id: z.string(),
//   runtime: z.string(),
//   album_id: z.string(),
//   review_score: z.number(),
//   artists: z.object({
//     external_urls: z.object({
//       spotify: z.string(),
//     }),
//     href: z.string(),
//     id: z.string(),
//     name: z.string(),
//     type: z.string(),
//     uri: z.string(),
//   }),
// });

const ScoredTrackSchema = z.object({
  track_id: z.string(),
  track_name: z.string(),
  track_duration: z.number(),
  track_artist: z.array(
    z.object({
      external_urls: z.object({
        spotify: z.string(),
      }),
      href: z.string(),
      id: z.string(),
      name: z.string(),
      type: z.string(),
      uri: z.string(),
    }),
  ),
  album_id: z.string(),
  rating: z.number(),
});

const SpotifyAlbumSchema = z.object({
  album_type: z.string(),
  artists: z.array(
    z.object({
      external_urls: z.object({
        spotify: z.string(),
      }),
      href: z.string(),
      id: z.string(),
      name: z.string(),
      type: z.string(),
      uri: z.string(),
    }),
  ),
  available_markets: z.array(z.string()),
  external_urls: z.object({
    spotify: z.string(),
  }),
  href: z.string(),
  id: z.string(),
  images: z.array(
    z.object({
      height: z.number(),
      url: z.string(),
      width: z.number(),
    }),
  ),
  name: z.string(),
  release_date: z.string(),
  release_date_precision: z.string(),
  total_tracks: z.number(),
  type: z.string(),
  uri: z.string(),
  tracks: z.object({
    items: z.array(
      z.object({
        artists: z.array(
          z.object({
            external_urls: z.object({
              spotify: z.string(),
            }),
            href: z.string(),
            id: z.string(),
            name: z.string(),
            type: z.string(),
            uri: z.string(),
          }),
        ),
        available_markets: z.array(z.string()),
        disc_number: z.number(),
        duration_ms: z.number(),
        explicit: z.boolean(),
        external_urls: z.object({
          spotify: z.string(),
        }),
        href: z.string(),
        id: z.string(),
        name: z.string(),

        track_number: z.number(),
        type: z.string(),
        uri: z.string(),
      }),
    ),
  }),
});

export const spotifyRouter = createTRPCRouter({
  fetchAccessToken: publicProcedure.input(z.string()).query(async () => {
    const tokenEndpoint = "https://accounts.spotify.com/api/token";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
      },
      body: "grant_type=client_credentials",
    };

    // try {
    const response: Response = await fetch(tokenEndpoint, requestOptions);

    if (!response.ok) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not get fetch token 2",
      });
    }

    const data = (await response.json()) as {
      // id: number;
      // token: string;
      // expires_in: number;
      // created_at: number | null;
      // updated_at: number | null;
      access_token: string;
      token_type: string;
      expires_in: number;
    };
    // const data = (await response.json()) as TokenObject;
    return data;
    // }
    // catch (err) {
    //   console.log(err, "ERROR IN GET ACCESS TOKEN");
    // }
  }),

  checkAuth: publicProcedure.input(z.string()).query((input) => {
    if (input.input === process.env.LOGIN_PASSWORD) {
      return true;
    } else {
      return false;
    }
  }),

  searchAlbums: publicProcedure
    .input(z.object({ query: z.string(), accessToken: z.string() }))
    .query(async (input) => {
      const query = input.input.query;
      const accessToken = input.input.accessToken;
      //console.log(accessToken, "token IN SEARCH ALBUMS");
      const searchParamaters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      try {
        const response: Response = await fetch(
          "https://api.spotify.com/v1/search?q=" +
            query +
            "&type=album&limit=14",
          searchParamaters,
        );
        // return response.json();
        const data = (await response.json()) as SpotifySearchResponse;
        return data;
      } catch (err) {
        //console.log(err, "ERROR IN SEARCH ALBUMS");
      }
    }),

  getAlbumDetails: publicProcedure
    .input(z.object({ id: z.string(), accessToken: z.string() }))
    .query(async (input) => {
      const id = input.input.id;
      const accessToken = input.input.accessToken;

      const searchParamaters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      try {
        const response: Response = await fetch(
          "https://api.spotify.com/v1/albums/" + id,
          searchParamaters,
        );
        // return response.json();
        const data = (await response.json()) as SpotifyAlbum;
        // console.log(data, "DATA IN GET ALBUM DETAILS");
        const fullData = {
          album: data,
          formatted_runtime: getTotalDuration(data),
          formatted_release_date: formatDate(data.release_date),
        };
        return fullData;
      } catch (err) {
        // console.log(err, "ERROR IN GET ALBUM DETAILS");
      }
    }),

  getArtistImageFromSpotify: publicProcedure
    .input(z.object({ id: z.string(), accessToken: z.string() }))
    .query(async (input) => {
      const id = input.input.id;
      const accessToken = input.input.accessToken;

      const searchParamaters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      try {
        const response: Response = await fetch(
          "https://api.spotify.com/v1/artists/" + id,
          searchParamaters,
        );
        // return response.json();
        const data = (await response.json()) as SpotifyArtist;
        const image =
          data.images[2] === undefined
            ? data.images[1] === undefined
              ? data.images[0] === undefined
                ? null
                : data.images[0].url
              : data.images[1].url
            : data.images[2].url;
        return image;
      } catch (err) {
        //console.log(err, "ERROR IN GET ARTIST IMAGE FROM SPOTIFY");
      }
    }),

  createAlbumReview: publicProcedure
    .input(
      z.object({
        album: SpotifyAlbumSchema,
        best_song: z.string(),
        worst_song: z.string(),
        review_content: z.string(),
        scored_tracks: z.array(ScoredTrackSchema),
        formatted_runtime: z.string(),
        formatted_release_date: z.string(),
        access_token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let albumScore = 0;
      //* remove tracks that have a score of 0
      const filteredTracks = input.scored_tracks.filter(
        (track) => track.rating !== 0,
      );

      //* add up all the scores
      filteredTracks.forEach((track) => {
        albumScore += track.rating;
      });

      //console.log(albumScore, "ALBUM SCORE");
      const maxScore = filteredTracks.length * 10;
      //console.log(maxScore, "MAX SCORE");
      const percentageScore = (albumScore / maxScore) * 100;
      //console.log(percentageScore, "PERCENTAGE SCORE");
      //* round to 0 decimal places
      const roundedScore = Math.round(percentageScore);
      //console.log(roundedScore, "ROUNDED SCORE");

      //* See if artist already exists in database
      const foundArtist = await ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input.album.artists[0]!.id,
        },
        include: {
          albums: true,
        },
      });

      //console.log(input.album.artists[0]!.id, "input.album.artists[0]!.id");

      let artistData = null;
      let createdArtist = null;
      //* If artist doesn't exist, create it with data from spotify
      if (!foundArtist) {
        const accessToken = input.access_token;

        const searchParamaters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        };

        try {
          const response: Response = await fetch(
            input.album.artists[0]!.href,
            searchParamaters,
          );

          const data = (await response.json()) as SpotifyArtist;

          artistData = {
            name: data.name,
            spotify_id: data.id,
            image_urls: JSON.stringify(data.images),
            average_score: roundedScore,
            leaderboard_position: 0,
          };
        } catch (err) {
          //console.log(err, "ERROR IN GET ARTIST DETAILS");
        }
        if (artistData !== null) {
          try {
            createdArtist = await ctx.prisma.artist.create({
              data: artistData,
            });
          } catch (err) {
            //console.log(err, "ERROR IN CREATE ARTIST");
          }
        }
      } else {
        //console.log("ARTIST ALREADY EXISTS");
        //console.log(roundedScore, "ROUNDED SCORE");
        let newAverageScore = roundedScore;
        //console.log(newAverageScore, "newAverageScore in create 375");

        //console.log(foundArtist, "FOUND ARTIST");
        if (foundArtist) {
          //console.log(foundArtist?.albums, "FOUND ARTIST ALBUMS");
          for (const album of foundArtist?.albums) {
            newAverageScore += album.review_score!;
            //console.log(newAverageScore, "newAverageScore in create");
          }
          //console.log(newAverageScore, "newAverageScore in create");
          newAverageScore = newAverageScore / (foundArtist?.albums.length + 1);
          //console.log(
          //   newAverageScore,
          //   "/",
          //   foundArtist?.albums.length + 1,
          //   "=",
          //   newAverageScore / (foundArtist?.albums.length + 1),
          //   "newAverageScore in create",
          // );
        }

        await ctx.prisma.artist.update({
          where: {
            spotify_id: foundArtist.spotify_id,
          },
          data: {
            average_score: newAverageScore,
          },
        });

        //console.log(updatedArtist, "UPDATED ARTIST");
      }

      let finalArtist = null;
      if (foundArtist !== null) {
        finalArtist = foundArtist;
      } else if (createdArtist !== null) {
        finalArtist = createdArtist;
      }

      const date = new Date(input.album.release_date);
      const year = date.getFullYear();

      //console.log(input.best_song, "BEST SONG");

      const test = await ctx.prisma.reviewedAlbum.create({
        data: {
          artist: {
            connect: {
              id: finalArtist?.id,
            },
          },
          name: input.album.name,
          spotify_id: input.album.id,
          release_date: input.formatted_release_date,
          release_year: year,
          image_urls: JSON.stringify(input.album.images),
          scored_tracks: JSON.stringify(input.scored_tracks),
          best_song: input.best_song,
          worst_song: input.worst_song,
          runtime: input.formatted_runtime,
          review_content: input.review_content,
          review_score: roundedScore,
          review_date: new Date().toISOString(),
        },
      });

      //* Get all artists, sort them by average score and update their leaderboard position
      const allArtists = await ctx.prisma.artist.findMany({
        orderBy: {
          average_score: "desc",
        },
      });

      let leaderboardPosition = 1;
      for (const artist of allArtists) {
        await ctx.prisma.artist.update({
          where: {
            id: artist.id,
          },
          data: {
            leaderboard_position: leaderboardPosition,
          },
        });
        leaderboardPosition++;
      }

      return test;
    }),
  //'--------------------
  //* UPDATE ALBUM REVIEW
  //'--------------------
  updateAlbumReview: publicProcedure
    .input(
      z.object({
        album_spotify_id: z.string(),
        best_song: z.string(),
        worst_song: z.string(),
        review_content: z.string(),
        scored_tracks: z.array(ScoredTrackSchema),
        artist_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let albumScore = 0;
      //* remove tracks that have a score of 0
      const filteredTracks = input.scored_tracks.filter(
        (track) => track.rating !== 0,
      );

      //* add up all the scores
      filteredTracks.forEach((track) => {
        albumScore += track.rating;
      });

      //console.log(albumScore, "ALBUM SCORE");
      const maxScore = filteredTracks.length * 10;
      //console.log(maxScore, "MAX SCORE");
      const percentageScore = (albumScore / maxScore) * 100;
      //console.log(percentageScore, "PERCENTAGE SCORE");
      //* round to 0 decimal places
      const roundedScore = Math.round(percentageScore);
      //console.log(roundedScore, "ROUNDED SCORE");

      //* Get artist from database, and calculate new average score
      const foundArtist = await ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input.artist_id,
        },
        include: {
          albums: true,
        },
      });
      let newAverageScore = 0;

      //console.log(foundArtist, "FOUND ARTIST");

      if (foundArtist) {
        //console.log(foundArtist?.albums, "FOUND ARTIST ALBUMS");
        for (const album of foundArtist?.albums) {
          if (album.spotify_id === input.album_spotify_id) {
            newAverageScore += roundedScore;
          } else {
            newAverageScore += album.review_score!;
            //console.log(newAverageScore, "newAverageScore in update");
          }
        }
        newAverageScore = newAverageScore / foundArtist?.albums.length;
        // console.log(
        //   newAverageScore,
        //   "/",
        //   foundArtist?.albums.length,
        //   "=",
        //   newAverageScore / foundArtist?.albums.length,
        //   "newAverageScore in update",
        // );
      }

      await ctx.prisma.artist.update({
        where: {
          spotify_id: input.artist_id,
        },
        data: {
          average_score: newAverageScore,
        },
      });

      //console.log(updatedArtist, "UPDATED ARTIST");

      // const date = new Date(input.album.release_date);
      // const year = date.getFullYear();

      // console.log(input.best_song, "BEST SONG");

      const updatedAlbumReview = await ctx.prisma.reviewedAlbum.update({
        where: {
          spotify_id: input.album_spotify_id,
        },
        data: {
          artist: {
            connect: {
              id: foundArtist?.id,
            },
          },
          scored_tracks: JSON.stringify(input.scored_tracks),
          best_song: input.best_song,
          worst_song: input.worst_song,
          review_content: input.review_content,
          review_score: roundedScore,
        },
      });

      //* Get all artists, sort them by average score and update their leaderboard position
      const allArtists = await ctx.prisma.artist.findMany({
        orderBy: {
          average_score: "desc",
        },
      });

      let leaderboardPosition = 1;
      for (const artist of allArtists) {
        await ctx.prisma.artist.update({
          where: {
            id: artist.id,
          },
          data: {
            leaderboard_position: leaderboardPosition,
          },
        });
        leaderboardPosition++;
        //console.log(UA, "UA");
      }

      return updatedAlbumReview;
    }),

  //'--------------------
  //* DELETE ALBUM REVIEW
  //'--------------------
  //- Implement try/catch
  deleteAlbumReview: publicProcedure
    .input(
      z.object({
        album_spotify_id: z.string(),
        artist_spotify_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const date = new Date(input.album.release_date);
      // const year = date.getFullYear();

      // console.log(input.best_song, "BEST SONG");

      const deletedAlbumReview = await ctx.prisma.reviewedAlbum.delete({
        where: {
          spotify_id: input.album_spotify_id,
        },
      });

      //* Get artist from database, and calculate new average score
      const foundArtist = await ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input.artist_spotify_id,
        },
        include: {
          albums: true,
        },
      });
      let newAverageScore = 0;
      //* If the artist has no albums left after this one was deleted
      //* delete the artist from the database. otherwise, calculate the new average score.
      if (foundArtist) {
        if (foundArtist.albums.length === 0) {
          await ctx.prisma.artist.delete({
            where: {
              spotify_id: input.artist_spotify_id,
            },
          });
          //console.log(deletedArtist, "DELETED ARTIST");
        } else {
          for (const album of foundArtist?.albums) {
            newAverageScore += album.review_score!;
            //console.log(newAverageScore, "newAverageScore in delete");
          }
          newAverageScore = newAverageScore / foundArtist?.albums.length;
          //console.log(
          // newAverageScore,
          //   "/",
          //   foundArtist?.albums.length,
          //   "=",
          //   newAverageScore / foundArtist?.albums.length,
          //   "newAverageScore in delete",
          // );
          await ctx.prisma.artist.update({
            where: {
              spotify_id: input.artist_spotify_id,
            },
            data: {
              average_score: newAverageScore,
            },
          });

          //console.log(updatedArtist, "UPDATED ARTIST");
        }
      }

      //* Get all artists, sort them by average score and update their leaderboard position
      const allArtists = await ctx.prisma.artist.findMany({
        orderBy: {
          average_score: "desc",
        },
      });

      let leaderboardPosition = 1;
      for (const artist of allArtists) {
        await ctx.prisma.artist.update({
          where: {
            id: artist.id,
          },
          data: {
            leaderboard_position: leaderboardPosition,
          },
        });
        leaderboardPosition++;
      }

      return deletedAlbumReview;
    }),

  //* This returns all album reviews
  getAllReviews: publicProcedure.query(({ ctx }) => {
    const reviews = ctx.prisma.reviewedAlbum.findMany({
      include: {
        artist: true,
      },
      orderBy: {
        review_date: "desc",
      },
    });
    return reviews;
  }),

  //* This returns a specific album review by its spotify id
  getReviewById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    const review = ctx.prisma.reviewedAlbum.findUnique({
      where: {
        spotify_id: input,
      },
      include: {
        artist: true,
      },
    });
    return review;
  }),

  //* This returns all artists and their albums
  getAllArtists: publicProcedure.query(({ ctx }) => {
    const artists = ctx.prisma.artist.findMany({
      include: {
        albums: true,
      },
    });
    return artists;
  }),

  //* This returns a specific album review by its spotify id
  getArtistById: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    const artist = ctx.prisma.artist.findUnique({
      where: {
        spotify_id: input,
      },
      include: {
        albums: true,
      },
    });
    return artist as unknown as ReviewedArtist;
  }),

  //* This returns the image URLs for the top 4 artists on
  //* the leaderboard for display on the home page
  getTopFourArtists: publicProcedure.query(async ({ ctx }) => {
    const artists = await ctx.prisma.artist.findMany({
      orderBy: {
        average_score: "desc",
      },
      take: 4,
    });

    const imageUrls = [];
    for (const artist of artists) {
      const images = JSON.parse(artist.image_urls) as SpotifyImage[];
      imageUrls.push(images[0]!.url);
    }

    return imageUrls;
  }),

  //* Get an artist, compile their album tracks into one array and return it
  //* Used for the track tier list on the artist page
  getArtistTracks: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const artist = await ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input,
        },
        include: {
          albums: true,
        },
      });

      const tracks: { track: ReviewedTrack; album_name: string }[] = [];
      if (artist) {
        for (const album of artist.albums) {
          const albumTracks = JSON.parse(
            album.scored_tracks,
          ) as ReviewedTrack[];
          for (const track of albumTracks) {
            tracks.push({ track: track, album_name: album.name });
          }
        }
      }

      return tracks;
    }),
});

export const fetchAccessToken = async () => {
  const tokenEndpoint = "https://accounts.spotify.com/api/token";
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
    },
    body: "grant_type=client_credentials",
  };

  // try {
  const response: Response = await fetch(tokenEndpoint, requestOptions);

  if (!response.ok) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Could not get access token",
    });
  }

  const data = (await response.json()) as {
    id: number;
    token: string;
    expires_in: number;
    created_at: number | null;
    updated_at: number | null;
  };
  // const data = (await response.json()) as TokenObject;

  return data;
  // }
  // catch (err) {
  //   console.log(err, "ERROR IN GET ACCESS TOKEN");
  // }
};
