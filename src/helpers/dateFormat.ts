// import { start } from "repl";

export function formatDate(inputDate: string): string {
  //* Some release dates from spotify are just the year, so we need to check for that
  if (inputDate.length < 5) {
    return inputDate;
  } else {
    // Parse the input date string into a Date object
    const dateParts = inputDate.split("-").map(Number);
    const [year, month, day] = dateParts;
    const parsedDate = new Date(year!, month! - 1, day);

    // Format the date using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedDate = formatter.format(parsedDate);

    // Extract day and add the appropriate suffix (e.g., "1st", "2nd", "3rd", "4th")
    const dayOfMonth = parsedDate.getDate();
    let daySuffix = "th";

    if (dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31) {
      daySuffix = "st";
    } else if (dayOfMonth === 2 || dayOfMonth === 22) {
      daySuffix = "nd";
    } else if (dayOfMonth === 3 || dayOfMonth === 23) {
      daySuffix = "rd";
    }

    return `${formattedDate.replace(
      `${dayOfMonth}`,
      `${dayOfMonth}${daySuffix}`,
    )}`;
  }
}

export function removeFeaturedArtist(title: string): string {
  let startIndex: number = title.indexOf("(f");
  startIndex = startIndex === -1 ? title.indexOf("(w") : startIndex;
  if (startIndex !== -1) {
    const endIndex: number = title.indexOf(")", startIndex);
    if (endIndex !== -1) {
      const before: string = title.slice(0, startIndex);
      const after: string = title.slice(endIndex + 1);
      return before + after;
    }
  }
  return title;
}

//* This is the base64 encoded version of the placeholder image
export const placeholderImage64 =
  "data:image/webp;base64,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";
