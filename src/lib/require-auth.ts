import { redirect } from "next/navigation";
import { getSafeSession } from "@/lib/safe-session";

export async function requireRole(roles: Array<"ADMIN" | "LECTURER" | "STUDENT">) {
  const { session, error } = await getSafeSession();
  
  // If there's a session error or no session, redirect to login
  if (error || !session || !session.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (!role) {
    redirect("/login");
  }

  if (!roles.includes(role)) {
    redirect("/home");
  }

  return session;
}

export async function requireAuth() {
  const { session, error } = await getSafeSession();
  
  // If there's a session error or no session, redirect to login
  if (error || !session || !session.user) {
    redirect("/login");
  }

  return session;
}

