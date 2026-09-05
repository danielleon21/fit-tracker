import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/require-user";
import { exerciseService } from "@/services/exercise.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    await requireUserId();
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const exercises = await exerciseService.search(search);
    return NextResponse.json({ data: exercises });
  } catch (error) {
    return handleRouteError(error);
  }
}
