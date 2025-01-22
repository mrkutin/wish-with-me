export default function WishlistSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-background rounded-lg border border-border p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex space-x-4">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 