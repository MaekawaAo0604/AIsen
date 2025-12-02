import type { User } from 'firebase/auth'
import { LoginIcon } from './SidebarIcons'

interface SidebarUserButtonProps {
  user: User | null
  onLoginClick: () => void
  onUserClick: () => void
  isExpanded: boolean
}

export function SidebarUserButton({
  user,
  onLoginClick,
  onUserClick,
  isExpanded,
}: SidebarUserButtonProps) {
  if (user) {
    return (
      <button
        onClick={onUserClick}
        className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
      >
        <div className="w-6 h-6 flex-shrink-0 rounded-full bg-[#2383e2] flex items-center justify-center text-white text-[12px] font-medium">
          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        {isExpanded && (
          <span className="text-[14px] font-medium whitespace-nowrap truncate max-w-[120px]">
            {user.displayName || user.email}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={onLoginClick}
      className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg hover:bg-[#f7f6f3] transition-colors text-[#37352f]"
    >
      <div className="w-6 h-6 flex-shrink-0">
        <LoginIcon />
      </div>
      {isExpanded && <span className="text-[14px] font-medium whitespace-nowrap">ログイン</span>}
    </button>
  )
}
