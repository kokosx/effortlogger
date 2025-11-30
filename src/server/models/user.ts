import type { Database } from "../db";
import { user } from "../db/schema";
import type { createUserSchema } from "../validation/user";

const createUser = async (
  db: Database,
  data: typeof createUserSchema._output
) => {
  const resUser = await db.insert(user).values(data).returning();
  return resUser.at(0)!;
};

const model = {
  createUser,
};

export default model;
