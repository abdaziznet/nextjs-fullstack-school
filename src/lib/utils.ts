import { auth } from "@clerk/nextjs/server";

const { userId, sessionClaims } = await auth();
export const getUserRole = (sessionClaims?.metadata as { role?: string })?.role;
export const getUserId = userId;
