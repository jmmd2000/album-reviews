import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { formatDate } from "~/helpers/dateFormat";
import { getTotalDuration } from "~/helpers/durationConversion";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type SpotifyAlbum,
  type SpotifyArtist,
  type SpotifySearchResponse,
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

  searchAlbums: publicProcedure
    .input(z.object({ query: z.string(), accessToken: z.string() }))
    .query(async (input) => {
      const query = input.input.query;
      const accessToken = input.input.accessToken;
      console.log(accessToken, "token IN SEARCH ALBUMS");
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
        console.log(err, "ERROR IN SEARCH ALBUMS");
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
        const fullData = {
          album: data,
          formatted_runtime: getTotalDuration(data),
          formatted_release_date: formatDate(data.release_date),
        };
        return fullData;
      } catch (err) {
        console.log(err, "ERROR IN GET ALBUM DETAILS");
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
        console.log(err, "ERROR IN GET ARTIST IMAGE FROM SPOTIFY");
      }
    }),

  // createAlbumReview: publicProcedure
  //   .input(
  //     z.object({
  //       title: z.string(),
  //       age: z.number(),
  //       country: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const test = await ctx.prisma.reviewedAlbum.create({
  //       data: {

  //       }
  //     });

  //     return test;
  //   }),

  getAll: publicProcedure.query(({ ctx }) => {
    const test = ctx.prisma.test.findMany();
    return test;
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
