"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/gimnasio", label: "Rutinas" },
  { href: "/gimnasio/progreso", label: "Progreso" },
  { href: "/gimnasio/historico", label: "Histórico" },
];

export function GimnasioNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {TABS.map((tab) =>
        pathname === tab.href ? (
          <span key={tab.href} className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink">
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-border-2 px-4 py-1.5 text-sm font-semibold text-muted hover:text-ink"
          >
            {tab.label}
          </Link>
        ),
      )}
    </div>
  );
}
