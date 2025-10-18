import type { ReactNode } from "react";

interface HeaderProps {
  title: string
  subtitle?: string
  rightContent?: ReactNode
}

export default function Header({ title, subtitle, rightContent }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {rightContent && (
          <div className="flex items-center space-x-4">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}
