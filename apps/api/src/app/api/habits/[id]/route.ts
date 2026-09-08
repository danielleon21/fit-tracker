import { NextRequest, NextResponse } from "next/server";
import { updateHabitSchema } from "@/lib/habit.schema";
import { requireUserId } from "@/lib/require-user";
import { habitService } from "@/services/habit.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const habit = await habitService.getById(params.id, userId);
    return NextResponse.json({ data: habit });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    const body = updateHabitSchema.parse(await request.json());
    const habit = await habitService.update(params.id, userId, body);
    return NextResponse.json({ data: habit });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    await habitService.remove(params.id, userId);
    return NextResponse.json({ data: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
