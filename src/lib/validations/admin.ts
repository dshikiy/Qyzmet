import { z } from "zod";

export const categorySchema = z.object({
  nameKk: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug тек латын әріптері, сандар және дефистен тұруы тиіс"),
  icon: z.string().trim().min(1).max(50).default("Wrench"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const promotionSchema = z.object({
  providerId: z.string().min(1),
  type: z.enum(["FEATURED_LISTING", "TOP_SEARCH", "CATEGORY_SPOTLIGHT"]),
  startsAt: z.string().min(1),
  expiresAt: z.string().min(1),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).default("ACTIVE"),
});

export const advertisementSchema = z.object({
  title: z.string().trim().min(2).max(200),
  advertiserName: z.string().trim().min(2).max(200),
  placement: z.string().trim().min(2).max(100),
  targetUrl: z.string().trim().url().optional().or(z.literal("")),
  startsAt: z.string().min(1),
  expiresAt: z.string().min(1),
  isActive: z.boolean().default(true),
});

