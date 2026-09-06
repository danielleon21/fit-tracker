import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/require-user";
import { exerciseService } from "@/services/exercise.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const progress = await exerciseService.getProgress(params.id, userId);
    return NextResponse.json({ data: progress });
  } catch (error) {
    return handleRouteError(error);
  }
}
