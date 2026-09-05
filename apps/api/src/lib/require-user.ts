import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { UnauthorizedError } from "@/errors/domain-errors";

export async function requireUserId() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}
