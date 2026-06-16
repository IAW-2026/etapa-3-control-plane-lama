import type { ReactNode } from "react";
import { formatNumber } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  helper?: string;
};

export function StatCard({ title, value, icon, helper }: StatCardProps) {
  return (
    <article className="group min-h-[210px] rounded-[24px] border border-lama-border bg-lama-surface/95 p-7 shadow-panel transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(55,65,61,0.11)]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.34em] text-lama-primary">
            {title}
          </p>
          <p className="mt-5 text-5xl font-black leading-none text-lama-text">
            {formatNumber(value)}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-lama-primary/10 text-lama-primary transition group-hover:bg-lama-primary/15">
          {icon}
        </div>
      </div>
      {helper ? (
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-10 bg-lama-border" />
          <p className="text-xs font-bold text-lama-primary">{helper}</p>
        </div>
      ) : null}
    </article>
  );
}
