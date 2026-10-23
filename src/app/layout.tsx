import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "খালি খাই (Khali Khai) — AI-Powered Multi-Restaurant Delivery & Shared Logistics",
  description: "Different restaurants. One smart cart. One transparent delivery plan. Save delivery fees across favorite nearby restaurants in Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-[#FFF9F0] text-[#343434] antialiased">
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
