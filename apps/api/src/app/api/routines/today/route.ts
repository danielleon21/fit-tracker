import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/require-user";
import { routineService } from "@/services/routine.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET() {
  try {
    const userId = await requireUserId();
    const today = await routineService.getTodayStatus(userId);
    return NextResponse.json({ data: today });
  } catch (error) {
    return handleRouteError(error);
  }
}
