// import { start } from "repl";

export function formatDate(inputDate: string): string {
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
