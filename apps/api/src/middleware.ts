import { NextRequest, NextResponse } from "next/server";

const allowedOrigin = process.env.WEB_APP_URL ?? "http://localhost:3000";

function withCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin === allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return withCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  return withCorsHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: "/api/:path*",
};
