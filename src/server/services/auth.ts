import { models } from "../models/models";
import type { createUserSchema } from "../validation/user";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const normalizeEmail = (email: string) => {
  return email.toLowerCase().trim();
};

const createUser = async (data: typeof createUserSchema._output) => {
  //Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  //Add user to db
  const user = await models.user.createUser({
    email: normalizeEmail(data.email),
    name: data.name,
    password: hashedPassword,
  });
  //Create session
  await createSession(user.id);
};

const loginUser = () => {
  //TBD
};

const createSession = async (userId: number) => {
  const session = await models.session.createSession({
    userId,
  });
  const cookieStore = await cookies();
  const maxAge = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);

  cookieStore.set("session_id", session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge,
  });
};

const auth = {
  createUser,
  loginUser,
};

export default auth;
