import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSafeSession() {
  try {
    const session = await getServerSession(authOptions);
    return { session, error: null };
  } catch (error) {
    console.log("Session validation error:", error);
    return { session: null, error: error as Error };
  }
}

export async function requireAuthenticatedUser() {
  const { session, error } = await getSafeSession();
  
  if (error || !session?.user?.id) {
    return { user: null, role: null, error: error || new Error("Not authenticated") };
  }
  
  return { 
    user: session.user, 
    role: session.user.role as "ADMIN" | "LECTURER" | "STUDENT",
    error: null 
  };
}