import { _db } from "../db";
import { user } from "../db/schema";
import type { createUserSchema } from "../validation/user";
import type { Transaction } from "./models";

const createUser = async (
  data: typeof createUserSchema._output,
  tx?: Transaction
) => {
  const db = tx ?? _db;

  const resUser = await db.insert(user).values(data).returning();
  return resUser.at(0)!;
};

const model = {
  createUser,
};

export default model;
