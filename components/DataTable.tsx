import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  widthClassName?: string;
  headerClassName?: string;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  error?: string;
  density?: "default" | "compact";
  tableClassName?: string;
};

const densityStyles = {
  default: {
    table: "text-sm",
    header: "px-7 py-5 text-xs tracking-[0.18em]",
    cell: "px-7 py-5",
  },
  compact: {
    table: "text-[13px]",
    header: "px-3 py-3 text-[11px] tracking-normal",
    cell: "px-3 py-3",
  },
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyTitle,
  emptyDescription,
  error,
  density = "default",
  tableClassName,
}: DataTableProps<T>) {
  const styles = densityStyles[density];

  if (error) {
    return (
      <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-6 text-sm font-medium leading-6 text-amber-900 shadow-soft">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-[24px] border border-lama-border bg-lama-surface/95 p-12 text-center shadow-panel">
        <p className="text-base font-black text-lama-text">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-lama-muted">
            {emptyDescription}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-lama-border bg-lama-surface/95 shadow-panel">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "min-w-full divide-y divide-lama-border",
            styles.table,
            tableClassName,
          )}
        >
          <thead className="bg-[#f4efe6]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap text-left font-black uppercase text-lama-muted",
                    styles.header,
                    column.widthClassName,
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-lama-border bg-lama-surface">
            {data.map((item) => (
              <tr key={getRowKey(item)} className="transition hover:bg-white/80">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap align-middle text-lama-text",
                      styles.cell,
                      column.widthClassName,
                      column.className,
                    )}
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
