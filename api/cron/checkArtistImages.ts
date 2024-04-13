import { type VercelRequest, type VercelResponse } from "@vercel/node";
import { PrismaClient } from "@prisma/client";
import { type SpotifyArtist } from "~/types";

// Create a new Prisma client instance
const prisma = new PrismaClient();

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Fetch the Spotify access token
async function fetchSpotifyAccessToken(): Promise<string> {
  const tokenEndpoint = "https://accounts.spotify.com/api/token";
  const credentials = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: "grant_type=client_credentials",
  };

  const response = await fetch(tokenEndpoint, requestOptions);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Spotify access token, status code: ${response.status}`,
    );
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  return data.access_token;
}

// Function to update artist images
export default async function updateArtistImages(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    // Fetch the Spotify access token
    const accessToken = await fetchSpotifyAccessToken();

    // Fetch all artists from the db
    const artists = await prisma.artist.findMany();

    for (const artist of artists) {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artist.spotify_id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch Spotify data for artist ID ${artist.spotify_id}`,
        );
        // Skip to the next artist if the current one fails
        continue;
      }

      const spotifyArtist = (await response.json()) as SpotifyArtist;
      const newImageURLsString = JSON.stringify(spotifyArtist.images);

      // Compare and update image data if different
      if (artist.image_urls !== newImageURLsString) {
        await prisma.artist.update({
          where: { id: artist.id },
          data: { image_urls: newImageURLsString },
        });
      }
    }

    console.log(`Artist images updated successfully!!!!! ${Date.now()}`);

    // Send a successful response back to Vercel
    res.status(200).send("Artist images updated successfully");
  } catch (error) {
    console.error("Error in cron job:", error);
    res.status(500).send("Error executing cron job");
  } finally {
    await prisma.$disconnect();
  }
}
