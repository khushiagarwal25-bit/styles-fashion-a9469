import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = "No products found",
  description = "Try adjusting your filters or search terms.",
  actionLabel = "Browse All Products",
  actionHref = "/shop",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag size={32} className="text-stone-400" />
      </div>
      <h3 className="text-xl font-medium text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-400 text-sm mb-8 max-w-sm">{description}</p>
      <Link href={actionHref} className="btn-outline">
        {actionLabel}
      </Link>
    </div>
  );
}
