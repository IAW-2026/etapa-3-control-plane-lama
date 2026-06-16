import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyTitle: string;
  emptyDescription?: string;
  error?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyTitle,
  emptyDescription,
  error,
}: DataTableProps<T>) {
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
        <table className="min-w-full divide-y divide-lama-border text-sm">
          <thead className="bg-[#f4efe6]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap px-7 py-5 text-left text-xs font-black uppercase tracking-[0.18em] text-lama-muted"
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
                    className={`whitespace-nowrap px-7 py-5 align-middle text-lama-text ${column.className ?? ""}`}
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
