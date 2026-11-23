import { z } from "zod";

export const createOrderSchema = z.object({
  providerId: z.string().min(1, "Маманды таңдаңыз"),
  categoryId: z.string().min(1, "Қызмет санатын таңдаңыз"),
  description: z
    .string()
    .trim()
    .min(10, "Мәселені кемінде 10 таңбамен сипаттаңыз")
    .max(2000, "Сипаттама 2000 таңбадан аспауы тиіс"),
  address: z
    .string()
    .trim()
    .min(5, "Мекенжайды толық көрсетіңіз")
    .max(300, "Мекенжай тым ұзын"),
  preferredDate: z
    .string()
    .trim()
    .min(4, "Қалаулы күнді таңдаңыз")
    .max(50),
  preferredTime: z
    .string()
    .trim()
    .min(2, "Қалаулы уақытты таңдаңыз")
    .max(50),
});

export const negotiationProposalSchema = z.object({
  proposedPrice: z
    .number()
    .positive("Баға 0-ден жоғары болуы тиіс")
    .max(100000000, "Баға тым жоғары"),
  proposedDateTime: z
    .string()
    .trim()
    .min(4, "Келу күні мен уақытын көрсетіңіз")
    .max(120),
  proposedScope: z
    .string()
    .trim()
    .min(5, "Жұмыс көлемін нақтылаңыз")
    .max(2000),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "NEGOTIATING",
    "AGREED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type NegotiationProposalInput = z.infer<typeof negotiationProposalSchema>;

