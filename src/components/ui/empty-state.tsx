import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-[#CBD5E1] bg-white px-6 py-12",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-[#64748B]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

