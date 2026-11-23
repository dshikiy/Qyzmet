import type { OrderStatus, UserRole } from "@prisma/client";

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["NEGOTIATING", "REJECTED", "CANCELLED"],
  NEGOTIATING: ["AGREED", "CANCELLED", "REJECTED"],
  AGREED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus
): boolean {
  return ALLOWED_ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canUserPerformOrderAction(params: {
  role: UserRole;
  isCustomer: boolean;
  isProvider: boolean;
  currentStatus: OrderStatus;
  targetStatus: OrderStatus;
  bothConfirmed?: boolean;
}): { allowed: boolean; reason?: string } {
  const { role, isCustomer, isProvider, currentStatus, targetStatus, bothConfirmed } = params;

  if (!canTransitionOrder(currentStatus, targetStatus)) {
    return {
      allowed: false,
      reason: `Күйді ${currentStatus} -> ${targetStatus} ауыстыру мүмкін емес.`,
    };
  }

  if (role === "ADMIN") {
    return { allowed: true };
  }

  if (!isCustomer && !isProvider) {
    return { allowed: false, reason: "Бұл тапсырысқа рұқсатыңыз жоқ." };
  }

  switch (targetStatus) {
    case "NEGOTIATING":
      if (!isProvider) {
        return { allowed: false, reason: "Тек маман өтінімді қабылдай алады." };
      }
      return { allowed: true };

    case "REJECTED":
      if (!isProvider) {
        return { allowed: false, reason: "Тек маман өтінімді қабылдамауы мүмкін." };
      }
      return { allowed: true };

    case "CANCELLED":
      if (!isCustomer && !isProvider) {
        return { allowed: false, reason: "Тапсырыстан бас тартуға рұқсат жоқ." };
      }
      return { allowed: true };

    case "AGREED":
      if (!bothConfirmed) {
        return {
          allowed: false,
          reason: "Келісімге келу үшін екі тарап та шарттарды растауы қажет.",
        };
      }
      return { allowed: true };

    case "IN_PROGRESS":
      if (!isProvider) {
        return { allowed: false, reason: "Тек маман жұмысты бастай алады." };
      }
      if (!bothConfirmed) {
        return {
          allowed: false,
          reason: "Жұмысты бастау үшін екі тараптың растауы қажет.",
        };
      }
      return { allowed: true };

    case "COMPLETED":
      if (!isProvider && !isCustomer) {
        return { allowed: false, reason: "Рұқсат жоқ." };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: "Белгісіз әрекет." };
  }
}

