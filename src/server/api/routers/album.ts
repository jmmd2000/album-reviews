import { z } from "zod";
import type {
  AlbumReview,
  DisplayAlbum,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyImage,
} from "~/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type BookmarkedAlbum } from "@prisma/client";

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
          //! Need to handle this error
        }
        if (artistData !== null) {
          try {
            createdArtist = await ctx.prisma.artist.create({
              data: artistData,
            });
          } catch (err) {
            //! Need to handle this error
          }
        }
      } else {
        let newAverageScore = roundedScore;

        if (foundArtist) {
          for (const album of foundArtist?.albums) {
            newAverageScore += album.review_score!;
          }
          newAverageScore = newAverageScore / (foundArtist?.albums.length + 1);
        }

        await ctx.prisma.artist.update({
          where: {
            spotify_id: foundArtist.spotify_id,
          },
          data: {
            average_score: newAverageScore,
          },
        });
      }

      // Check if the album is bookmarked, if it is, remove it from bookmarks
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

        if (foundArtist) {
          for (const album of foundArtist?.albums) {
            if (album.spotify_id === input.album_spotify_id) {
              newAverageScore += roundedScore;
            } else {
              newAverageScore += album.review_score!;
            }
          }
          newAverageScore = newAverageScore / foundArtist?.albums.length;
        }

        await ctx.prisma.artist.update({
          where: {
            spotify_id: input.artist_id,
          },
          data: {
            average_score: newAverageScore,
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
        } else {
          for (const album of foundArtist?.albums) {
            newAverageScore += album.review_score!;
          }
          newAverageScore = newAverageScore / foundArtist?.albums.length;

          await ctx.prisma.artist.update({
            where: {
              spotify_id: input.artist_spotify_id,
            },
            data: {
              average_score: newAverageScore,
            },
          });
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
        image_url: image_urls[1]!.url,
        review_score: album.review_score,
      };
    });

    return displayAlbums;
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
    console.log(bookmarks);

    const tempBookmarks = [
      ...(await bookmarks),
    ] as unknown as BookmarkedAlbum[];
    console.log(tempBookmarks);

    const displayAlbums: DisplayAlbum[] = tempBookmarks.map(
      (album: DisplayAlbum) => {
        const image_urls = JSON.parse(album.image_url) as SpotifyImage[];
        // console.log(image_urls);

        return {
          spotify_id: album.spotify_id,
          artist_spotify_id: album.artist_spotify_id,
          artist_name: album.artist_name,
          name: album.name,
          release_year: album.release_year,
          image_url: image_urls[1]!.url,
          bookmarked: true,
        };
      },
    );

    console.log(displayAlbums);

    return displayAlbums;
  }),
  // This returns a random album from the
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
      image_url: image_urls[1]!.url,
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
});
