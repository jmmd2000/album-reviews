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

// export interface AlbumReview {
//   id: number;
//   artist_db_id: string;
//   spotify_id: string;
//   artist: ReviewedArtist;
//   best_song: string;
//   worst_song: string;
//   name: string;
//   image_urls: string;
//   createdAt: Date;
//   review_score: number;
//   review_content: string;
//   review_date: string;
//   runtime: string;
//   formatted_runtime: string;
//   formatted_release_date: string;
// }

export interface AlbumReview {
  id: number;
  artist_db_id: number;
  spotify_id: string;
  artist: ReviewedArtist;
  best_song: string;
  worst_song: string;
  name: string;
  image_urls: string;
  createdAt: Date;
  review_score: number;
  review_content: string;
  review_date: string;
  runtime: string;
  release_date: string;
  release_year: number;
  scored_tracks: string;
}

export interface ReviewedArtist {
  id: number;
  spotify_id: string;
  name: string;
  image_urls: string;
  leaderboard_position: number;
  albums: AlbumReview[];
  average_score: number;
}

export interface ReviewedTrack {
  track_id: string;
  track_name: string;
  track_duration: number;
  track_artist: ReviewedTrackArtist[];
  album_id: string;
  rating: number;
}

export interface ReviewedTrackArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
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

export interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export type RatingChipValues = number | RatingValue | "Best" | "Worst";

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
