import { z } from "zod";

export const providerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Аты-жөніңіз кемінде 2 таңбадан тұруы тиіс")
    .max(100)
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Сипаттама кемінде 10 таңбадан тұруы тиіс")
    .max(2000, "Сипаттама 2000 таңбадан аспауы тиіс"),
  experience: z
    .string()
    .trim()
    .min(2, "Тәжірибеңізді көрсетіңіз")
    .max(200, "Тәжірибе сипаттамасы тым ұзын"),
  city: z.string().trim().min(2, "Қаланы таңдаңыз").max(100),
  publicLocation: z
    .string()
    .trim()
    .min(2, "Қызмет көрсету аймағын көрсетіңіз")
    .max(200),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .nullable()
    .optional(),
  indicativePrice: z
    .number()
    .min(0, "Баға теріс болмауы тиіс")
    .max(100000000, "Баға тым жоғары"),
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "Кемінде бір қызмет санатын таңдаңыз"),
});

export type ProviderProfileInput = z.infer<typeof providerProfileSchema>;

