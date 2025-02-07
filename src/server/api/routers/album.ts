import { z } from "zod";
import type {
  AlbumReview,
  DisplayAlbum,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyCurrentlyPlaying,
  SpotifyImage,
} from "~/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type BookmarkedAlbum } from "@prisma/client";
import { env } from "~/env.mjs";
import { calculateArtistScore } from "./artist";

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

const SortValuesSchema = z
  .union([
    z.literal("all"),
    z.literal("album-az"),
    z.literal("album-za"),
    z.literal("score-asc"),
    z.literal("score-desc"),
    z.literal("year-asc"),
    z.literal("year-desc"),
  ])
  .or(z.null());

export const albumRouter = createTRPCRouter({
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
      //* remove tracks that have a score of 0, these are the "Non-song" tracks
      const filteredTracks = input.scored_tracks.filter(
        (track) => track.rating !== 0,
      );
      //* add up all the scores
      filteredTracks.forEach((track) => {
        albumScore += track.rating;
      });
      const maxScore = filteredTracks.length * 10;
      const percentageScore = (albumScore / maxScore) * 100;

      //* round to 0 decimal places
      const roundedScore = Math.round(percentageScore);

      //* See if artist already exists in database
      const foundArtist = await ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input.album.artists[0]!.id,
        },
        include: {
          albums: true,
        },
      });

      let artistData = null;
      let createdArtist = null;

      //* ---------------------------------------------------------
      //* If artist doesn't exist, create it with data from spotify
      //* ---------------------------------------------------------
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
          //! Need to handle this error
          console.error("Error fetching artist data from Spotify:", err);
          throw new Error("Failed to fetch artist data from Spotify");
        }
        //* If the data from spotify is valid, create the artist in the database
        if (artistData !== null) {
          try {
            createdArtist = await ctx.prisma.artist.create({
              data: artistData,
            });
          } catch (err) {
            //! Need to handle this error
            console.error("Error creating artist in database:", err);
            throw new Error("Failed to create artist in database");
          }
        }
      }
      //* ------------------------------------------
      //* if artist exists, update the average score
      //* ------------------------------------------
      if (foundArtist) {
        const { newAverageScore, newBonusPoints, totalScore, bonusReasons } =
          calculateArtistScore(
            foundArtist.albums as AlbumReview[],
            roundedScore,
          );

        console.log({
          newAverageScore,
          newBonusPoints,
          totalScore,
          bonusReasons,
        });

        await ctx.prisma.artist.update({
          where: {
            spotify_id: foundArtist.spotify_id,
          },
          data: {
            average_score: newAverageScore,
            bonus_points: newBonusPoints,
            total_score: totalScore,
            bonus_reason: JSON.stringify(bonusReasons),
          },
        });
      }

      //* Check if the album is bookmarked, if it is, remove it from bookmarks
      const bookmarkedAlbum = await ctx.prisma.bookmarkedAlbum.findUnique({
        where: {
          spotify_id: input.album.id,
        },
      });

      if (bookmarkedAlbum) {
        await ctx.prisma.bookmarkedAlbum.delete({
          where: {
            spotify_id: input.album.id,
          },
        });
      }

      //! could be handled better
      let finalArtist = null;
      if (foundArtist !== null) {
        finalArtist = foundArtist;
      } else if (createdArtist !== null) {
        finalArtist = createdArtist;
      }

      const date = new Date(input.album.release_date);
      const year = date.getFullYear();

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

      //* Get all artists, sort them by total score and update their leaderboard position
      const allArtists = await ctx.prisma.artist.findMany({
        orderBy: {
          total_score: "desc",
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

  //* This allows the user to get X number of albums based on a field
  getAlbumsByField: publicProcedure
    .input(z.object({ count: z.number(), field: z.string(), sort: z.string() }))
    .query(async ({ ctx, input }) => {
      const albums = await ctx.prisma.reviewedAlbum.findMany({
        orderBy: {
          [input.field]: input.sort,
        },
        take: input.count,
        include: {
          artist: true,
        },
      });

      const tempReviews = [...albums] as unknown as AlbumReview[];

      const displayAlbums: DisplayAlbum[] = tempReviews.map((album) => {
        const image_urls = JSON.parse(album.image_urls) as SpotifyImage[];

        return {
          spotify_id: album.spotify_id,
          artist_spotify_id: album.artist.spotify_id,
          artist_name: album.artist.name,
          name: album.name,
          release_year: album.release_year,
          image_urls: image_urls,
          review_score: album.review_score,
        };
      });

      // return displayAlbums;

      // const mappedAlbums: ImageRowData[] = [];
      // for (const album of albums) {
      //   const images = JSON.parse(album.image_urls) as SpotifyImage[];
      //   mappedAlbums.push({
      //     imageUrl: images[0]!.url,
      //     id: album.id,
      //     name: album.name,
      //   });
      // }

      return displayAlbums;
    }),

  //---------------------
  //* UPDATE ALBUM REVIEW
  //---------------------
  updateAlbumReview: publicProcedure
    .input(
      z.object({
        album_spotify_id: z.string(),
        best_song: z.string(),
        old_best_song: z.string().or(z.null()),
        worst_song: z.string(),
        old_worst_song: z.string(),
        review_content: z.string(),
        old_review_content: z.string(),
        scored_tracks: z.array(ScoredTrackSchema),
        old_scored_tracks: z.array(ScoredTrackSchema),
        artist_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // if the ratings have changed, update the album review with the newly calculated score
      if (
        !input.scored_tracks.every(
          (item, index) =>
            item.rating === input.old_scored_tracks[index]!.rating,
        )
      ) {
        let albumScore = 0;
        //* remove tracks that have a score of 0
        const filteredTracks = input.scored_tracks.filter(
          (track) => track.rating !== 0,
        );

        //* add up all the scores
        filteredTracks.forEach((track) => {
          albumScore += track.rating;
        });

        const maxScore = filteredTracks.length * 10;
        const percentageScore = (albumScore / maxScore) * 100;
        //* round to 0 decimal places
        const roundedScore = Math.round(percentageScore);

        //* Get artist from database, and calculate new average score and bonus points
        const foundArtist = await ctx.prisma.artist.findUnique({
          where: {
            spotify_id: input.artist_id,
          },
          include: {
            albums: true,
          },
        });

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
            review_score: roundedScore,
          },
        });

        const foundArtist2 = await ctx.prisma.artist.findUnique({
          where: {
            spotify_id: input.artist_id,
          },
          include: {
            albums: true,
          },
        });

        console.log(
          "------------------------------foundArtist--------------------------",
          foundArtist,
        );

        if (foundArtist2) {
          console.log(
            "------------------------------foundArtist dataaa--------------------------",
          );
          console.log(
            foundArtist2.total_score,
            foundArtist2.average_score,
            foundArtist2.bonus_points,
            foundArtist2.bonus_reason,
          );
          console.log(
            "------------------------------ end of foundArtist dataaa--------------------------",
          );
          const { newAverageScore, newBonusPoints, totalScore, bonusReasons } =
            calculateArtistScore(foundArtist2.albums as AlbumReview[], null);

          const currentTime = new Date().toLocaleTimeString();
          console.log({
            newAverageScore,
            newBonusPoints,
            totalScore,
            bonusReasons,
            currentTime,
          });
          console.log(
            "------------------------------updating artist--------------------------",
          );
          await ctx.prisma.artist
            .update({
              where: {
                spotify_id: input.artist_id,
              },
              data: {
                average_score: newAverageScore,
                bonus_points: newBonusPoints,
                total_score: totalScore,
                bonus_reason: JSON.stringify(bonusReasons),
              },
            })
            .then((res) => {
              console.log(
                "------------------------------updated artist complete--------------------------",
              );
              console.log({ res });
            })
            .catch((err) => {
              console.log(
                "------------------------------error updating artist--------------------------",
              );
              console.log(err);
            });
        }

        //* Get all artists, sort them by total score and update their leaderboard position
        const allArtists = await ctx.prisma.artist.findMany({
          orderBy: {
            total_score: "desc",
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

        return updatedAlbumReview;
      }
      // if the best song has changed, update the album review with the new best song
      if (input.best_song !== input.old_best_song) {
        await ctx.prisma.reviewedAlbum.update({
          where: {
            spotify_id: input.album_spotify_id,
          },
          data: {
            best_song: input.best_song,
          },
        });
      }

      // if the worst song has changed, update the album review with the new worst song
      if (input.worst_song !== input.old_worst_song) {
        await ctx.prisma.reviewedAlbum.update({
          where: {
            spotify_id: input.album_spotify_id,
          },
          data: {
            worst_song: input.worst_song,
          },
        });
      }

      // if the review content has changed, update the album review with the new review content
      if (input.review_content !== input.old_review_content) {
        await ctx.prisma.reviewedAlbum.update({
          where: {
            spotify_id: input.album_spotify_id,
          },
          data: {
            review_content: input.review_content,
          },
        });
      }
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

      //* If the artist has no albums left after this one was deleted
      //* delete the artist from the database. otherwise, calculate the new average score.
      //* Then remove any bonus points the album provided
      if (foundArtist) {
        if (foundArtist.albums.length === 0) {
          await ctx.prisma.artist.delete({
            where: {
              spotify_id: input.artist_spotify_id,
            },
          });
        } else {
          const { newAverageScore, newBonusPoints, totalScore, bonusReasons } =
            calculateArtistScore(foundArtist.albums as AlbumReview[], null);

          await ctx.prisma.artist.update({
            where: {
              spotify_id: input.artist_spotify_id,
            },
            data: {
              average_score: newAverageScore,
              bonus_points: newBonusPoints,
              total_score: totalScore,
              bonus_reason: JSON.stringify(bonusReasons),
            },
          });
        }
      }

      //* Get all artists, sort them by total score and update their leaderboard position
      const allArtists = await ctx.prisma.artist.findMany({
        orderBy: {
          total_score: "desc",
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
  getAllReviews: publicProcedure.query(async ({ ctx }) => {
    const reviews = ctx.prisma.reviewedAlbum.findMany({
      include: {
        artist: true,
      },
      orderBy: {
        review_date: "desc",
      },
    });

    const tempReviews = [...(await reviews)] as unknown as AlbumReview[];

    const displayAlbums: DisplayAlbum[] = tempReviews.map((album) => {
      const image_urls = JSON.parse(album.image_urls) as SpotifyImage[];

      return {
        spotify_id: album.spotify_id,
        artist_spotify_id: album.artist.spotify_id,
        artist_name: album.artist.name,
        name: album.name,
        release_year: album.release_year,
        image_urls: image_urls,
        review_score: album.review_score,
      };
    });

    return displayAlbums;
  }),

  getPaginatedReviews: publicProcedure
    .input(
      z.object({
        page: z.number(),
        limit: z.number(),
        sortValue: SortValuesSchema,
        searchTerm: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let options = {};
      let reviewCount = 0;

      const sortValue = input.sortValue;
      let orderBy = {};
      switch (sortValue) {
        case "all":
          orderBy = {
            review_date: "desc",
          };
          break;
        case "album-az":
          orderBy = {
            name: "asc",
          };
          break;
        case "album-za":
          orderBy = {
            name: "desc",
          };
          break;
        case "score-asc":
          orderBy = {
            review_score: "asc",
          };
          break;
        case "score-desc":
          orderBy = {
            review_score: "desc",
          };
          break;
        case "year-asc":
          orderBy = {
            release_year: "asc",
          };
          break;
        case "year-desc":
          orderBy = {
            release_year: "desc",
          };
          break;
        default:
          orderBy = {
            review_date: "desc",
          };
          break;
      }

      let where: {
        OR: Array<{
          name?: { contains: string };
          artist?: {
            name: { contains: string };
          };
          release_year?: number;
        }>;
      } = { OR: [] };

      if (
        input.searchTerm &&
        input.searchTerm !== undefined &&
        input.searchTerm.length > 0
      ) {
        const searchTermNumeric = parseInt(input.searchTerm);
        const isNumericSearch = !isNaN(searchTermNumeric);

        where = {
          OR: [
            { name: { contains: input.searchTerm } },
            {
              artist: {
                name: { contains: input.searchTerm },
              },
            },
          ],
        };

        if (isNumericSearch) {
          where.OR.push({
            release_year: searchTermNumeric,
          });
        }

        options = {
          include: {
            artist: true,
          },
          where,
          orderBy,
          skip: input.page * input.limit,
          take: input.limit,
        };
        reviewCount = await ctx.prisma.reviewedAlbum.count({ where });
      } else {
        options = {
          include: {
            artist: true,
          },
          orderBy,
          skip: input.page * input.limit,
          take: input.limit,
        };
        reviewCount = await ctx.prisma.reviewedAlbum.count();
      }

      const reviews = ctx.prisma.reviewedAlbum.findMany({
        ...options,
      });

      const tempReviews = [...(await reviews)] as unknown as AlbumReview[];

      const displayAlbums: DisplayAlbum[] = tempReviews.map((album) => {
        const image_urls = JSON.parse(album.image_urls) as SpotifyImage[];

        return {
          spotify_id: album.spotify_id,
          artist_spotify_id: album.artist.spotify_id,
          artist_name: album.artist.name,
          name: album.name,
          release_year: album.release_year,
          image_urls: image_urls,
          review_score: album.review_score,
        };
      });

      return {
        displayAlbums,
        totalReviews: reviewCount,
        totalPages: Math.ceil(reviewCount / input.limit),
      };
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

  toggleAlbumBookmark: publicProcedure
    .input(z.object({ id: z.string(), accessToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const id = input.id;
      const accessToken = input.accessToken;

      const album = await ctx.prisma.bookmarkedAlbum.findUnique({
        where: {
          spotify_id: id,
        },
      });

      if (!!album) {
        await ctx.prisma.bookmarkedAlbum.delete({
          where: {
            spotify_id: id,
          },
        });

        return {
          deleted: true,
          created: false,
        };
      } else {
        const searchParamaters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        };

        const response: Response = await fetch(
          "https://api.spotify.com/v1/albums/" + id,
          searchParamaters,
        );

        const data: SpotifyAlbum = (await response.json()) as SpotifyAlbum;

        const bookmarkedAlbum = await ctx.prisma.bookmarkedAlbum.create({
          data: {
            spotify_id: data.id,
            name: data.name,
            artist_name: data.artists[0]!.name,
            artist_spotify_id: data.artists[0]!.id,
            image_url: JSON.stringify(data.images),
            release_year: parseInt(data.release_date.slice(0, 4)),
            release_date: data.release_date,
          },
        });

        return {
          deleted: false,
          created: true,
          bookmarkedAlbum,
        };
      }
    }),

  getAllBookmarkedAlbums: publicProcedure.query(async ({ ctx }) => {
    const bookmarks = ctx.prisma.bookmarkedAlbum.findMany();
    // console.log(bookmarks);

    const tempBookmarks = [
      ...(await bookmarks),
    ] as unknown as BookmarkedAlbum[];
    // console.log(tempBookmarks);

    const displayAlbums: DisplayAlbum[] = tempBookmarks.map(
      // (album: DisplayAlbum) => {
      (album: BookmarkedAlbum) => {
        const image_urls = JSON.parse(album.image_url) as SpotifyImage[];
        // console.log(image_urls);

        return {
          spotify_id: album.spotify_id,
          artist_spotify_id: album.artist_spotify_id,
          artist_name: album.artist_name,
          name: album.name,
          release_year: album.release_year,
          image_urls: image_urls,
          bookmarked: true,
        };
      },
    );

    // console.log(displayAlbums);

    return displayAlbums;
  }),

  chooseRandomBookmarkedAlbum: publicProcedure.query(async ({ ctx }) => {
    const bookmarks = ctx.prisma.bookmarkedAlbum.findMany();
    const tempBookmarks = [
      ...(await bookmarks),
    ] as unknown as BookmarkedAlbum[];

    const randomIndex = Math.floor(Math.random() * tempBookmarks.length);
    const randomAlbum = tempBookmarks[randomIndex];

    //get all albums by the same artist from tempBookmarks
    const albumsByArtist = tempBookmarks.filter(
      (album) => album.artist_spotify_id === randomAlbum!.artist_spotify_id,
    );

    // sort by release date
    albumsByArtist.sort((a, b) => {
      return (
        parseInt(String(a.release_date)) - parseInt(String(b.release_date))
      );
    });

    const chosenAlbum = albumsByArtist[0]!;

    const image_urls = JSON.parse(chosenAlbum.image_url) as SpotifyImage[];

    return {
      spotify_id: chosenAlbum.spotify_id,
      artist_spotify_id: chosenAlbum.artist_spotify_id,
      artist_name: chosenAlbum.artist_name,
      name: chosenAlbum.name,
      release_year: chosenAlbum.release_year,
      image_urls: image_urls,
      bookmarked: true,
    };
  }),

  checkIfAlbumIsBookmarked: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const album = await ctx.prisma.bookmarkedAlbum.findUnique({
        where: {
          spotify_id: input,
        },
      });

      return !!album;
    }),

  getCurrentlyPlaying: publicProcedure.query(async () => {
    // Function to refresh the Spotify access token
    async function refreshAccessToken(): Promise<string> {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: env.SPOTIFY_REFRESH_TOKEN,
          client_id: env.SPOTIFY_CLIENT_ID,
          client_secret: env.SPOTIFY_CLIENT_SECRET,
        }).toString(),
      });

      const data = (await response.json()) as {
        access_token: string;
        token_type: string;
        expires_in: number;
      };
      return data.access_token;
    }

    // Use the refresh token to get a new access token
    const accessToken = await refreshAccessToken();

    const searchParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Correctly format the Authorization header
      },
    };

    try {
      const response: Response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        searchParameters,
      );
      if (!response.ok) {
        console.error(
          "Error fetching currently playing track1:",
          response.statusText,
        );
      } else {
        const data = (await response.json()) as SpotifyCurrentlyPlaying;

        let durationString;
        let durationMinutes = Math.floor(data.item.duration_ms / 60000);
        // format the duration to be in the format of 3:30
        durationMinutes = Math.floor(durationMinutes);
        const durationSeconds = Math.floor(
          (data.item.duration_ms % 60000) / 1000,
        );

        if (durationSeconds < 10) {
          durationString = durationMinutes + ":0" + durationSeconds;
        } else {
          durationString = durationMinutes + ":" + durationSeconds;
        }

        return {
          name: data.item.name,
          artist: data.item?.artists[0]?.name,
          image: data.item.album.images[2]?.url,
          durationString,
          durationMS: data.item.duration_ms,
          durationElapsed: data.progress_ms,
          currentlyPlaying: data.is_playing,
        };
      }
    } catch (error) {
      console.error("Error fetching currently playing track2:", error);
    }
  }),
});
