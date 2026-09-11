import type { ReactNode } from "react";
import { UnderConstruction } from "@/components/shared/UnderConstruction";
import { isNutritionUnderConstruction } from "@/lib/feature-flags";

// Nutrición está en pausa: en producción se muestra "En construcción" en vez
// del módulo (ver lib/feature-flags.ts). La flag va en el layout y no en
// page.tsx para cubrir también cualquier subruta futura de /nutricion, y para
// no mezclarse con el código del módulo mientras sigue en desarrollo.
export default function NutricionLayout({ children }: { children: ReactNode }) {
  if (isNutritionUnderConstruction()) return <UnderConstruction moduleName="Nutrición" />;
  return <>{children}</>;
}
