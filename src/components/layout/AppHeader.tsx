import { Link } from '@tanstack/react-router'
import { Bell, Layers, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserSwitcher } from '@/components/layout/UserSwitcher'
import { PieWordmark } from '@/components/common/PieLogo'
import { useStore } from '@/store'
import { useCurrentUserId } from '@/hooks/useCurrentUser'

export function AppHeader() {
  const currentUserId = useCurrentUserId()
  const pendingCount = useStore((s) =>
    s.invites.filter((i) => i.status === 'pending' && i.toUserId === currentUserId).length,
  )

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link to="/app" className="flex items-center">
          <PieWordmark />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/app"
              activeProps={{ className: 'bg-accent/10 text-foreground' }}
              activeOptions={{ exact: true }}
            >
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/app/groups"
              activeProps={{ className: 'bg-accent/10 text-foreground' }}
            >
              <Layers className="h-4 w-4" />
              Groups
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/app/invites" aria-label="Invites">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 ? (
                <Badge
                  variant="berry"
                  className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]"
                >
                  {pendingCount}
                </Badge>
              ) : null}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link to="/app/settings" aria-label="Settings">
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </Button>
          <UserSwitcher />
        </div>
      </div>
    </header>
  )
}

