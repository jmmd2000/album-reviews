import { ReviewedAlbum } from "@prisma/client";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { RouterOutputs, api } from "~/utils/api";

export default function Home() {
  const albumData = api.album.getAll.useQuery();
  const album = albumData.data;
  /* const imageURL = console.log(albumData); */

  return <>{album?.map((album) => <AlbumCard {...album} key={album.id} />)}</>;
}

type AlbumReview = RouterOutputs["album"]["getAll"][number];
const AlbumCard = (props: AlbumReview) => {
  const { id, name, artist_id, image_urls } = props;
  const artistData = api.artist.getByID.useQuery({ id: artist_id });
  const artist = artistData.data;
  console.log(artistData);
  return (
    <div>
      <p>{name}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image_urls} alt="Album cover" className="h-24 w-24" />
      <p>{artist?.name}</p>
    </div>
  );
};
