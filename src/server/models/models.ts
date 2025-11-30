import type { PgTransaction } from "drizzle-orm/pg-core";
import sessionModel from "./session";
import userModel from "./user";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm";

export type Transaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import("/Users/bkokoszewski/Dane/Programowanie/effortlogger/src/server/db/schema"),
  ExtractTablesWithRelations<
    typeof import("/Users/bkokoszewski/Dane/Programowanie/effortlogger/src/server/db/schema")
  >
>;

export const models = {
  session: sessionModel,
  user: userModel,
};
