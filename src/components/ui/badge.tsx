import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]",
        secondary: "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]",
        success: "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]",
        warning: "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]",
        destructive: "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]",
        info: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]",
        premium: "bg-[#1E40AF] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

