import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/auth.config";

export async function POST() {
  const response = NextResponse.json({ data: null });
  response.cookies.set({
    name: sessionCookie.name,
    value: "",
    ...sessionCookie.options,
    maxAge: 0,
  });
  return response;
}
