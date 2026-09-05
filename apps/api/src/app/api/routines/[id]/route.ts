import { NextRequest, NextResponse } from "next/server";
import { updateRoutineSchema } from "@/lib/routine.schema";
import { requireUserId } from "@/lib/require-user";
import { routineService } from "@/services/routine.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const routine = await routineService.getById(params.id, userId);
    return NextResponse.json({ data: routine });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const body = updateRoutineSchema.parse(await request.json());
    const routine = await routineService.update(params.id, userId, body);
    return NextResponse.json({ data: routine });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    await routineService.remove(params.id, userId);
    return NextResponse.json({ data: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
