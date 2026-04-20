'use client';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-muted rounded-lg"></div>
      <div className="h-32 bg-muted rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function PriceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 space-y-3 animate-pulse">
      <div className="h-6 bg-muted rounded w-3/4"></div>
      <div className="h-8 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-2/3"></div>
    </div>
  );
}

export function SchemeCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 space-y-3 animate-pulse">
      <div className="h-6 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-4/5"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded w-20"></div>
        <div className="h-6 bg-muted rounded w-20"></div>
      </div>
      <div className="h-10 bg-muted rounded w-full"></div>
    </div>
  );
}
