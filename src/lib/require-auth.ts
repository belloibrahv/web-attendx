import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function requireRole(roles: Array<"ADMIN" | "LECTURER" | "STUDENT">) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || !role) {
    redirect("/login");
  }
  if (!roles.includes(role)) {
    redirect("/home");
  }
  return session;
}

