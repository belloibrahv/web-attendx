import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/error-handler";

export async function requireRole(roles: Array<"ADMIN" | "LECTURER" | "STUDENT">) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
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
  } catch (error) {
    // If there's an error getting the session (like JWT decryption failure),
    // redirect to login to clear the invalid session
    console.error("Session error in requireRole:", error);
    redirect("/login");
  }
}

export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      redirect("/login");
    }

    return session;
  } catch (error) {
    console.error("Session error in requireAuth:", error);
    redirect("/login");
  }
}

