import { z } from "zod";

export const createReviewSchema = z.object({
  orderId: z.string().min(1, "Тапсырыс идентификаторы қажет"),
  rating: z
    .number()
    .int("Баға бүтін сан болуы тиіс")
    .min(1, "Ең төменгі баға — 1")
    .max(5, "Ең жоғарғы баға — 5"),
  comment: z
    .string()
    .trim()
    .min(5, "Пікір кемінде 5 таңбадан тұруы тиіс")
    .max(1500, "Пікір 1500 таңбадан аспауы тиіс"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

