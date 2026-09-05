import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { progressService } from "@/services/progress.service";
import { handleRouteError } from "@/middleware/error-handler";
import { UnauthorizedError } from "@/errors/domain-errors";

const createProgressEntrySchema = z.object({
  date: z.string().date(),
  weightKg: z.number().positive(),
  idealWeightKg: z.number().positive().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  bodyFatPct: z.number().min(0).max(100).nullable().optional(),
  muscleMassPct: z.number().min(0).max(100).nullable().optional(),
});

async function requireUserId() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}

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
