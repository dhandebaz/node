import { cookies } from "next/headers";
import { encrypt, decrypt } from "./jwt";

const COOKIE_NAME = "nodebase_session";

export async function createSession(userId: string, role: string = "user") {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, role, expires });

  (await cookies()).set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const session = (await cookies()).get(COOKIE_NAME)?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_NAME);
}
