// This is how the data comes from the Spotify API
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
// This is an album that has not been reviewed, but has been bookmarked for later
export interface BookmarkedAlbum {
  id: number;
  spotify_id: string;
  name: string;
  artist: string;
  image_urls: string;
  release_year: string;
  release_date: string;
}

// This is a reviewed album
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

// This is the minimum data needed to display the above 3 types on an AlbumCard
export interface DisplayAlbum {
  spotify_id: string;
  artist_spotify_id: string;
  artist_name: string;
  name: string;
  release_year: number;
  image_urls: SpotifyImage[];
  review_score?: number;
  bookmarked?: boolean;
  scored_tracks?: string;
}

export interface ReviewedArtist {
  id: number;
  spotify_id: string;
  name: string;
  image_urls: string;
  leaderboard_position: number;
  albums: DisplayAlbum[];
  average_score: number;
  bonus_points: number;
  bonus_reason: string | null;
  total_score: number;
  image_updated_at: Date;
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
  | "Meh"
  | "OK"
  | "Bad"
  | "Awful"
  | "Terrible"
  | "Non-song";

export interface ImageRowData {
  id: number;
  name: string;
  imageUrl: string;
}

export interface Concert {
  id: number;
  artist: ReviewedArtist;
  artist_db_id: number;
  show_name: string;
  date: Date;
  city: string;
  venue: string;
  image_url: string;
  setlist: SetlistTrack[];
  support_artists: Array<ReviewedArtist | NonReviewedArtist>;
}

export interface NonReviewedArtist {
  spotify_id: string;
  name: string;
  image_urls: string;
}

export interface SetlistTrack {
  track_name: string;
  encore: boolean;
  track_info: string;
}

export type SpotifyCurrentlyPlaying = {
  timestamp: number;
  context: {
    external_urls: {
      spotify: string;
    };
    href: string;
    type: string;
    uri: string;
  };
  progress_ms: number;
  item: {
    album: {
      album_type: string;
      artists: SpotifyArtist[];
      available_markets: string[];
      external_urls: {
        spotify: string;
      };
      href: string;
      id: string;
      images: SpotifyImage[];
      name: string;
      release_date: string;
      release_date_precision: string;
      total_tracks: number;
      type: string;
      uri: string;
    };
    artists: SpotifyArtist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: {
      isrc: string;
    };
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string;
    track_number: number;
    type: string;
    uri: string;
  };
  currently_playing_type: string;
  actions: {
    disallows: {
      resuming: boolean;
    };
  };
  is_playing: boolean;
};

// export interface TokenObject {
//   id: number;
//   token: string;
//   expires_in: number;
//   created_at: Date;
//   updated_At: Date;
// }
