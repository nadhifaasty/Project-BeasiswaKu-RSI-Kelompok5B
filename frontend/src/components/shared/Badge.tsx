type BadgeStatus = 'DRAFT' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACCEPTED'

interface BadgeProps {
  /** Status value that determines the badge color scheme */
  status: BadgeStatus
}

const statusStyles: Record<BadgeStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACCEPTED: 'bg-green-100 text-green-800',
}

const statusLabels: Record<BadgeStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
  ACCEPTED: 'Diterima',
}

function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

export default Badge
export type { BadgeProps, BadgeStatus }
