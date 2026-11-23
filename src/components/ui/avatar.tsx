import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover border border-[#E2E8F0] shrink-0",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-full bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] font-semibold flex items-center justify-center shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {initials || "QT"}
    </div>
  );
}

