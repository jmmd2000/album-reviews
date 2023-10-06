import { SyncLoader } from "react-spinners";

export const Loader = () => {
  const possibleColors = [
    "#c026d3",
    "#7c3aed",
    "#2563eb",
    "#0891b2",
    "#059669",
    "#65a30d",
    "#ca8a04",
    "#ea580c",
    "#dc2626",
    "#64748b",
    "#475569",
  ];
  const color =
    possibleColors[Math.floor(Math.random() * possibleColors.length)];
  return <SyncLoader color={color} />;
};
