import { NextRequest, NextResponse } from "next/server";
import { createProgressEntrySchema } from "@/lib/progress.schema";
import { requireUserId } from "@/lib/require-user";
import { progressService } from "@/services/progress.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET() {
  try {
    const userId = await requireUserId();
    const entries = await progressService.listForUser(userId);
    return NextResponse.json({ data: entries });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = createProgressEntrySchema.parse(await request.json());
    const entry = await progressService.addEntry(userId, {
      date: body.date,
      weightKg: body.weightKg,
      idealWeightKg: body.idealWeightKg ?? null,
      heightCm: body.heightCm ?? null,
      bodyFatPct: body.bodyFatPct ?? null,
      muscleMassPct: body.muscleMassPct ?? null,
    });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
