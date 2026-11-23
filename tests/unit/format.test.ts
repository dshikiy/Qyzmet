import { describe, it, expect } from "vitest";
import {
  formatKzt,
  formatRating,
  calculateAverageRating,
} from "@/lib/utils/format";

describe("formatKzt", () => {
  it("formats numbers with spaces and tenge symbol", () => {
    expect(formatKzt(15000)).toBe("15 000 ₸");
    expect(formatKzt(500)).toBe("500 ₸");
    expect(formatKzt(1250000)).toBe("1 250 000 ₸");
  });

  it("handles null, undefined, and negative values", () => {
    expect(formatKzt(null)).toBe("Келісім бойынша");
    expect(formatKzt(undefined)).toBe("Келісім бойынша");
    expect(formatKzt(-100)).toBe("Келісім бойынша");
  });
});

describe("calculateAverageRating", () => {
  it("returns 0 for empty array", () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  it("calculates average rounded to 1 decimal place", () => {
    expect(calculateAverageRating([5, 4, 5])).toBe(4.7);
    expect(calculateAverageRating([5, 5, 5])).toBe(5);
  });

  it("ignores out-of-range ratings", () => {
    expect(calculateAverageRating([5, 0, 6, 3])).toBe(4);
  });
});

describe("formatRating", () => {
  it("formats valid ratings and shows Жаңа for 0", () => {
    expect(formatRating(4.7)).toBe("4.7");
    expect(formatRating(0)).toBe("Жаңа");
    expect(formatRating(null)).toBe("Жаңа");
  });
});

