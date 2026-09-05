import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { handleRouteError } from "@/middleware/error-handler";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());
    const user = await authService.register(body);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
