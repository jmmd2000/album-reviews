/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Loader } from "./Loader";

const ResponsiveImage = (props: {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader />
        </div>
      )}
      <img
        src={props.src}
        alt={props.alt}
        className={props.className}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};

export default ResponsiveImage;
