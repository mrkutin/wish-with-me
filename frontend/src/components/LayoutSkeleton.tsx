import NavbarSkeleton from './NavbarSkeleton'

export default function LayoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarSkeleton />
      <div className="flex-1 bg-background-alt">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-background rounded-lg border border-border p-6">
                  <div className="space-y-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 