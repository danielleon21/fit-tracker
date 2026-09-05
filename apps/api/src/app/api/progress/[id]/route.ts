import { NextRequest, NextResponse } from "next/server";
import { updateProgressEntrySchema } from "@/lib/progress.schema";
import { requireUserId } from "@/lib/require-user";
import { progressService } from "@/services/progress.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const body = updateProgressEntrySchema.parse(await request.json());
    const entry = await progressService.updateEntry(params.id, userId, {
      weightKg: body.weightKg,
      idealWeightKg: body.idealWeightKg ?? null,
      heightCm: body.heightCm ?? null,
      bodyFatPct: body.bodyFatPct ?? null,
      muscleMassPct: body.muscleMassPct ?? null,
    });
    return NextResponse.json({ data: entry });
  } catch (error) {
    return handleRouteError(error);
  }
}
