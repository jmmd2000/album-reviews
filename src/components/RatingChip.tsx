import { RatingValue } from "~/types";

export const RatingCard = (props: {
  ratingString: RatingValue | "Best" | "Worst";
  form: "large" | "medium" | "small";
}) => {
  const { ratingString, form } = props;

  const ratingClassMap = {
    Perfect: "text-fuschia-600 bg-fuchsia-600 border-fuchsia-600",
    Amazing: "text-violet-600 bg-violet-600 border-violet-600",
    Brilliant: "text-blue-600 bg-blue-600 border-blue-600",
    Great: "text-cyan-600 bg-cyan-600 border-cyan-600",
    Good: "text-emerald-600 bg-emerald-600 border-emerald-600",
    Decent: "text-lime-600 bg-lime-600 border-lime-600",
    OK: "text-yellow-600 bg-yellow-600 border-yellow-600",
    Bad: "text-orange-600 bg-orange-600 border-orange-600",
    Awful: "text-red-600 bg-red-600 border-red-600",
    Terrible: "text-slate-600 bg-slate-600 border-slate-600",
    "Non-song": "text-slate-700 bg-slate-700 border-slate-700",
    Best: "text-green-600 bg-green-600 border-green-600",
    Worst: "text-red-600 bg-red-600 border-red-600",
  };

  const textColorClassMap = {
    Perfect: "text-fuchsia-600",
    Amazing: "text-violet-600",
    Brilliant: "text-blue-600",
    Great: "text-cyan-600",
    Good: "text-emerald-600",
    Decent: "text-lime-600",
    OK: "text-yellow-600",
    Bad: "text-orange-600",
    Awful: "text-red-600",
    Terrible: "text-slate-600",
    "Non-song": "text-slate-700",
    Best: "text-green-600",
    Worst: "text-red-600",
  };

  const sizeClassMap = {
    large: "h-14 w-28 text-lg",
    medium: "h-[50px] w-24 text-base",
    small: "h-10 w-20 text-sm",
  };

  const textSizeClassMap = {
    large: "text-lg",
    medium: "text-base",
    small: "text-base",
  };

  const colorClass = ratingClassMap[ratingString];
  const textColorClass = textColorClassMap[ratingString];
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
      <h2
        className={
          "text-lg font-semibold " + textColorClass + " " + textSizeClass
        }
      >
        {props.ratingString}
      </h2>
    </div>
  );
};

export const RatingChip = (props: {
  ratingNumber: number;
  form: "small" | "label";
}) => {
  const { ratingNumber, form } = props;

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

  const ratingClassMap: Record<string, string> = {
    Perfect: "text-fuschia-600 bg-fuchsia-600 border-fuchsia-600",
    Amazing: "text-violet-600 bg-violet-600 border-violet-600",
    Brilliant: "text-blue-600 bg-blue-600 border-blue-600",
    Great: "text-cyan-600 bg-cyan-600 border-cyan-600",
    Good: "text-emerald-600 bg-emerald-600 border-emerald-600",
    Decent: "text-lime-600 bg-lime-600 border-lime-600",
    OK: "text-yellow-600 bg-yellow-600 border-yellow-600",
    Bad: "text-orange-600 bg-orange-600 border-orange-600",
    Awful: "text-red-600 bg-red-600 border-red-600",
    Terrible: "text-slate-600 bg-slate-600 border-slate-600",
  };

  const textColorClassMap: Record<string, string> = {
    Perfect: "text-fuchsia-600",
    Amazing: "text-violet-600",
    Brilliant: "text-blue-600",
    Great: "text-cyan-600",
    Good: "text-emerald-600",
    Decent: "text-lime-600",
    OK: "text-yellow-600",
    Bad: "text-orange-600",
    Awful: "text-red-600",
    Terrible: "text-slate-600",
  };

  const colorClass = ratingClassMap[ratingString];
  const textColorClass = textColorClassMap[ratingString];
  const sizeClass = sizeClassMap[form as keyof typeof sizeClassMap];
  const textSizeClass = textSizeClassMap[form as keyof typeof textSizeClassMap];

  const labelPosition = form === "label" ? "absolute top-0 right-0" : "";

  return (
    <div className={"flex flex-col items-center " + labelPosition}>
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
