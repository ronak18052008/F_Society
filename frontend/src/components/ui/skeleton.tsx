export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse bg-paper-2 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="border border-line">
      <Skeleton className="h-52 w-full" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
