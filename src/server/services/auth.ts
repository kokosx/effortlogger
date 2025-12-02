import type { DatabaseConnection } from "../db";
import { models } from "../models/models";
import type { createUserSchema, loginUserSchema } from "../validation/user";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const normalizeEmail = (email: string) => {
  return email.toLowerCase().trim();
};

const createUser = async (
  db: DatabaseConnection,
  data: typeof createUserSchema._output
) => {
  //Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);
  //Add user to db
  const user = await models.user.createUser(db, {
    email: normalizeEmail(data.email),
    name: data.name,
    password: hashedPassword,
  });
  //Create session
  await createSession(db, user.id);
};

const loginUser = async (
  db: DatabaseConnection,
  data: typeof loginUserSchema._output
) => {
  const normalizedEmail = normalizeEmail(data.email);
  const user = await models.user.findUserByEmail(db, normalizedEmail);
  if (!user) {
    throw new Error("User not found");
    //TODO:
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
    //TODO:
  }
  await createSession(db, user.id);
};

const createSession = async (db: DatabaseConnection, userId: number) => {
  const session = await models.session.createSession(db, {
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

const validateSession = async (db: DatabaseConnection) => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id");
  if (!sessionId) {
    return null;
  }
  const session = await models.session.getSessionBySessionId(
    db,
    sessionId.value
  );
  if (!session) {
    return null;
  }
  if (session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return session;
};

const getUser = async (db: DatabaseConnection) => {
  //Check if the session is valid
  const session = await validateSession(db);
  if (!session) {
    return null;
  }
  //Get the user
  const user = models.user.findUserBySessionId(db, session.id);
  return user;
};

const auth = {
  createUser,
  validateSession,
  getUser,
  loginUser,
};

export default auth;
