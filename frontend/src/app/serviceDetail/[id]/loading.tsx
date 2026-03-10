export default function ServiceDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-72 bg-gray-200 rounded-2xl mb-6" />

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="border rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
