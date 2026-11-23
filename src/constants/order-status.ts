import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Күтуде",
  NEGOTIATING: "Келіссөз жүруде",
  AGREED: "Келісілді",
  IN_PROGRESS: "Орындалуда",
  COMPLETED: "Аяқталды",
  CANCELLED: "Бас тартылды",
  REJECTED: "Қабылданбады",
};

export const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning" | "destructive" | "info"
> = {
  PENDING: "warning",
  NEGOTIATING: "info",
  AGREED: "default",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "secondary",
  REJECTED: "destructive",
};

