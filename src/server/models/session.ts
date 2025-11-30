import { _db } from "../db";
import { session } from "../db/schema";
import type { createSessionSchema } from "../validation/session";
import type { Transaction } from "./models";

const createSession = async (
  data: typeof createSessionSchema._output,
  tx?: Transaction
) => {
  const db = tx ?? _db;
  const sessionRes = await db.insert(session).values(data).returning();
  return sessionRes.at(0)!;
};

const model = {
  createSession,
};

export default model;
