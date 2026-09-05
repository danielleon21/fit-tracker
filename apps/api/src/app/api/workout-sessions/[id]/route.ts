import { NextRequest, NextResponse } from "next/server";
import { updateWorkoutSessionSchema } from "@/lib/workout-session.schema";
import { requireUserId } from "@/lib/require-user";
import { workoutSessionService } from "@/services/workout-session.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const session = await workoutSessionService.getById(params.id, userId);
    return NextResponse.json({ data: session });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const body = updateWorkoutSessionSchema.parse(await request.json());
    const session = await workoutSessionService.update(params.id, userId, body);
    return NextResponse.json({ data: session });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    await workoutSessionService.remove(params.id, userId);
    return NextResponse.json({ data: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
