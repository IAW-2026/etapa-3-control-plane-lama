import { AppShell } from "@/components/layout/AppShell";
import { requireSuperAdmin } from "@/lib/auth";

export default async function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return <AppShell>{children}</AppShell>;
}
