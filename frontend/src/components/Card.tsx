import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

function Card({ title, subtitle, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-md ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
