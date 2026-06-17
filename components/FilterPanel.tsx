import Link from "next/link";
import { cn } from "@/lib/utils";

type FilterOption = {
  label: string;
  value: string;
};

type FilterField =
  | {
      type: "search";
      name: string;
      label: string;
      placeholder: string;
      defaultValue?: string;
      className?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      defaultValue?: string;
      options: FilterOption[];
      className?: string;
    };

type FilterPanelProps = {
  fields: FilterField[];
  clearHref: string;
  hiddenFields?: Record<string, string | number | undefined>;
};

export function FilterPanel({ fields, clearHref, hiddenFields }: FilterPanelProps) {
  return (
    <form
      action=""
      className="grid gap-4 rounded-[22px] border border-lama-border bg-[#f4efe6]/80 p-5 shadow-soft lg:grid-cols-12"
    >
      <input type="hidden" name="page" value="1" />
      {Object.entries(hiddenFields ?? {}).map(([key, value]) =>
        value === undefined ? null : (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ),
      )}
      {fields.map((field) => (
        <label
          key={field.name}
          className={cn("block min-w-0 text-sm font-black text-lama-text", field.className)}
        >
          <span className="mb-3 block">{field.label}</span>
          {field.type === "search" ? (
            <input
              name={field.name}
              defaultValue={field.defaultValue}
              placeholder={field.placeholder}
              className="h-14 w-full min-w-0 rounded-[14px] border border-lama-border bg-white px-4 text-sm font-bold text-lama-text outline-none shadow-soft transition placeholder:text-lama-muted/80 focus:border-lama-primary focus:ring-4 focus:ring-lama-primary/15"
            />
          ) : (
            <select
              name={field.name}
              defaultValue={field.defaultValue ?? ""}
              className="h-14 w-full min-w-0 rounded-[14px] border border-lama-border bg-white px-4 text-sm font-bold text-lama-text outline-none shadow-soft transition focus:border-lama-primary focus:ring-4 focus:ring-lama-primary/15"
            >
              {field.options.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}
      <div className="min-w-0 lg:col-span-2">
        <span className="mb-3 block text-sm font-black text-lama-text">Acciones</span>
        <div className="flex gap-2">
          <button
            type="submit"
            className="h-14 rounded-[14px] bg-lama-primary px-6 text-sm font-black text-white transition hover:bg-lama-primary/90"
          >
            Aplicar
          </button>
          <Link
            href={clearHref}
            className="inline-flex h-14 items-center justify-center rounded-[14px] border border-lama-border bg-white px-6 text-sm font-black text-lama-text transition hover:border-lama-primary hover:bg-lama-primary/10"
          >
            Limpiar
          </Link>
        </div>
      </div>
    </form>
  );
}
