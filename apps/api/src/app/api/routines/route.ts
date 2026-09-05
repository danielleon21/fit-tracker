import { NextRequest, NextResponse } from "next/server";
import { createRoutineSchema } from "@/lib/routine.schema";
import { requireUserId } from "@/lib/require-user";
import { routineService } from "@/services/routine.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET() {
  try {
    const userId = await requireUserId();
    const routines = await routineService.listForUser(userId);
    return NextResponse.json({ data: routines });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = createRoutineSchema.parse(await request.json());
    const routine = await routineService.create(userId, body);
    return NextResponse.json({ data: routine }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
