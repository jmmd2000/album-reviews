import { RatingChipValues, RatingValue } from "~/types";

export const RatingCard = (props: {
  rating: RatingChipValues;
  form: "large" | "medium" | "small";
}) => {
  const { rating, form } = props;

  const sizeClassMap = {
    large: "h-14 w-28 text-lg",
    medium: "h-[50px] w-24 text-base",
    small: "h-10 w-20 text-sm",
  };

  const textSizeClassMap = {
    large: "text-xl",
    medium: "text-base",
    small: "text-base",
  };

  const colorClass = getColorClass(rating);
  const textColorClass = getTextColorClass(rating);

  const sizeClass = sizeClassMap[form];
  const textSizeClass = textSizeClassMap[form];

  return (
    <div
      className={
        "flex items-center justify-center rounded-md border-2 bg-opacity-40 " +
        colorClass +
        " " +
        sizeClass
      }
    >
      <h2 className={"font-semibold " + textColorClass + " " + textSizeClass}>
        {typeof rating === "number" ? getRatingString(rating) : rating}
      </h2>
    </div>
  );
};

export const RatingChip = (props: {
  ratingNumber: number;
  form: "small" | "label";
}) => {
  const { ratingNumber, form } = props;

  //! ugly
  //* This is where the number => string scores are defined
  let ratingString = "";
  if (ratingNumber >= 0 && ratingNumber <= 10) {
    ratingString = "Terrible";
  } else if (ratingNumber >= 11 && ratingNumber <= 20) {
    ratingString = "Awful";
  } else if (ratingNumber >= 21 && ratingNumber <= 30) {
    ratingString = "Bad";
  } else if (ratingNumber >= 31 && ratingNumber <= 40) {
    ratingString = "OK";
  } else if (ratingNumber >= 41 && ratingNumber <= 50) {
    ratingString = "Decent";
  } else if (ratingNumber >= 51 && ratingNumber <= 60) {
    ratingString = "Good";
  } else if (ratingNumber >= 61 && ratingNumber <= 70) {
    ratingString = "Great";
  } else if (ratingNumber >= 71 && ratingNumber <= 80) {
    ratingString = "Brilliant";
  } else if (ratingNumber >= 81 && ratingNumber <= 90) {
    ratingString = "Amazing";
  } else if (ratingNumber >= 91 && ratingNumber <= 100) {
    ratingString = "Perfect";
  }

  const sizeClassMap: Record<string, string> = {
    label: "h-12 w-16",
    small: "h-5 w-8 absolute bottom-0 right-0",
  };

  const textSizeClassMap: Record<string, string> = {
    label: "text-2xl",
    small: "text-xs",
  };

  const colorClass = getColorClass(ratingString);
  const textColorClass = getTextColorClass(ratingString);
  const sizeClass = sizeClassMap[form as keyof typeof sizeClassMap];
  const textSizeClass = textSizeClassMap[form as keyof typeof textSizeClassMap];

  // const labelPosition = form === "label" ? "" : "";

  return (
    // <div className={"flex flex-col items-center " + labelPosition}>
    <div className="flex flex-col items-center ">
      <div
        className={
          "flex items-center justify-center rounded-md border-2 bg-opacity-40 " +
          colorClass +
          " " +
          sizeClass
        }
      >
        <h2 className={"font-semibold " + textColorClass + " " + textSizeClass}>
          {ratingNumber}
        </h2>
      </div>
      {form === "label" && (
        <p className={"text-xl font-medium " + textColorClass}>
          {ratingString}
        </p>
      )}
    </div>
  );
};

function getColorClass(rating: string | number) {
  // console.log(rating);
  switch (rating) {
    case "Perfect":
    case 10:
      return "text-fuchsia-600 bg-fuchsia-600 border-fuchsia-600";
    case "Amazing":
    case 9:
      return "text-violet-600 bg-violet-600 border-violet-600";
    case "Brilliant":
    case 8:
      return "text-blue-600 bg-blue-600 border-blue-600";
    case "Great":
    case 7:
      return "text-cyan-600 bg-cyan-600 border-cyan-600";
    case "Good":
    case 6:
      return "text-emerald-600 bg-emerald-600 border-emerald-600";
    case "Decent":
    case 5:
      return "text-lime-600 bg-lime-600 border-lime-600";
    case "OK":
    case 4:
      return "text-yellow-600 bg-yellow-600 border-yellow-600";
    case "Bad":
    case 3:
      return "text-orange-600 bg-orange-600 border-orange-600";
    case "Awful":
    case 2:
      return "text-red-600 bg-red-600 border-red-600";
    case "Terrible":
    case 1:
      return "text-slate-600 bg-slate-600 border-slate-600";
    case "Non-song":
    case 0:
      return "text-slate-700 bg-slate-700 border-slate-700";
    case "Best":
      return "text-green-600 bg-green-600 border-green-600";
    case "Worst":
      return "text-red-600 bg-red-600 border-red-600";
  }
}

function getTextColorClass(rating: string | number) {
  // console.log(rating);
  switch (rating) {
    case "Perfect":
    case 10:
      return "text-fuchsia-600";
    case "Amazing":
    case 9:
      return "text-violet-600";
    case "Brilliant":
    case 8:
      return "text-blue-600";
    case "Great":
    case 7:
      return "text-cyan-600";
    case "Good":
    case 6:
      return "text-emerald-600";
    case "Decent":
    case 5:
      return "text-lime-600";
    case "OK":
    case 4:
      return "text-yellow-600";
    case "Bad":
    case 3:
      return "text-orange-600";
    case "Awful":
    case 2:
      return "text-red-600";
    case "Terrible":
    case 1:
      return "text-slate-600";
    case "Non-song":
    case 0:
      return "text-slate-700";
    case "Best":
      return "text-green-600";
    case "Worst":
      return "text-red-600";
  }
}

function getRatingString(rating: number) {
  switch (rating) {
    case 10:
      return "Perfect";
    case 9:
      return "Amazing";
    case 8:
      return "Brilliant";
    case 7:
      return "Great";
    case 6:
      return "Good";
    case 5:
      return "Decent";
    case 4:
      return "OK";
    case 3:
      return "Bad";
    case 2:
      return "Awful";
    case 1:
      return "Terrible";
    case 0:
      return "Non-song";
  }
}
