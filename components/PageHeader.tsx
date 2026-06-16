import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="lama-kicker mb-5">Control Plane</div>
        <h1 className="max-w-4xl text-4xl font-black leading-[0.98] text-lama-text sm:text-5xl lg:text-[64px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-lama-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
