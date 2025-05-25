import { getDatabaseSafe } from "@/database";

import { UserSchema } from "./user.schema";

export async function createUser() {
  const db = await getDatabaseSafe();
  await db
    .insert(UserSchema)
    .values({
      email: "test@test.com",
      hashedPassword: "test",
      provider: "email",
      providerUserId: "test",
    })
    .onConflictDoNothing();
}
