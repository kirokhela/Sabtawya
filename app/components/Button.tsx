"use client";

import clsx from "clsx";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        "w-full rounded-xl px-4 py-3 text-sm font-extrabold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "secondary" && "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        variant === "danger" && "bg-red-700 text-white hover:bg-red-600",
        className
      )}
    />
  );
}
