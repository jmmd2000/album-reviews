import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SpotifySearchResponse } from "~/types";

const prisma = new PrismaClient();

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
            "&type=album&limit=18",
          searchParamaters,
        );
        // return response.json();
        const data = (await response.json()) as SpotifySearchResponse;
        return data;
      } catch (err) {
        console.log(err, "ERROR IN SEARCH ALBUMS");
      }
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.reviewedAlbum.findMany();
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
