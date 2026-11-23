import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Аты-жөніңіз кемінде 2 таңбадан тұруы тиіс")
    .max(100, "Аты-жөніңіз 100 таңбадан аспауы тиіс"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Жарамды электрондық пошта енгізіңіз"),
  password: z
    .string()
    .min(8, "Құпиясөз кемінде 8 таңбадан тұруы тиіс")
    .max(72, "Құпиясөз тым ұзын"),
  role: z.enum(["CUSTOMER", "PROVIDER"], {
    errorMap: () => ({ message: "Пайдаланушы рөлін таңдаңыз" }),
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Жарамды электрондық пошта енгізіңіз"),
  password: z.string().min(1, "Құпиясөзді енгізіңіз"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

