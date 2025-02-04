import { albumRouter } from "~/server/api/routers/album";
import { createTRPCRouter } from "~/server/api/trpc";
import { artistRouter } from "./routers/artist";
import { spotifyRouter } from "./routers/spotify";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  album: albumRouter,
  artist: artistRouter,
  spotify: spotifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
