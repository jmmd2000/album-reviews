import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { formatDate } from "~/helpers/dateFormat";
import { getTotalDuration } from "~/helpers/durationConversion";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type SpotifyImage,
  type SpotifyAlbum,
  type SpotifyArtist,
  type SpotifySearchResponse,
  // type ReviewedArtist,
  type DisplayAlbum,
} from "~/types";

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

    const response: Response = await fetch(tokenEndpoint, requestOptions);

    if (!response.ok) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Could not get fetch token 2",
      });
    }

    const data = (await response.json()) as {
      access_token: string;
      token_type: string;
      expires_in: number;
    };
    return data;
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
    .query(async ({ ctx, input }) => {
      const query = input.query;
      const accessToken = input.accessToken;

      const reviewedAlbums = await ctx.prisma.reviewedAlbum.findMany();
      const bookmarkedAlbums = await ctx.prisma.bookmarkedAlbum.findMany();

      const searchParamaters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      const response: Response = await fetch(
        "https://api.spotify.com/v1/search?q=" + query + "&type=album&limit=14",
        searchParamaters,
      );
      const data = (await response.json()) as SpotifySearchResponse;
      // const filteredAlbums = data.albums.items.filter(
      //   (album) =>
      //     album.album_type === "album" || album.album_type === "compilation",
      // );

      const displayAlbums: DisplayAlbum[] = data.albums.items.map((album) => {
        const reviewedAlbum = reviewedAlbums.find(
          (reviewed) => reviewed.spotify_id === album.id,
        );
        const bookmarkedAlbum = bookmarkedAlbums.find(
          (bookmarked) => bookmarked.spotify_id === album.id,
        );

        return {
          spotify_id: album.id,
          artist_spotify_id: album.artists[0]!.id,
          artist_name: album.artists[0]!.name,
          name: album.name,
          release_year: parseInt(album.release_date.slice(0, 4)),
          image_urls: album.images,
          review_score: reviewedAlbum?.review_score ?? undefined,
          bookmarked: !!bookmarkedAlbum,
        };
      });

      return displayAlbums;
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

      const response: Response = await fetch(
        "https://api.spotify.com/v1/albums/" + id,
        searchParamaters,
      );

      const data = (await response.json()) as SpotifyAlbum;

      const fullData = {
        album: data,
        formatted_runtime: getTotalDuration(data),
        formatted_release_date: formatDate(data.release_date),
      };
      return fullData;
    }),

  //* Checks to see if the artist is in the database, if they are, take the image from there.
  //* If they're not, get the image from Spotify.
  getArtistImage: publicProcedure
    .input(z.object({ id: z.string(), accessToken: z.string() }))
    .query(async ({ ctx, input }) => {
      const artist = await ctx.prisma.artist.findUnique({
        where: {
          spotify_id: input.id,
        },
      });

      if (artist) {
        const images = JSON.parse(artist.image_urls) as SpotifyImage[];
        const image =
          images[2] === undefined
            ? images[1] === undefined
              ? images[0] === undefined
                ? null
                : images[0].url
              : images[1].url
            : images[2].url;
        return {
          image,
          fromSpotify: false,
        };
      } else {
        const searchParamaters = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + input.accessToken,
          },
        };

        const response: Response = await fetch(
          "https://api.spotify.com/v1/artists/" + input.id,
          searchParamaters,
        );
        const data = (await response.json()) as SpotifyArtist;
        const image =
          data.images[2] === undefined
            ? data.images[1] === undefined
              ? data.images[0] === undefined
                ? null
                : data.images[0].url
              : data.images[1].url
            : data.images[2].url;
        return {
          image,
          fromSpotify: true,
        };
      }
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

  return data;
};
