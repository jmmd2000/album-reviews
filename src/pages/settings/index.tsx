import { api } from "~/utils/api";
import { Loader } from "~/components/Loader";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { useTokenContext } from "~/context/TokenContext";
import { cva } from "class-variance-authority";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { RuleForm } from "~/components/forms/ruleForm";

export default function SettingsPage() {
  const [loadingUpdateImages, setLoadingUpdateImages] = useState(false);
  const { token } = useTokenContext();
  const {
    mutate: updateArtistImages,
    // isLoading,
    // isSuccess,
    // isError,
  } = api.artist.updateArtistImages.useMutation();

  const {
    mutate: updateArtistScores,
    isLoading,
    isSuccess,
    isError,
  } = api.artist.recalculateArtistScores.useMutation();

  const handleUpdateImages = () => {
    setLoadingUpdateImages(true);
    try {
      updateArtistImages(token);
      toast.success("Artist images updated successfully");
    } catch (error) {
      toast.error("Failed to update artist images");
    } finally {
      setLoadingUpdateImages(false);
    }
  };

  const handleRecalculateScores = () => {
    try {
      updateArtistScores();
      toast.success("Artist scores recalculated successfully");
    } catch (error) {
      toast.error("Failed to recalculate artist scores");
    }
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      {/* <div className="m-2 flex h-[80vh] divide-x divide-zinc-700 xl:m-10">
        <div className="bg-zinc-900 p-5 text-zinc-200 sm:p-10 lg:p-20">
          <p>Update artist images</p>
          <p>Update artist images</p>
        </div>
        <div className="flex flex-col gap-4 bg-zinc-900 p-5 text-zinc-200 sm:p-10 lg:p-20">
          <button
            className=" w-24 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600 xl:w-24 xl:text-base"
            onClick={handleUpdateImages}
          >
            {loadingUpdateImages ? <Loader /> : "Update"}
          </button>
          <button
            className=" w-24 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600 xl:w-24 xl:text-base"
            onClick={handleUpdateImages}
          >
            {loadingUpdateImages ? <Loader /> : "Update"}
          </button>
        </div>
      </div> */}
      <div className="container mx-auto py-8">
        <h1 className="mb-6 border-b border-[#d2d2d3a8] pb-2 text-3xl font-bold text-zinc-200">
          Settings
        </h1>
        {/* // Update artist images */}
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 rounded-lg p-4 shadow sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-zinc-200">
                Update artist images
              </h3>
              <p className="text-sm text-[#d2d2d3a8]">
                Cycle through all of the artists and update their images from
                Spotify.
              </p>
            </div>
            <div className="flex items-center">
              <button
                className="w-24 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600 xl:w-24 xl:text-base"
                onClick={handleUpdateImages}
              >
                {loadingUpdateImages ? <Loader /> : "Update"}
              </button>
            </div>
          </div>
        </div>
        {/* Recalculate scores */}
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 rounded-lg p-4 shadow sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-zinc-200">
                Recalculate artist scores
              </h3>
              <p className=" text-sm text-[#d2d2d3a8]">
                Recalculate the scores of all artists.
              </p>
            </div>
            {/* <div className="flex items-center gap-2">
              <select
                className="h-[50px] w-[50%] rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition sm:w-[30%] md:w-36 xl:text-base"
                onChange={(e) => {
                  // sortAlbums(e.target.value as SortValues).catch((error) => {
                  //   console.error("Error sorting albums:", error);
                  // });
                }}
                // value={sortKey ?? "all"}
              >
                <option
                  value="default"
                  className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
                >
                  Default average
                </option>
                <option
                  value="cumulative"
                  className="bg-zinc-900 bg-opacity-90 backdrop-blur-sm"
                >
                  Cumulative
                </option>
              </select> */}

            <button
              className=" flex w-24 justify-center rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600 xl:w-24 xl:text-base"
              onClick={handleRecalculateScores}
            >
              {isLoading ? <Loader size={24} /> : "Update"}
            </button>
            {/* </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
