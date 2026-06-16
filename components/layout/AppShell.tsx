import { Topbar } from "@/components/layout/Topbar";

type ShellUser = {
  fullName?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
};

type AppShellProps = {
  children: React.ReactNode;
  user: ShellUser | null;
};

export function AppShell({ children, user }: AppShellProps) {
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Super admin";

  return (
    <div className="min-h-screen bg-lama-background text-lama-text">
      <Topbar displayName={displayName} />
      <main className="mx-auto w-full max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
