import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QyzmetTap — Қажетті маманды жақын жерден табыңыз",
    template: "%s | QyzmetTap",
  },
  description:
    "Электрик, сантехник, репетитор, үй тазалау және техника жөндеу мамандарын Ақтау және Қазақстан бойынша жақын жерден табыңыз.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}

