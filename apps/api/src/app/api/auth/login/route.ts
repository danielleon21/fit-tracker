import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { SESSION_MAX_AGE, getAuthSecret, sessionCookie } from "@/lib/auth.config";
import { handleRouteError } from "@/middleware/error-handler";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = loginSchema.parse(await request.json());
    const user = await authService.validateCredentials(email, password);

    // Same payload shape NextAuth's own jwt callback produces, so the cookie is
    // interchangeable with the one issued by /api/auth/callback/credentials.
    const token = await encode({
      token: { sub: user.id, name: user.name, email: user.email },
      secret: getAuthSecret(),
      maxAge: SESSION_MAX_AGE,
    });

    const response = NextResponse.json({ data: user });
    response.cookies.set({
      name: sessionCookie.name,
      value: token,
      ...sessionCookie.options,
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
