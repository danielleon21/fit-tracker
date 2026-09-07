import { NextRequest, NextResponse } from "next/server";
import { habitLogDateParamSchema } from "@/lib/habit.schema";
import { requireUserId } from "@/lib/require-user";
import { habitService } from "@/services/habit.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function PUT(_request: NextRequest, { params }: { params: { id: string; date: string } }) {
  try {
    const userId = await requireUserId();
    const date = habitLogDateParamSchema.parse(params.date);
    const log = await habitService.logDay(params.id, userId, date);
    return NextResponse.json({ data: log });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string; date: string } }) {
  try {
    const userId = await requireUserId();
    const date = habitLogDateParamSchema.parse(params.date);
    await habitService.unlogDay(params.id, userId, date);
    return NextResponse.json({ data: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
