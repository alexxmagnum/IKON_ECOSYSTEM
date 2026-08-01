import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config for MotanOS identity foundation.
 * Migrations are not generated/applied in Phase 2 product flows yet.
 */
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
});
