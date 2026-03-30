import { requireRole } from "@/lib/require-auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["STUDENT"]);
  return children;
}

