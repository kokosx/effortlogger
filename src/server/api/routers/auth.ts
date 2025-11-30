import services from "../../services/services";
import { createUserSchema, loginUserSchema } from "../../validation/user";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
});
