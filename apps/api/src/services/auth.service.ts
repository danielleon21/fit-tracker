import bcrypt from "bcryptjs";
import type { AuthUser, RegisterInput } from "@fit-tracker/types";
import { userRepository } from "@/repositories/user.repository";
import { ConflictError, UnauthorizedError } from "@/errors/domain-errors";

const SALT_ROUNDS = 10;

export const authService = {
  async register(input: RegisterInput): Promise<AuthUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    return { id: user.id, email: user.email, name: user.name };
  },

  async validateCredentials(email: string, password: string): Promise<AuthUser> {
    const user = await userRepository.findByEmail(email);
    if (!user?.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return { id: user.id, email: user.email, name: user.name };
  },
};
