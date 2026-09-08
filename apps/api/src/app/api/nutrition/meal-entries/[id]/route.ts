import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/require-user";
import { mealEntryService } from "@/services/meal-entry.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await requireUserId();
    await mealEntryService.remove(params.id, userId);
    return NextResponse.json({ data: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
