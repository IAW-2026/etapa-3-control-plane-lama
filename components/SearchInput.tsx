import { Search } from "lucide-react";

type SearchInputProps = {
  placeholder: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string | number | undefined>;
};

export function SearchInput({ placeholder, defaultValue, hiddenFields }: SearchInputProps) {
  return (
    <form className="relative w-full max-w-xl" action="">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-lama-muted" />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-14 w-full rounded-[16px] border border-lama-border bg-white/90 pl-[52px] pr-5 text-base font-semibold text-lama-text outline-none shadow-soft transition placeholder:text-lama-muted/70 focus:border-lama-primary focus:ring-4 focus:ring-lama-primary/15"
      />
      <input type="hidden" name="page" value="1" />
      {Object.entries(hiddenFields ?? {}).map(([key, value]) =>
        value === undefined ? null : (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ),
      )}
    </form>
  );
}
