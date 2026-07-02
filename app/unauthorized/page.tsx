import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-lama-background px-4">
      <section className="w-full max-w-md rounded-[24px] border border-lama-border bg-lama-surface p-8 text-center shadow-panel">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lama-primary/10 text-lama-primary">
          <ShieldAlert className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-5 text-xl font-semibold text-lama-text">
          Acceso restringido
        </h1>
        <p className="mt-3 text-sm leading-6 text-lama-muted">
          Esta app requiere un usuario de Clerk con rol super_admin.
        </p>
        <SignOutButton>
          <button className="mt-6 rounded-[14px] border border-lama-border bg-white px-5 py-3 text-sm font-bold text-lama-text transition hover:border-lama-primary hover:text-lama-text">
            Cerrar sesion
          </button>
        </SignOutButton>
      </section>
    </main>
  );
}
