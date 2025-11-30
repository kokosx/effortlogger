import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "./schema";

import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const _db = drizzle(conn, { schema });

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import("/Users/bkokoszewski/Dane/Programowanie/effortlogger/src/server/db/schema"),
  ExtractTablesWithRelations<
    typeof import("/Users/bkokoszewski/Dane/Programowanie/effortlogger/src/server/db/schema")
  >
>;

export type DatabaseConnection = typeof _db;

export type Database = DatabaseConnection | Transaction;
