import { NextRequest, NextResponse } from "next/server";
import { createMealEntrySchema, mealEntriesQuerySchema } from "@/lib/meal-entry.schema";
import { requireUserId } from "@/lib/require-user";
import { mealEntryService } from "@/services/meal-entry.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { date } = mealEntriesQuerySchema.parse({ date: request.nextUrl.searchParams.get("date") ?? "" });
    const entries = await mealEntryService.listForUserOnDate(userId, date);
    return NextResponse.json({ data: entries });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = createMealEntrySchema.parse(await request.json());
    const entry = await mealEntryService.create(userId, body);
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
