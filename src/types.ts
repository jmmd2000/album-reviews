export interface SpotifyAlbum {
  album_type: string;
  artists: {
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
  }[];
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: {
    height: number;
    url: string;
    width: number;
  }[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

export interface SpotifySearchResponse {
  albums: {
    href: string;
    items: SpotifyAlbum[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
  };
}

// export interface TokenObject {
//   id: number;
//   token: string;
//   expires_in: number;
//   created_at: Date;
//   updated_At: Date;
// }

// export interface RatingValue {
//   ratingString:
//     | "Perfect"
//     | "Amazing"
//     | "Brilliant"
//     | "Great"
//     | "Good"
//     | "Decent"
//     | "OK"
//     | "Bad"
//     | "Awful"
//     | "Terrible"
//     | "Non-song";
// }
export type RatingValue =
  | "Perfect"
  | "Amazing"
  | "Brilliant"
  | "Great"
  | "Good"
  | "Decent"
  | "OK"
  | "Bad"
  | "Awful"
  | "Terrible"
  | "Non-song";
