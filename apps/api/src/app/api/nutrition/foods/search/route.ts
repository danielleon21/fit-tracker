import { NextRequest, NextResponse } from "next/server";
import { foodSearchQuerySchema } from "@/lib/food.schema";
import { requireUserId } from "@/lib/require-user";
import { foodSearchService } from "@/services/food-search.service";
import { handleRouteError } from "@/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { q } = foodSearchQuerySchema.parse({ q: request.nextUrl.searchParams.get("q") ?? "" });
    const results = await foodSearchService.search(userId, q);
    return NextResponse.json({ data: results });
  } catch (error) {
    return handleRouteError(error);
  }
}
