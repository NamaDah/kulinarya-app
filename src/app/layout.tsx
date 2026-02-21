import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import StoreShell from "@/components/layout/StoreShell";
import AuthModal from "@/components/ui/AuthModal";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kulinarya — Pan-Asian Food Marketplace",
  description:
    "Discover authentic Pan-Asian recipes and shop premium Chinese, Japanese, and Korean ingredients. Cook restaurant-quality meals at home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${inter.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <StoreShell>{children}</StoreShell>
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
