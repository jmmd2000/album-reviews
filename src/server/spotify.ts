import { env } from "~/env.mjs";

export async function getAccessToken() {
  let accessToken = null;

  // const authString = `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`;
  /* const encodedAuthString = btoa(authString); */
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

  const response = await fetch(tokenEndpoint, requestOptions);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  accessToken = data.access_token;
  // setAccessToken(accessToken);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return accessToken;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// const token = await getAccessToken();
//console.log(token, "TOKOOOOAKSOAKOASKOASKOAKS");
