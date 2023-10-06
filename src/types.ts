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
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface AlbumWithExtras {
  album: SpotifyAlbum;
  formatted_runtime: string;
  formatted_release_date: string;
}

export interface SpotifyTrack {
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
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: {
    height: number | null;
    url: string;
    width: number | null;
  }[];
  name: string;
  popularity: number;
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

// export interface TokenObject {
//   id: number;
//   token: string;
//   expires_in: number;
//   created_at: Date;
//   updated_At: Date;
// }
