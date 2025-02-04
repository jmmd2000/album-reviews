//* This uses the Intersection Observer API to determine if the component is in the viewport before rendering it.
//* This is useful for performance optimization, especially when rendering a large number of components.

import React, { useEffect, useRef, useState } from "react";

interface VisibilityObserverProps {
  children: (isVisible: boolean) => React.ReactNode;
}

export const VisibilityObserver = (props: VisibilityObserverProps) => {
  const { children } = props;
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Check if entries are present and use the first entry
        if (entries[0]) {
          setIsVisible(entries[0].isIntersecting);
        }
      },
      {
        rootMargin: "100px", // Adjust according to needs
      },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerRef.current);
      }
    };
  }, []);

  return <div ref={observerRef}>{children(isVisible)}</div>;
};
