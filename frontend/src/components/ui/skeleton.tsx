export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--bg-surface-elevated)]/70 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 overflow-hidden shadow-xs">
      <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
