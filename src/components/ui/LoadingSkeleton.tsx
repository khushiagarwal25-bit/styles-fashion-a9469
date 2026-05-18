export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-product bg-stone-100 rounded-sm" />
      <div className="mt-3 space-y-2">
        <div className="h-2.5 bg-stone-100 rounded w-1/3" />
        <div className="h-3.5 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-1/4" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid-products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-[85vh] bg-stone-100 animate-pulse" />
  );
}

export function TextSkeleton({ className = "" }: { className?: string }) {
  return <div className={`h-4 bg-stone-100 rounded animate-pulse ${className}`} />;
}
