import { createNeonAuth } from "@neondatabase/auth/next/server";

if (!process.env.NEON_AUTH_BASE_URL)
  throw new Error("NEON_AUTH_BASE_URL is not set up");
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export function getSession() {
  return auth.getSession();
}
