import {
  Zap,
  Wrench,
  Sparkles,
  GraduationCap,
  Settings,
  LayoutGrid,
  Hammer,
  Paintbrush,
  Truck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Wrench,
  Sparkles,
  GraduationCap,
  Settings,
  LayoutGrid,
  Hammer,
  Paintbrush,
  Truck,
  ShieldCheck,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = "h-5 w-5" }: CategoryIconProps) {
  const Icon = ICON_MAP[name] ?? LayoutGrid;
  return <Icon className={className} aria-hidden="true" />;
}

