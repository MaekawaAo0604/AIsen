import { ReactNode } from 'react'

interface SidebarMenuItemProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  isExpanded: boolean
  isActive?: boolean
}

export function SidebarMenuItem({
  icon,
  label,
  onClick,
  isExpanded,
  isActive = false,
}: SidebarMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-[#f7f6f3] transition-colors text-[#37352f] ${
        isActive ? 'bg-[#f7f6f3]' : ''
      } ${onClick ? '' : 'cursor-default'}`}
    >
      <div className="w-6 h-6 flex-shrink-0">{icon}</div>
      {isExpanded && <span className="text-[14px] font-medium whitespace-nowrap">{label}</span>}
    </button>
  )
}
