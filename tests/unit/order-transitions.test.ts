import { describe, it, expect } from "vitest";
import {
  canTransitionOrder,
  canUserPerformOrderAction,
} from "@/lib/permissions/order-transitions";

describe("canTransitionOrder", () => {
  it("allows valid forward transitions", () => {
    expect(canTransitionOrder("PENDING", "NEGOTIATING")).toBe(true);
    expect(canTransitionOrder("NEGOTIATING", "AGREED")).toBe(true);
    expect(canTransitionOrder("AGREED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionOrder("IN_PROGRESS", "COMPLETED")).toBe(true);
  });

  it("blocks invalid transitions", () => {
    expect(canTransitionOrder("PENDING", "COMPLETED")).toBe(false);
    expect(canTransitionOrder("COMPLETED", "CANCELLED")).toBe(false);
    expect(canTransitionOrder("REJECTED", "NEGOTIATING")).toBe(false);
  });
});

describe("canUserPerformOrderAction", () => {
  it("requires both parties to confirm before starting work", () => {
    const blocked = canUserPerformOrderAction({
      role: "PROVIDER",
      isCustomer: false,
      isProvider: true,
      currentStatus: "AGREED",
      targetStatus: "IN_PROGRESS",
      bothConfirmed: false,
    });
    expect(blocked.allowed).toBe(false);

    const allowed = canUserPerformOrderAction({
      role: "PROVIDER",
      isCustomer: false,
      isProvider: true,
      currentStatus: "AGREED",
      targetStatus: "IN_PROGRESS",
      bothConfirmed: true,
    });
    expect(allowed.allowed).toBe(true);
  });

  it("prevents customers from rejecting or starting orders", () => {
    const res = canUserPerformOrderAction({
      role: "CUSTOMER",
      isCustomer: true,
      isProvider: false,
      currentStatus: "PENDING",
      targetStatus: "REJECTED",
    });
    expect(res.allowed).toBe(false);
  });
});

