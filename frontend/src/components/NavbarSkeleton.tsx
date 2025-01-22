export default function NavbarSkeleton() {
  return (
    <header className="px-6 py-4 border-b border-border bg-background">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo skeleton */}
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>

        {/* User menu skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </nav>
    </header>
  )
} 