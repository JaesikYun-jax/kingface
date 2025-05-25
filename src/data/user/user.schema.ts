import { kingfaceSchema } from "@/pgSchema";
import { boolean, text, timestamp } from "drizzle-orm/pg-core";

import { primaryIdColumn } from "../columns/customColumnTypes";
import { UserId } from "./user.id";

export type AuthProvider = "google" | "apple" | "email";

export const UserSchema = kingfaceSchema.table("users", {
  id: primaryIdColumn().$type<UserId>(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),
  provider: text("provider").$type<AuthProvider>().notNull(),
  providerUserId: text("provider_user_id"),
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
