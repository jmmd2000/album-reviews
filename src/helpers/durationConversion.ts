import { type SpotifyAlbum } from "../types";

export function formatDuration(durationMs: number, form: string): string {
  if (form === "short") {
    const minutes = Math.floor(durationMs / 60000); // 1 minute = 60000 milliseconds
    const seconds = Math.floor((durationMs % 60000) / 1000); // Remaining seconds

    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${minutes}:${formattedSeconds}`;
  } else if (form === "long") {
    const minutes = Math.floor(durationMs / 60000); // 1 minute = 60000 milliseconds
    const seconds = Math.floor((durationMs % 60000) / 1000); // Remaining seconds

    const minuteText = minutes > 1 ? "minutes" : "minute";
    const secondText = seconds > 1 ? "seconds" : "second";

    if (minutes > 0 && seconds > 0) {
      return `${minutes} ${minuteText} ${seconds} ${secondText}`;
    } else if (minutes > 0) {
      return `${minutes} ${minuteText}`;
    } else {
      return `${seconds} ${secondText}`;
    }
  } else {
    throw new Error('Invalid form parameter. Use "long" or "short".');
  }
}

export function getTotalDuration(album: SpotifyAlbum): string {
  const totalDurationMs = album.tracks.items.reduce(
    (acc, track) => acc + track.duration_ms,
    0,
  );
  return formatDuration(totalDurationMs, "long");
}
