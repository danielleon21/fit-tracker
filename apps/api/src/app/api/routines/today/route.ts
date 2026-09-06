import { NextRequest, NextResponse } from "next/server";
import { todayRoutinesQuerySchema } from "@/lib/routine.schema";
import { requireUserId } from "@/lib/require-user";
import { routineService } from "@/services/routine.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { date } = todayRoutinesQuerySchema.parse({
      date: request.nextUrl.searchParams.get("date") ?? undefined,
    });
    const today = await routineService.getTodayStatus(userId, date);
    return NextResponse.json({ data: today });
  } catch (error) {
    return handleRouteError(error);
  }
}
