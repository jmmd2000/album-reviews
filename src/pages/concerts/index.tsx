/* eslint-disable @next/next/no-img-element */
import { Link } from "lucide-react";
import Head from "next/head";

const concerts = [
  {
    id: 1,
    show_name: "Twelve Carat Tour",
    artist: {
      name: "Post Malone",
      image_url:
        "https://i.scdn.co/image/ab67616100005174e17c0aa1714a03d62b5ce4e0",
      spotify_id: "1234",
    },
    date: "12 December 2022",
    city: "Dublin",
    venue: "3Arena",
    image_url:
      "https://img.resized.co/beat102103/eyJkYXRhIjoie1widXJsXCI6XCJodHRwczpcXFwvXFxcL2ltZy5iZWF0MTAyMTAzLmNvbVxcXC9wcm9kXFxcL3VwbG9hZHNcXFwvUG9zdC1NYWxvbmUucG5nXCIsXCJ3aWR0aFwiOjc5NSxcImhlaWdodFwiOjU5NixcImRlZmF1bHRcIjpcImh0dHBzOlxcXC9cXFwvZXUtY2VudHJhbC0xLmxpbm9kZW9iamVjdHMuY29tXFxcL3BwbHVzLmltZy5iZWF0MTAyMTAzLmNvbVxcXC9wcm9kXFxcL3VwbG9hZHNcXFwvQmVhdC1Oby1JbWFnZS5wbmdcIixcIm9wdGlvbnNcIjp7XCJvdXRwdXRcIjpcImpwZWdcIn19IiwiaGFzaCI6IjYyNjI2NjI2YTJhZDNkOGQyYzViYTA4MTY3NDAwZDc3NjE4Y2Y4ZDkifQ==/post-malone-announces-irish-date-for-twelve-carat-tour.png",
    setlist: [
      {
        track_name: "Rockstar",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "Circles",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "Sunflower",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "Congratulations",
        encore: true,
        track_info: "This is a song",
      },
    ],
    support_artists: [
      {
        name: "Artist 121312",
        image_urls: "https://via.placeholder.com/150",
        spotify_id: "1234",
      },
      {
        name: "Artist 1231232",
        image_urls: "https://via.placeholder.com/150",
        spotify_id: "1234",
      },
    ],
  },
  {
    id: 2,
    show_name: "The End of the Road Tour",
    artist: {
      name: "KISS",
      image_url: "https://via.placeholder.com/150",
      spotify_id: "1234",
    },
    date: "2022-12-12",
    city: "Dublin",
    venue: "3Arena",
    image_url: "https://via.placeholder.com/150",
    setlist: [
      {
        track_name: "Rock and Roll All Nite",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "Detroit Rock City",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "I Was Made for Lovin' You",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "God Gave Rock 'n' Roll to You II",
        encore: true,
        track_info: "This is a song",
      },
    ],
    support_artists: [
      {
        name: "Artist 1",
        image_urls: "https://via.placeholder.com/150",
        spotify_id: "1234",
      },
      {
        name: "Artist 2",
        image_urls: "https://via.placeholder.com/150",
        spotify_id: "1234",
      },
    ],
  },
  {
    id: 3,
    show_name: "The End of the Road Tour",
    artist: {
      name: "KISS",
      image_url: "https://via.placeholder.com/150",
      spotify_id: "1234",
    },
    date: "2022-12-12",
    city: "Dublin",
    venue: "3Arena",
    image_url: "https://via.placeholder.com/150",
    setlist: [
      {
        track_name: "Rock and Roll All Nite",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "Detroit Rock City",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "I Was Made for Lovin' You",
        encore: false,
        track_info: "This is a song",
      },
      {
        track_name: "God Gave Rock 'n' Roll to You II",
        encore: true,
        track_info: "This is a song",
      },
    ],
    support_artists: [
      {
        name: "Artist 1",
        image_urls: "https://via.placeholder.com/150",
        spotify_id: "1234",
      },
      {
        name: "Artist 2",
        image_urls: "https://via.placeholder.com/150",
        spotify_id: "1234",
      },
    ],
  },
];

export default function ConcertsPage() {
  // const [concerts, setConcerts] = useState<DisplayAlbum[]>([]);

  // const {
  //   data: albumReviews,
  //   isLoading,
  //   isSuccess,
  //   isError,
  // } = api.album.getAllReviews.useQuery();

  // useEffect(() => {
  //   if (isSuccess) {
  //     setConcerts(albumReviews);
  //     console.log(albumReviews);
  //   }

  //   if (isError) {
  //     toast.error("Error fetching albums.", {
  //       progressStyle: {
  //         backgroundColor: "#DC2626",
  //       },
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSuccess, isError]);

  return (
    <>
      <Head>
        <title>Concerts</title>
      </Head>
      <div className="m-2 xl:m-10">
        <h1 className="text-2xl font-medium text-white sm:text-3xl">
          Concerts
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {concerts.map((concert, index) => (
            <ConcertCard concert={concert} key={index} />
          ))}
        </div>
      </div>
    </>
  );
}

export const ConcertCard = (props: { concert: Concert }) => {
  const { concert } = props;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-sm">
      <img
        src={concert.image_url}
        alt={concert.artist.name}
        className="h-48 w-full rounded-md object-cover"
      />
      <h1 className="text-xl font-medium text-white">{concert.show_name}</h1>
      <div className="flex items-center gap-2">
        <img
          src={concert.artist.image_url}
          alt={concert.artist.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <h2 className="text-lg font-medium text-white">
          {concert.artist.name}
        </h2>
      </div>
      <div className="flex gap-1 text-sm text-gray-500">
        <p>
          {concert.venue}, {concert.city}
        </p>
        <p>-</p>
        <p>{concert.date}</p>
      </div>
      <div className="ml-2 flex justify-start gap-4">
        {concert.support_artists.map((artist, index) => (
          <div key={index} className="flex items-center gap-2">
            <img
              src={artist.image_urls}
              alt={artist.name}
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="text-sm text-gray-400">{artist.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 hover:text-gray-500 hover:underline">
        <Link size={20} />
        <a href="#">Setlist</a>
      </div>
    </div>
  );
};

type Concert = {
  id: number;
  show_name: string;
  artist: {
    name: string;
    image_url: string;
    spotify_id: string;
  };
  date: string;
  city: string;
  venue: string;
  image_url: string;
  setlist: Array<{
    track_name: string;
    encore: boolean;
    track_info: string;
  }>;
  support_artists: Array<{
    name: string;
    image_urls: string;
    spotify_id: string;
  }>;
};
