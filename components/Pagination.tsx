import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query: Record<string, string | undefined>;
};

function pageHref(basePath: string, query: PaginationProps["query"], page: number) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value && key !== "page") {
      params.set(key, value);
    }
  });

  params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, totalPages, basePath, query }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav className="flex items-center justify-between gap-3 rounded-[20px] border border-lama-border bg-lama-surface/80 px-5 py-4 text-sm text-lama-muted shadow-soft">
      <p>
        Pagina <span className="font-medium text-lama-text">{page}</span> de{" "}
        <span className="font-medium text-lama-text">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={pageHref(basePath, query, previousPage)}
          aria-disabled={isFirst}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-lama-border bg-white text-lama-text transition hover:border-lama-primary hover:bg-lama-primary/10",
            isFirst && "pointer-events-none opacity-40",
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="sr-only">Anterior</span>
        </Link>
        <Link
          href={pageHref(basePath, query, nextPage)}
          aria-disabled={isLast}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-lama-border bg-white text-lama-text transition hover:border-lama-primary hover:bg-lama-primary/10",
            isLast && "pointer-events-none opacity-40",
          )}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="sr-only">Siguiente</span>
        </Link>
      </div>
    </nav>
  );
}
