import { NextRequest, NextResponse } from "next/server";
import { createHabitSchema } from "@/lib/habit.schema";
import { requireUserId } from "@/lib/require-user";
import { habitService } from "@/services/habit.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET() {
  try {
    const userId = await requireUserId();
    const habits = await habitService.listForUser(userId);
    return NextResponse.json({ data: habits });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = createHabitSchema.parse(await request.json());
    const habit = await habitService.create(userId, body);
    return NextResponse.json({ data: habit }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
