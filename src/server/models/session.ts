import { eq } from "drizzle-orm";
import { type Database } from "../db";
import { session } from "../db/schema";
import type { createSessionSchema } from "../validation/session";

const createSession = async (
  db: Database,
  data: typeof createSessionSchema._output
) => {
  const sessionRes = await db.insert(session).values(data).returning();
  return sessionRes.at(0)!;
};

const getSessionBySessionId = async (db: Database, sessionId: string) => {
  const sessionRes = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId));
  return sessionRes.at(0);
};

const model = {
  createSession,
  getSessionBySessionId,
};

export default model;
