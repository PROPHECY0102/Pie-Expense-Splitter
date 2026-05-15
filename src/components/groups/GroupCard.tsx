import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GroupIcon } from '@/components/groups/GroupIcon'
import { UserAvatar } from '@/components/common/UserAvatar'
import { formatCents } from '@/lib/currency'
import { useStore } from '@/store'
import type { Group } from '@/types'

interface GroupCardProps {
  group: Group
  myNetCents: number
}

export function GroupCard({ group, myNetCents }: GroupCardProps) {
  const users = useStore((s) => s.users)
  const preferences = useStore((s) => s.preferences)
  const members = users.filter((u) => group.memberIds.includes(u.id))
  const visible = members.slice(0, 4)
  const remaining = members.length - visible.length

  let pill: React.ReactNode
  if (myNetCents === 0) pill = <Badge variant="secondary">Settled up</Badge>
  else if (myNetCents > 0)
    pill = (
      <Badge variant="success">
        You’re owed {formatCents(myNetCents, preferences)}
      </Badge>
    )
  else
    pill = (
      <Badge variant="destructive">
        You owe {formatCents(-myNetCents, preferences)}
      </Badge>
    )

  return (
    <Link
      to="/app/groups/$groupId"
      params={{ groupId: group.id }}
      className="group block h-full rounded-2xl border border-border bg-card/85 backdrop-blur-sm p-5 hover:border-accent/40 hover:shadow-[0_12px_30px_-15px_rgba(61,44,32,0.2)] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/25 text-cocoa">
            <GroupIcon iconKey={group.iconKey} />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-semibold truncate">{group.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {group.description || `${members.length} members`}
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {visible.map((u) => (
            <UserAvatar
              key={u.id}
              user={u}
              size="sm"
              className="ring-2 ring-card"
            />
          ))}
          {remaining > 0 ? (
            <div className="h-8 w-8 rounded-full bg-muted ring-2 ring-card text-xs font-semibold grid place-items-center">
              +{remaining}
            </div>
          ) : null}
        </div>
        {pill}
      </div>
    </Link>
  )
}
