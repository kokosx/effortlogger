import services from "../../services/services";
import { createUserSchema } from "../../validation/user";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      await services.auth.createUser(ctx.db, input);
    }),
});
