"use server";

import { createUser } from "@/data/user/user";

export async function signIn() {
  await createUser();
}
