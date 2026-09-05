import { NextRequest, NextResponse } from "next/server";
import { createWorkoutSessionSchema } from "@/lib/workout-session.schema";
import { requireUserId } from "@/lib/require-user";
import { workoutSessionService } from "@/services/workout-session.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    const sessions = await workoutSessionService.listForUser(userId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    return NextResponse.json({ data: sessions });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = createWorkoutSessionSchema.parse(await request.json());
    const session = await workoutSessionService.create(userId, body);
    return NextResponse.json({ data: session }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
