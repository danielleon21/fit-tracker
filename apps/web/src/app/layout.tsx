import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fit Tracker",
  description: "Seguimiento físico personal: progreso, gimnasio y nutrición.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
