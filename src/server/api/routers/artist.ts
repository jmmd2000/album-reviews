import { z } from "zod";
import {
  type SpotifyImage,
  type ReviewedArtist,
  type ReviewedTrack,
  type DisplayAlbum,
  type AlbumReview,
} from "~/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
        console.log("album", album);
        const image_urls = JSON.parse(album.image_urls) as SpotifyImage[];
        return {
          spotify_id: album.spotify_id,
          artist_spotify_id: input,
          artist_name: tempArtist.name,
          name: album.name,
          release_year: album.release_year,
          image_url: image_urls[1]!.url,
          review_score: album.review_score,
          scored_tracks: album.scored_tracks,
        };
      });

      console.log("displayAlbums", displayAlbums);

      return {
        id: tempArtist?.id,
        spotify_id: tempArtist?.spotify_id,
        name: tempArtist?.name,
        image_urls: tempArtist?.image_urls,
        leaderboard_position: tempArtist?.leaderboard_position,
        albums: displayAlbums,
        average_score: tempArtist?.average_score,
      };
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
  getArtistAlbums: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const albums = await ctx.prisma.reviewedAlbum.findMany({
        where: {
          artist: {
            spotify_id: input,
          },
        },
        include: {
          artist: true,
        },
      });

      return albums as AlbumReview[];
    }),
});
