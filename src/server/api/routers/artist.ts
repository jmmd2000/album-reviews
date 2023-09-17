import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const artistRouter = createTRPCRouter({
  /* hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.reviewedAlbum.findMany();
  }), */
  getByID: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input, ctx }) => {
      return ctx.db.artist.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.artist.findMany();
  }),
});
