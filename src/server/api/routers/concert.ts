import { z } from "zod";
import {
  type SpotifyImage,
  type ReviewedArtist,
  type ReviewedTrack,
  type DisplayAlbum,
  type AlbumReview,
  type SpotifyArtist,
} from "~/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const concertRouter = createTRPCRouter({
  //* This returns all concerts
  getAllConcerts: publicProcedure.query(({ ctx }) => {
    const concerts = ctx.prisma.concert.findMany();
    return concerts;
  }),
});
