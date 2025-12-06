import type { DatabaseConnection } from "../db";
import { models } from "../models/models";
import type { createUserSchema, loginUserSchema } from "../validation/user";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { composeService } from "./services";
import { TRPCError } from "@trpc/server";

export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const normalizeEmail = (email: string) => {
  return email.toLowerCase().trim();
};

/**
 * Registers a new user by hashing their password, persisting the user with a normalized email,
 * and creating a login session (sets the session cookie). Errors are logged but not rethrown.
 */
const createUser = composeService(
  async ({
    db,
    data,
  }: {
    db: DatabaseConnection;
    data: typeof createUserSchema._output;
  }) => {
    //Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    //Add user to db

    const user = await models.user.createUser(db, {
      email: normalizeEmail(data.email),
      name: data.name,
      password: hashedPassword,
    });

    //Create session
    await createSession(db, { userId: user.id });
  }
);

/**
 * Authenticates a user via email/password; on success sets a new session cookie.
 * Throws on missing user or invalid password.
 */
const loginUser = composeService(
  async ({
    db,
    data,
  }: {
    db: DatabaseConnection;
    data: typeof loginUserSchema._output;
  }) => {
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
    await createSession(db, { userId: user.id });
  }
);

/**
 * Creates a session record for the given user and sets an httpOnly cookie with correct maxAge.
 */
const createSession = composeService(
  async ({
    db,
    data: { userId },
  }: {
    db: DatabaseConnection;
    data: { userId: number };
  }) => {
    const session = await models.session.createSession(db, {
      userId,
    });
    const cookieStore = await cookies();
    const maxAge = Math.floor(
      (session.expiresAt.getTime() - Date.now()) / 1000
    );

    cookieStore.set("session_id", session.id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge,
    });
  }
);

/**
 * Validates the current session cookie and returns the session record or null if missing/expired.
 */
const validateSession = composeService(
  async ({ db }: { db: DatabaseConnection }) => {
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
  }
);

/**
 * Returns the user associated with the current valid session, or null if unauthenticated.
 */
const getUser = composeService(async ({ db }: { db: DatabaseConnection }) => {
  //Check if the session is valid
  const session = await validateSession(db);
  if (!session) {
    return null;
  }
  //Get the user
  const user = models.user.findUserBySessionId(db, session.id);
  return user;
});

/**
 * Deletes the current session and clears the session cookie. Returns false if not logged in.
 */
const signOut = composeService(async ({ db }: { db: DatabaseConnection }) => {
  const session = await validateSession(db);
  if (!session) {
    return false;
  }
  const cookieStore = await cookies();
  cookieStore.delete("session_id");
  await models.session.deleteSessionById(db, session.id);
  return true;
});

const auth = {
  createUser,
  validateSession,
  getUser,
  loginUser,
  signOut,
};

export default auth;
