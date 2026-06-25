import { getSession } from "@/lib/auth/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const authProcedure = t.procedure.use(async function isAuthed(opts) {
  const session = await getSession();

  if (!session.data?.user.id) throw new Error("No user found");
  if (!session.data?.user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
  const userId = session.data.user.id;

  return opts.next({
    ctx: { userId },
  });
});
