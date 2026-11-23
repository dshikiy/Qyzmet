import { describe, it, expect } from "vitest";
import { calculateDistanceKm, formatDistanceKm } from "@/lib/utils/geo";

describe("calculateDistanceKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(calculateDistanceKm(43.6532, 51.1975, 43.6532, 51.1975)).toBe(0);
  });

  it("calculates realistic distance between Aktau and Zhanaozen (~139 km)", () => {
    const dist = calculateDistanceKm(43.6532, 51.1975, 43.3412, 52.8619);
    expect(dist).toBeGreaterThan(130);
    expect(dist).toBeLessThan(150);
  });
});

describe("formatDistanceKm", () => {
  it("formats meters for distances under 1 km", () => {
    expect(formatDistanceKm(0.45)).toBe("450 м");
  });

  it("formats kilometers for distances >= 1 km", () => {
    expect(formatDistanceKm(2.3)).toBe("2.3 км");
  });
});

