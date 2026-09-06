import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/require-user";
import { exerciseService } from "@/services/exercise.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET() {
  try {
    const userId = await requireUserId();
    const exercises = await exerciseService.listTrained(userId);
    return NextResponse.json({ data: exercises });
  } catch (error) {
    return handleRouteError(error);
  }
}
