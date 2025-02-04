import { type RatingChipValues } from "~/types";
import { cva } from "class-variance-authority";

export const RatingCard = (props: {
  rating: RatingChipValues;
  form: "large" | "medium" | "small";
}) => {
  const { rating, form } = props;

  const cardContainer = cva(
    [
      "flex",
      "items-center",
      "justify-center",
      "rounded-md",
      "border-2",
      "bg-opacity-40",
    ],
    {
      variants: {
        size: {
          large: "h-14 w-28 text-lg",
          medium: "h-[50px] w-24 text-base",
          small: "h-[50px] w-20 text-xs",
        },
        color: {
          Perfect: "text-fuchsia-600 bg-fuchsia-600 border-fuchsia-600",
          Amazing: "text-violet-600 bg-violet-600 border-violet-600",
          Brilliant: "text-blue-600 bg-blue-600 border-blue-600",
          Great: "text-cyan-600 bg-cyan-600 border-cyan-600",
          Good: "text-emerald-600 bg-emerald-600 border-emerald-600",
          Meh: "text-lime-600 bg-lime-600 border-lime-600",
          OK: "text-yellow-600 bg-yellow-600 border-yellow-600",
          Bad: "text-orange-600 bg-orange-600 border-orange-600",
          Awful: "text-red-600 bg-red-600 border-red-600",
          Terrible: "text-slate-600 bg-slate-600 border-slate-600",
          "Non-song": "text-slate-700 bg-slate-700 border-slate-700",
          Best: "text-green-600 bg-green-600 border-green-600",
          Worst: "text-red-600 bg-red-600 border-red-600",
        },
      },
    },
  );

  const cardText = cva(["font-semibold"], {
    variants: {
      size: {
        large: "text-xl",
        medium: "text-base",
        small: "text-xs",
      },
      color: {
        Perfect: "text-fuchsia-600",
        Amazing: "text-violet-600",
        Brilliant: "text-blue-600",
        Great: "text-cyan-600",
        Good: "text-emerald-600",
        Meh: "text-lime-600",
        OK: "text-yellow-600",
        Bad: "text-orange-600",
        Awful: "text-red-600",
        Terrible: "text-slate-600",
        "Non-song": "text-slate-700",
        Best: "text-green-600",
        Worst: "text-red-600",
      },
    },
  });

  return (
    <div
      className={cardContainer({
        size: form,
        color: typeof rating === "number" ? getRatingString(rating) : rating,
      })}
    >
      <h2
        className={cardText({
          size: form,
          color: typeof rating === "number" ? getRatingString(rating) : rating,
        })}
      >
        {typeof rating === "number" ? getRatingString(rating) : rating}
      </h2>
    </div>
  );
};

export const RatingChip = (props: {
  ratingNumber: number;
  form: "small" | "label" | "extraSmall";
}) => {
  const { ratingNumber, form } = props;

  //! ugly
  //* This is where the number => string scores are defined
  let ratingString:
    | "Perfect"
    | "Amazing"
    | "Brilliant"
    | "Great"
    | "Good"
    | "Meh"
    | "OK"
    | "Bad"
    | "Awful"
    | "Terrible"
    | "Non-song"
    | "Best"
    | "Worst"
    | null
    | undefined;
  if (ratingNumber >= 0 && ratingNumber <= 10) {
    ratingString = "Terrible";
  } else if (ratingNumber >= 11 && ratingNumber <= 20) {
    ratingString = "Awful";
  } else if (ratingNumber >= 21 && ratingNumber <= 30) {
    ratingString = "Bad";
  } else if (ratingNumber >= 31 && ratingNumber <= 40) {
    ratingString = "OK";
  } else if (ratingNumber >= 41 && ratingNumber <= 50) {
    ratingString = "Meh";
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

  const chipContainer = cva(
    [
      "flex",
      "items-center",
      "justify-center",
      "rounded-md",
      "border-2",
      "bg-opacity-40",
    ],
    {
      variants: {
        size: {
          label: "h-12 w-16",
          small: "h-5 w-8",
          extraSmall: "h-4 w-6",
        },
        color: {
          Perfect: "text-fuchsia-600 bg-fuchsia-600 border-fuchsia-600",
          Amazing: "text-violet-600 bg-violet-600 border-violet-600",
          Brilliant: "text-blue-600 bg-blue-600 border-blue-600",
          Great: "text-cyan-600 bg-cyan-600 border-cyan-600",
          Good: "text-emerald-600 bg-emerald-600 border-emerald-600",
          Meh: "text-lime-600 bg-lime-600 border-lime-600",
          OK: "text-yellow-600 bg-yellow-600 border-yellow-600",
          Bad: "text-orange-600 bg-orange-600 border-orange-600",
          Awful: "text-red-600 bg-red-600 border-red-600",
          Terrible: "text-slate-600 bg-slate-600 border-slate-600",
          "Non-song": "text-slate-700 bg-slate-700 border-slate-700",
          Best: "text-green-600 bg-green-600 border-green-600",
          Worst: "text-red-600 bg-red-600 border-red-600",
        },
      },
    },
  );

  const chipText = cva(["font-semibold"], {
    variants: {
      size: {
        label: "text-2xl",
        small: "text-xs",
        extraSmall: "text-[10px]",
      },
      color: {
        Perfect: "text-fuchsia-600",
        Amazing: "text-violet-600",
        Brilliant: "text-blue-600",
        Great: "text-cyan-600",
        Good: "text-emerald-600",
        Meh: "text-lime-600",
        OK: "text-yellow-600",
        Bad: "text-orange-600",
        Awful: "text-red-600",
        Terrible: "text-slate-600",
        "Non-song": "text-slate-700",
        Best: "text-green-600",
        Worst: "text-red-600",
      },
    },
  });

  const labelTextColor = cva(["text-xl", "font-medium"], {
    variants: {
      color: {
        Perfect: "text-fuchsia-600",
        Amazing: "text-violet-600",
        Brilliant: "text-blue-600",
        Great: "text-cyan-600",
        Good: "text-emerald-600",
        Meh: "text-lime-600",
        OK: "text-yellow-600",
        Bad: "text-orange-600",
        Awful: "text-red-600",
        Terrible: "text-slate-600",
        "Non-song": "text-slate-700",
        Best: "text-green-600",
        Worst: "text-red-600",
      },
    },
  });

  return (
    <div className="flex flex-col items-center">
      <div
        className={chipContainer({
          size: form,
          color: ratingString,
        })}
      >
        <h2 className={chipText({ size: form, color: ratingString })}>
          {ratingNumber}
        </h2>
      </div>
      {form === "label" && (
        <p className={labelTextColor({ color: ratingString })}>
          {ratingString}
        </p>
      )}
    </div>
  );
};

export function getRatingString(rating: RatingChipValues) {
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
      return "Meh";
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
