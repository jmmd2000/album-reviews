import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback } from "react";

export function useURLInteraction() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const createQueryStringWithMultipleValues = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.append(name, value);

      return params.toString();
    },
    [searchParams],
  );

  async function setNewPathname(queryString: string): Promise<void> {
    await router.push(`${pathname}?${queryString}`).then(() => {
      window.scrollTo(0, 0);
    });
  }

  const getSearchParams = useCallback(
    (key: string, defaultValue: string) => {
      const params = searchParams.get(key);
      if (params) {
        return params;
      } else {
        return defaultValue;
      }
    },
    [searchParams],
  );

  return {
    createQueryString,
    createQueryStringWithMultipleValues,
    setNewPathname,
    getSearchParams,
  };
}
