import { Topbar } from "@/components/layout/Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-lama-background text-lama-text">
      <Topbar />
      <main className="mx-auto w-full max-w-[1680px] px-5 py-10 sm:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
