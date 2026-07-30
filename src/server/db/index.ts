import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { environment } from "@/config/environment";
import * as schema from "@/server/db/schema";

const queryClient = postgres(environment.DATABASE_URL, {
  max: environment.NODE_ENV === "production" ? 10 : 5,
});

export const db = drizzle(queryClient, {
  schema,
});

export type Database = typeof db;
