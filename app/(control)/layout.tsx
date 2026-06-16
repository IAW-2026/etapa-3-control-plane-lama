import { AppShell } from "@/components/layout/AppShell";
import { requireSuperAdmin } from "@/lib/auth";

export default async function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSuperAdmin();

  return <AppShell user={user}>{children}</AppShell>;
}
