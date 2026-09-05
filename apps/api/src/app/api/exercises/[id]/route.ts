import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/require-user";
import { exerciseService } from "@/services/exercise.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUserId();
    const exercise = await exerciseService.getById(params.id);
    return NextResponse.json({ data: exercise });
  } catch (error) {
    return handleRouteError(error);
  }
}
