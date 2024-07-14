/* eslint-disable @next/next/no-img-element */
import { api } from "~/utils/api";
import { Loader } from "~/components/Loader";
import { type DisplayAlbum } from "~/types";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { AlbumGrid } from "./new";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

export default function AlbumsPage() {
  const [reviews, setReviews] = useState<DisplayAlbum[]>([]);
  const [displayType, setDisplayType] = useState<"grid" | "scroller">("grid");

  const {
    data: albumReviews,
    isLoading,
    isSuccess,
    isError,
  } = api.album.getAllReviews.useQuery();

  useEffect(() => {
    if (isSuccess) {
      setReviews(albumReviews);
      console.log(albumReviews);
    }

    if (isError) {
      toast.error("Error fetching albums.", {
        progressStyle: {
          backgroundColor: "#DC2626",
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isError]);

  if (isLoading) {
    return (
      <div className="mx-auto mt-20 flex h-10 w-20 items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <h2 className="m-16 text-xl text-[#D2D2D3]">Error fetching albums ☹️</h2>
    );
  }

  return (
    <>
      <Head>
        <title>Albums</title>
      </Head>
      <div className="m-2 xl:m-10">
        {/* Not happy with this feature yet, add 'lg:flex' to re-enable */}
        <div className="mb-4 hidden items-center space-x-2">
          <Switch
            id="displayToggle"
            checked={displayType == "grid"}
            onCheckedChange={() =>
              setDisplayType(displayType == "grid" ? "scroller" : "grid")
            }
          />
          <Label htmlFor="displayToggle" className="text-[#D2D2D3]">
            Toggle grid view
          </Label>
        </div>
        {reviews ? (
          displayType === "grid" ? (
            <AlbumGrid albums={reviews} controls />
          ) : (
            <AlbumScroller albums={reviews} />
          )
        ) : (
          <h2 className="m-16 text-xl text-[#D2D2D3]">
            No albums have been reviewed yet ☹️
          </h2>
        )}
        <ToastContainer
          toastStyle={{
            // same as bg-gray-700 bg-opacity-10
            background: "rgba(55, 65, 81, 0.1)",
            color: "#D2D2D3",
            borderRadius: "0.375rem",
            backdropFilter: "blur(10px)",
          }}
          progressStyle={{
            borderRadius: "0.375rem",
          }}
          position="top-right"
        />
      </div>
    </>
  );
}

interface AlbumScrollerProps {
  albums: DisplayAlbum[];
}

const AlbumScroller = ({ albums }: AlbumScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedAlbum, setFocusedAlbum] = useState<number | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY * 2.5; // Adjusted for better control
    }
    if (e.deltaY > 0) {
      setFocusedAlbum(null);
      setHoveredIndex(null);
    }
    if (e.deltaY < 0) {
      setFocusedAlbum(null);
      setHoveredIndex(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scrollRef.current) {
        if (e.key === "ArrowLeft") {
          if (focusedAlbum !== null && focusedAlbum > 0) {
            handleAlbumClick(focusedAlbum - 1);
          }
        } else if (e.key === "ArrowRight") {
          if (focusedAlbum !== null && focusedAlbum < albums.length - 1) {
            handleAlbumClick(focusedAlbum + 1);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [albums.length, focusedAlbum]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [albums]);

  const handleAlbumClick = (index: number) => {
    if (scrollRef.current) {
      const albumElement = scrollRef.current.children[index] as HTMLElement;
      scrollToCenterElement(scrollRef.current, albumElement);
      setFocusedAlbum(index);
    }
  };

  return (
    <div
      ref={scrollRef}
      onWheel={handleWheel}
      className="flex h-[700px] w-full flex-col items-center overflow-x-auto whitespace-nowrap pl-[700px] outline-red-400 md:flex-row"
    >
      <div className="left-10 z-[200] hidden w-[80vw] rounded-md border border-[#272727] bg-gray-800 bg-opacity-20 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-md sm:block md:absolute xl:h-[60vh] xl:w-[25vw]">
        <h1 className="text-2xl">
          {focusedAlbum !== null && albums[focusedAlbum]?.name}
        </h1>
      </div>

      <div className="absolute left-10 z-[200] w-[80vw] rounded-md border border-[#272727] bg-gray-800 bg-opacity-20 bg-clip-padding p-3 text-base text-[#D2D2D3] shadow-lg backdrop-blur-md sm:hidden xl:h-[60vh] xl:w-[25vw]">
        small
      </div>
      {albums.map((album, index) => (
        <img
          src={album.image_urls[0]?.url}
          alt={album.name}
          key={album.spotify_id}
          className="relative -ml-56 max-h-[15rem] max-w-[15rem] skew-y-6 transform rounded shadow-lg shadow-black transition-transform duration-500 ease-in-out animate-in first:ml-56 first:opacity-0 last:mr-0 hover:-translate-y-8 hover:scale-105 hover:shadow-2xl first:hover:ml-56 lg:max-h-[30rem] lg:max-w-[30rem]"
          style={{
            // If the album is focused or hovered, bring it to the front, the details card is z-index 200, otherwise, the z-index is the index of the album in the array
            zIndex:
              focusedAlbum !== null && index === focusedAlbum
                ? 199
                : hoveredIndex !== null && index == hoveredIndex
                ? 199
                : albums.length - index,
            // marginBottom:
            //   focusedAlbum !== null && index === focusedAlbum ? 70 : 0,
            filter:
              focusedAlbum !== null && index !== focusedAlbum
                ? hoveredIndex !== null && index == hoveredIndex
                  ? "none"
                  : "blur(5px)"
                : "none",

            // focusedAlbum !== null && index !== focusedAlbum
            //   ? "blur(5px)"
            //   : hoveredIndex !== null && index !== hoveredIndex
            //   ? "blur(5px)"
            //   : "none",
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => {
            handleAlbumClick(index);
          }}
          onClick={() => handleAlbumClick(index)}
          tabIndex={0}
        />
      ))}
    </div>
  );
};

function scrollToCenterElement(
  container: HTMLElement,
  element: HTMLElement,
): void {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // Calculate the center position of the element in relation to the viewport
  const elementCenter = elementRect.left + elementRect.width / 2;

  // Calculate the center of the container
  const containerCenter = containerRect.left + containerRect.width / 2 - 400;

  // The new scroll position is the current scroll left plus the difference between the element center and the container center
  const newScrollLeft =
    container.scrollLeft + (elementCenter - containerCenter);
  container.scrollLeft = newScrollLeft;
}
