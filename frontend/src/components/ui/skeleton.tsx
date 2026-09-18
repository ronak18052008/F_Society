export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#e8e4d8]/70 dark:bg-[#1f3024]/70 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-[#e3dfd5] dark:border-[#2a3f31] bg-[#ffffff] dark:bg-[#152219] p-3 overflow-hidden shadow-xs">
      <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
