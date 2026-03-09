export default function ListingsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-64 shrink-0 space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border rounded-xl bg-white overflow-hidden animate-pulse">
            <div className="w-full aspect-video bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
