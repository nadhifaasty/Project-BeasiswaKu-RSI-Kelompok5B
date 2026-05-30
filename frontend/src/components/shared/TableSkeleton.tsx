interface TableSkeletonProps {
  /** Number of skeleton rows to display */
  rows?: number
  /** Number of skeleton columns to display */
  columns?: number
}

function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {/* Header skeleton */}
      <div className="bg-[#1F4E79] px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={`header-${colIndex}`}
            className="h-4 rounded bg-white/20 animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}px` }}
          />
        ))}
      </div>

      {/* Body skeleton rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className={`px-4 py-3.5 flex gap-4 ${
              rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 rounded bg-gray-200 animate-pulse"
                style={{ width: `${Math.random() * 60 + 50}px` }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-8 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default TableSkeleton
export type { TableSkeletonProps }
