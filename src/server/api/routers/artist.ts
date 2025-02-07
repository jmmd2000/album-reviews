import { z } from "zod";
import {
  type SpotifyImage,
  type ReviewedArtist,
  type ReviewedTrack,
  type DisplayAlbum,
  type AlbumReview,
  type SpotifyArtist,
  type Reason,
  type MinimalAlbum,
} from "~/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const GOOD_ALBUM_BONUS = 0.25;
const BAD_ALBUM_BONUS = 0.25;

export const artistRouter = createTRPCRouter({
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
  getArtistById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const artist = ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input,
        },
        include: {
          albums: true,
        },
      });

      const tempArtist = (await artist) as unknown as ReviewedArtist;
      const tempArtistAlbums = tempArtist.albums as unknown as AlbumReview[];

      const displayAlbums: DisplayAlbum[] = tempArtistAlbums.map((album) => {
        const image_urls = JSON.parse(album.image_urls) as SpotifyImage[];
        return {
          spotify_id: album.spotify_id,
          artist_spotify_id: input,
          artist_name: tempArtist.name,
          name: album.name,
          release_year: album.release_year,
          image_urls: image_urls,
          review_score: album.review_score,
          scored_tracks: album.scored_tracks,
        };
      });

      // console.log("displayAlbums", displayAlbums);

      return {
        id: tempArtist?.id,
        spotify_id: tempArtist?.spotify_id,
        name: tempArtist?.name,
        image_urls: tempArtist?.image_urls,
        leaderboard_position: tempArtist?.leaderboard_position,
        albums: displayAlbums,
        total_score: tempArtist?.total_score,
        average_score: tempArtist?.average_score,
        bonus_points: tempArtist?.bonus_points,
        bonus_reason: tempArtist?.bonus_reason,
      };
    }),

  //* This returns the image URLs for the top X artists on
  //* the leaderboard for display on the home page
  getTopArtists: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const artists = await ctx.prisma.artist.findMany({
        orderBy: {
          total_score: "desc",
        },
        take: input,
        include: {
          albums: true,
        },
      });

      // const topArtists: ImageRowData[] = [];
      // for (const artist of artists) {
      //   const images = JSON.parse(artist.image_urls) as SpotifyImage[];
      //   topArtists.push({
      //     imageUrl: images[0]!.url,
      //     id: artist.id,
      //     name: artist.name,
      //   });
      // }

      return artists;
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
  getArtistAlbums: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const albums = await ctx.prisma.reviewedAlbum.findMany({
        where: {
          artist: {
            spotify_id: input,
          },
        },
        // include: {
        //   artist: true,
        // },
      });
      return albums as AlbumReview[];
    }),
  updateArtistImages: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const token = input;

      try {
        const artists = await ctx.prisma.artist.findMany();

        for (const artist of artists) {
          try {
            // console.log(artist.name, artist);
            const response = await fetch(
              `https://api.spotify.com/v1/artists/${artist.spotify_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );

            if (!response.ok) {
              console.error(
                `Failed to fetch Spotify data for artist ID ${artist.spotify_id}`,
              );
              continue; // Skip to the next artist if the current one fails
            }

            const spotifyArtist = (await response.json()) as SpotifyArtist;
            const newImageURLsString = JSON.stringify(spotifyArtist.images);

            // Compare and update image data if different
            if (artist.image_urls !== newImageURLsString) {
              try {
                await ctx.prisma.artist.update({
                  where: { id: artist.id },
                  data: { image_urls: newImageURLsString },
                });
              } catch (dbError) {
                console.error(
                  `Database error while updating artist ID ${
                    artist.id
                  }: ${String(dbError)}`,
                );
              }
            }
          } catch (fetchError) {
            console.error(
              `Error fetching or parsing data for artist ID ${
                artist.spotify_id
              }: ${String(fetchError)}`,
            );
          }
        }
      } catch (error) {
        console.error(
          `Unexpected error in updateArtistImages procedure: ${String(error)}`,
        );
        return false;
      }

      // console.log(`Artist images updated successfully!!!!! ${Date.now()}`);
      return true;
    }),
  recalculateArtistScores: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const artists = await ctx.prisma.artist.findMany({
        include: {
          albums: true,
        },
        orderBy: {
          total_score: "desc",
        },
      });

      for (const artist of artists) {
        const albums = artist.albums as AlbumReview[];
        const { newAverageScore, newBonusPoints, totalScore, bonusReasons } =
          calculateArtistScore(albums, null);

        await ctx.prisma.artist.update({
          where: { id: artist.id },
          data: {
            average_score: newAverageScore,
            bonus_points: newBonusPoints,
            total_score: totalScore,
            bonus_reason: JSON.stringify(bonusReasons),
          },
        });
      }

      let leaderboardPosition = 1;
      for (const artist of artists) {
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
    } catch (error) {
      console.error(`Error recalculating artist scores: ${String(error)}`);
      return false;
    }

    // console.log(`Artist scores recalculated successfully!!!!! ${Date.now()}`);
    return true;
  }),
});

// -------------------- //
// - HELPER FUNCTIONS - //
// -------------------- //

//? This function takes an array of albums and calculates the artist's score.
//? If this is called while adding a new album, the array of albums doesn't include the new album yet, so it needs to be accounted for.
//* albums: AlbumReview[] - An array of albums to calculate the score for
//* existingScore: number | null - In the case that this is being called while adding a new album, this is the artist's current score
export const calculateArtistScore = (
  albums: AlbumReview[],
  existingScore: number | null,
) => {
  let newAverageScore = existingScore ?? 0;
  let newBonusPoints = 0;

  for (const album of albums) {
    newAverageScore += album.review_score;
  }

  const bonusReasons: Reason[] = [];

  if (albums.length > 2) {
    //* Calculate bonus points only for every album after the first 2
    //* Also generate the bonus reasons
    // const albumsToConsider = albums.slice(2);
    console.log(
      "--------------------------Starting on albums ---------------------------------",
    );
    for (const album of albums) {
      console.log(album.name);
      const image_urls = JSON.parse(album.image_urls) as SpotifyImage[];
      const minimalAlbum: MinimalAlbum = {
        id: album.id,
        spotify_id: album.spotify_id,
        name: album.name,
        image_urls: image_urls,
      };
      if (album.review_score < 45) {
        console.log("Low quality album");
        newBonusPoints -= BAD_ALBUM_BONUS;
        bonusReasons.push({
          album: minimalAlbum,
          reason: "Low quality album",
          value: -BAD_ALBUM_BONUS,
        });
      } else if (album.review_score > 55) {
        console.log("High quality album");
        newBonusPoints += GOOD_ALBUM_BONUS;
        bonusReasons.push({
          album: minimalAlbum,
          reason: "High quality album",
          value: GOOD_ALBUM_BONUS,
        });
      }
    }
    console.log(
      "--------------------------Finished on albums ---------------------------------",
    );
    console.log({ newBonusPoints, bonusReasons });
  }

  //* If this is being called while adding a new album, the array of albums doesn't include the new album yet
  if (existingScore) {
    newAverageScore = newAverageScore / (albums.length + 1);
  } else {
    newAverageScore = newAverageScore / albums.length;
  }

  //* Calculate the total score
  let totalScore = newAverageScore + newBonusPoints;
  if (totalScore > 100) {
    totalScore = 100;
  }
  console.log({ newAverageScore, newBonusPoints, totalScore, bonusReasons });
  console.log(
    "--------------------------recalculationcomplete ---------------------------------",
  );

  return { newAverageScore, newBonusPoints, totalScore, bonusReasons };
};
