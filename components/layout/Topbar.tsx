"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  CreditCard,
  Home,
  Package,
  Settings,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/ordenes", label: "Ordenes", icon: ShoppingBag },
  { href: "/envios", label: "Envios", icon: Truck },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/disputas", label: "Disputas", icon: AlertTriangle },
  { href: "/configuracion", label: "Configuracion", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-lama-primary/30 bg-lama-primary text-white shadow-[0_18px_50px_rgba(55,65,61,0.10)]">
      <div className="mx-auto flex h-[68px] w-full max-w-[1680px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-[28px] font-black leading-none tracking-[0.14em] text-white">
              LAMA
            </span>
            <span className="rounded-[6px] border border-white/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
              Control Plane
            </span>
          </Link>
        </div>

        <div className="hidden rounded-[10px] bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:block">
          Admin
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <Link
            href="/configuracion"
            className="hidden rounded-[10px] border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 md:inline-flex"
          >
            Configuracion
          </Link>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
      <nav className="border-t border-white/10 bg-lama-background text-lama-text">
        <div className="mx-auto flex w-full max-w-[1680px] gap-1 overflow-x-auto px-5 sm:px-8 lg:px-10">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[58px] shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition sm:px-4",
                  active
                    ? "border-lama-primary text-lama-text"
                    : "border-transparent text-lama-muted hover:border-lama-border hover:text-lama-text",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
