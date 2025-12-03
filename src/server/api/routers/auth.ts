import { redirect } from "next/navigation";
import services from "../../services/services";
import { createUserSchema, loginUserSchema } from "../../validation/user";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const authRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      await services.auth.createUser(ctx.db, input);
    }),
  loginUser: publicProcedure
    .input(loginUserSchema)
    .mutation(async ({ input, ctx }) => {
      await services.auth.loginUser(ctx.db, input);
    }),
  getUser: authenticatedProcedure.query(async ({ ctx }) => {
    const user = await services.auth.getUser(ctx.db);
    return user;
  }),
  signOut: authenticatedProcedure.mutation(async ({ ctx }) => {
    await services.auth.signOut(ctx.db);
    redirect("/");
  }),
});
