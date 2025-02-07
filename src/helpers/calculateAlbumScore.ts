export function calculateAlbumScore(
  tracks: { trackID: string; rating: number }[],
): number {
  // console.log(tracks);
  let albumScore = 0;
  //* remove tracks that have a score of 0
  const filteredTracks = tracks.filter((track) => track.rating !== 0);

  //* add up all the scores
  filteredTracks.forEach((track) => {
    albumScore += track.rating;
  });

  const maxScore = filteredTracks.length * 10;
  const percentageScore = (albumScore / maxScore) * 100;
  //* round to 0 decimal places
  const roundedScore = Math.round(percentageScore);
  if (isNaN(roundedScore)) {
    return 0;
  } else {
    return roundedScore;
  }
}
