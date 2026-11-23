import { describe, it, expect } from "vitest";
import { registerSchema } from "@/lib/validations/auth";
import { negotiationProposalSchema } from "@/lib/validations/order";
import { createReviewSchema } from "@/lib/validations/review";

describe("registerSchema", () => {
  it("accepts valid customer and provider registrations", () => {
    const ok = registerSchema.safeParse({
      name: "Айдос Серікұлы",
      email: "aidos@example.kz",
      password: "Password123!",
      role: "CUSTOMER",
    });
    expect(ok.success).toBe(true);
  });

  it("rejects ADMIN role during public registration", () => {
    const bad = registerSchema.safeParse({
      name: "Admin",
      email: "admin@example.kz",
      password: "Password123!",
      role: "ADMIN",
    });
    expect(bad.success).toBe(false);
  });
});

describe("negotiationProposalSchema", () => {
  it("rejects non-positive prices", () => {
    const bad = negotiationProposalSchema.safeParse({
      proposedPrice: 0,
      proposedDateTime: "2026-11-25 14:00",
      proposedScope: "Розетка ауыстыру",
    });
    expect(bad.success).toBe(false);
  });
});

describe("createReviewSchema", () => {
  it("enforces rating 1..5", () => {
    expect(
      createReviewSchema.safeParse({
        orderId: "ord_1",
        rating: 6,
        comment: "Өте жақсы жұмыс",
      }).success
    ).toBe(false);

    expect(
      createReviewSchema.safeParse({
        orderId: "ord_1",
        rating: 5,
        comment: "Өте жақсы жұмыс!",
      }).success
    ).toBe(true);
  });
});

