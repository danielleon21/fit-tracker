import type { Metadata } from "next";
import { lora, karla } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit Tracker",
  description: "Seguimiento físico personal: progreso, gimnasio y nutrición.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${lora.variable} ${karla.variable}`}>
      <body className="bg-bg font-sans text-ink">{children}</body>
    </html>
  );
}
