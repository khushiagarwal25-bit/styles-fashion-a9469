import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
      <p className="font-serif text-8xl md:text-9xl font-light text-stone-200 mb-0 leading-none select-none">
        404
      </p>
      <h1 className="font-serif text-2xl md:text-3xl font-medium text-stone-900 mb-3 -mt-4">
        Page Not Found
      </h1>
      <p className="text-stone-500 text-sm mb-10 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
        <Link href="/shop" className="btn-outline">
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
