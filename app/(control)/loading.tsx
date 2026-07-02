export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse rounded-[24px] border border-lama-border bg-white/60" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-[24px] border border-lama-border bg-white/60"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-[24px] border border-lama-border bg-white/60" />
    </div>
  );
}
