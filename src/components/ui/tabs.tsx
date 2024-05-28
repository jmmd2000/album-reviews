import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "~/lib/utils";
import { cva } from "class-variance-authority";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex min-h-[50px] max-w-full flex-wrap items-center justify-center rounded-md border border-[#272727] bg-gray-700 bg-opacity-10 bg-clip-padding p-2 text-sm text-[#D2D2D3] shadow-lg dark:bg-zinc-800 dark:text-zinc-400 sm:p-3 sm:text-base md:inline-flex",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const colorClass = cva(
  [
    "data-[state=active]:bg-opacity-40",
    "data-[state=active]:rounded-md",
    "data-[state=active]:border-2",
  ],
  {
    variants: {
      rating: {
        10: [
          "data-[state=active]:text-fuchsia-600",
          "data-[state=active]:bg-fuchsia-600",
          "data-[state=active]:border-fuchsia-600",
        ],
        9: [
          "data-[state=active]:text-violet-600",
          "data-[state=active]:bg-violet-600",
          "data-[state=active]:border-violet-600",
        ],
        8: [
          "data-[state=active]:text-blue-600",
          "data-[state=active]:bg-blue-600",
          "data-[state=active]:border-blue-600",
        ],
        7: [
          "data-[state=active]:text-cyan-600",
          "data-[state=active]:bg-cyan-600",
          "data-[state=active]:border-cyan-600",
        ],
        6: [
          "data-[state=active]:text-emerald-600",
          "data-[state=active]:bg-emerald-600",
          "data-[state=active]:border-emerald-600",
        ],
        5: [
          "data-[state=active]:text-lime-600",
          "data-[state=active]:bg-lime-600",
          "data-[state=active]:border-lime-600",
        ],
        4: [
          "data-[state=active]:text-yellow-600",
          "data-[state=active]:bg-yellow-600",
          "data-[state=active]:border-yellow-600",
        ],
        3: [
          "data-[state=active]:text-orange-600",
          "data-[state=active]:bg-orange-600",
          "data-[state=active]:border-orange-600",
        ],
        2: [
          "data-[state=active]:text-red-600",
          "data-[state=active]:bg-red-600",
          "data-[state=active]:border-red-600",
        ],
        1: [
          "data-[state=active]:text-slate-600",
          "data-[state=active]:bg-slate-600",
          "data-[state=active]:border-slate-600",
        ],
        0: [
          "data-[state=active]:text-slate-700",
          "data-[state=active]:bg-slate-700",
          "data-[state=active]:border-slate-700",
        ],
      },
    },
  },
);

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    value?: string;
  }
>(({ className, value, ...props }, ref) => {
  // Determine the color class based on the value
  // const colorClass: string = value ? getColorClass(value) ?? "" : "";

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:data-[state=active]:bg-zinc-950 dark:data-[state=active]:text-zinc-50",
        colorClass({
          rating: value as unknown as
            | 0
            | 2
            | 1
            | 6
            | 3
            | 4
            | 10
            | 9
            | 8
            | 7
            | 5
            | null
            | undefined,
        }),
        className,
      )}
      {...props}
    />
  );
});

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
