import { requireRole } from "@/lib/require-auth";
import { LecturerErrorBoundary } from "@/components/lecturer-error-boundary";

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["LECTURER"]);
  return (
    <LecturerErrorBoundary>
      {children}
    </LecturerErrorBoundary>
  );
}

