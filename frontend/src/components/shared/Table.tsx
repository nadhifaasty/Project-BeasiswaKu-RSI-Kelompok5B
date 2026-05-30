import { useState } from 'react'

type SortDirection = 'asc' | 'desc' | null

interface Column<T> {
  /** Unique key identifier for the column */
  key: string
  /** Display header text */
  header: string
  /** Accessor key to retrieve value from data row */
  accessor: keyof T
  /** Whether this column is sortable */
  sortable?: boolean
  /** Custom render function for cell content */
  render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode
  /** Optional width class (e.g., 'w-40', 'min-w-[200px]') */
  width?: string
}

interface TableProps<T> {
  /** Array of data objects to display */
  data: T[]
  /** Column configuration array */
  columns: Column<T>[]
  /** Total number of rows (for display info, may differ from data.length if paginated) */
  totalRows?: number
  /** Number of rows per page */
  rowsPerPage?: number
  /** Callback when sort changes */
  onSortChange?: (columnKey: string, direction: SortDirection) => void
  /** Optional empty state message */
  emptyMessage?: string
}

function Table<T extends Record<string, unknown>>({
  data,
  columns,
  onSortChange,
  emptyMessage = 'Tidak ada data untuk ditampilkan.',
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return

    let newDirection: SortDirection = 'asc'
    if (sortColumn === column.key) {
      if (sortDirection === 'asc') newDirection = 'desc'
      else if (sortDirection === 'desc') newDirection = null
    }

    setSortColumn(newDirection ? column.key : null)
    setSortDirection(newDirection)
    onSortChange?.(column.key, newDirection)
  }

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null

    const isActive = sortColumn === column.key

    return (
      <span className="ml-1.5 inline-flex flex-col leading-none">
        <svg
          className={`w-3 h-3 ${isActive && sortDirection === 'asc' ? 'text-white' : 'text-white/40'}`}
          viewBox="0 0 10 6"
          fill="currentColor"
        >
          <path d="M5 0L10 6H0L5 0Z" />
        </svg>
        <svg
          className={`w-3 h-3 ${isActive && sortDirection === 'desc' ? 'text-white' : 'text-white/40'}`}
          viewBox="0 0 10 6"
          fill="currentColor"
        >
          <path d="M5 6L0 0H10L5 6Z" />
        </svg>
      </span>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#1F4E79]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white ${
                  column.sortable ? 'cursor-pointer select-none hover:bg-[#163a5c]' : ''
                } ${column.width ?? ''}`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  <span>{column.header}</span>
                  {renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors hover:bg-blue-50 ${
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {columns.map((column) => {
                  const value = row[column.accessor]
                  return (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-gray-700 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : (String(value ?? '-'))}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
export type { Column, TableProps, SortDirection }
