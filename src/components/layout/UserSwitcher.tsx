import { useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, LogOut, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useStore } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export function UserSwitcher() {
  const navigate = useNavigate()
  const users = useStore((s) => s.users)
  const loginAs = useStore((s) => s.loginAs)
  const logout = useStore((s) => s.logout)
  const current = useCurrentUser()

  if (!current) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-background/70 pl-1 pr-3 py-1 hover:bg-accent/10 transition-colors">
        <UserAvatar user={current} size="sm" />
        <div className="text-left hidden sm:block leading-tight">
          <div className="text-sm font-semibold">{current.name}</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Profile</DropdownMenuLabel>
        {users.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onSelect={() => {
              if (u.id !== current.id) {
                loginAs(u.id)
                toast.success(`Now acting as ${u.name}`)
              }
            }}
          >
            <UserAvatar user={u} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{u.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
            </div>
            {u.id === current.id ? <Check className="h-4 w-4 text-accent" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            logout()
            navigate({ to: '/login' })
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
