import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { getDatabaseCredentials } from "./src/database.env";

export default defineConfig({
  schema: ["./src/data/**/*.schema.ts", "./src/pgSchema.ts"],
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    ...getDatabaseCredentials(),
    ssl: process.env.NODE_ENV !== "development",
  },
  migrations: {
    table: "__drizzle_migrations_kingface",
  },
  schemaFilter: ["kingface"],
});
