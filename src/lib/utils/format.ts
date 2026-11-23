/**
 * Format a numeric or string KZT price for Kazakh locale display.
 * Example: 15000 -> "15 000 ₸"
 */
export function formatKzt(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Келісім бойынша";
  }
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num) || num < 0) {
    return "Келісім бойынша";
  }
  const rounded = Math.round(num);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} ₸`;
}

export function formatRating(avg: number | null | undefined): string {
  if (avg === null || avg === undefined || !Number.isFinite(avg) || avg <= 0) {
    return "Жаңа";
  }
  return avg.toFixed(1);
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const valid = ratings.filter((r) => Number.isFinite(r) && r >= 1 && r <= 5);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, r) => acc + r, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}

export function formatDateKk(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("kk-KZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

