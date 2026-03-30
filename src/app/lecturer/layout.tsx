import { requireRole } from "@/lib/require-auth";

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["LECTURER"]);
  return children;
}

