import { api } from "~/utils/api";
import { Loader } from "~/components/Loader";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import { useTokenContext } from "~/context/TokenContext";

export default function SettingsPage() {
  const [loadingUpdateImages, setLoadingUpdateImages] = useState(false);
  const { token } = useTokenContext();
  const {
    mutate: updateArtistImages,
    // isLoading,
    // isSuccess,
    // isError,
  } = api.artist.updateArtistImages.useMutation();

  const handleUpdateImages = () => {
    setLoadingUpdateImages(true);
    try {
      updateArtistImages(token); // Remove the 'await' keyword
      toast.success("Artist images updated successfully");
    } catch (error) {
      toast.error("Failed to update artist images");
    } finally {
      setLoadingUpdateImages(false);
    }
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <div className="m-2 flex h-[80vh] divide-x divide-zinc-700 xl:m-10">
        <div className="bg-zinc-900 p-5 text-zinc-200 sm:p-10 lg:p-20">
          <p>Update artist images</p>
        </div>
        <div className="bg-zinc-900 p-5 text-zinc-200 sm:p-10 lg:p-20">
          <button
            className=" w-24 rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-3 text-sm text-[#d2d2d3a8] shadow-lg backdrop-blur-sm transition hover:bg-gray-600 xl:w-24 xl:text-base"
            onClick={handleUpdateImages}
          >
            {loadingUpdateImages ? <Loader /> : "Update"}
          </button>
        </div>
      </div>
    </>
  );
}
