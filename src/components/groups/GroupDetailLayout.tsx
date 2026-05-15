import { Link, useParams, useRouterState } from '@tanstack/react-router'
import { ArrowLeft, Activity, Receipt, Scale, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupIcon } from '@/components/groups/GroupIcon'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useStore } from '@/store'
import { useCurrentUserId } from '@/hooks/useCurrentUser'
import { useGroupBalances } from '@/hooks/useGroupBalances'
import { formatCents } from '@/lib/currency'

interface Props {
  children: React.ReactNode
}

export function GroupDetailLayout({ children }: Props) {
  const params = useParams({ strict: false }) as { groupId?: string }
  const groupId = params.groupId
  const group = useStore((s) => s.groups.find((g) => g.id === groupId))
  const users = useStore((s) => s.users)
  const preferences = useStore((s) => s.preferences)
  const currentUserId = useCurrentUserId()
  const { net } = useGroupBalances(groupId)
  const path = useRouterState({ select: (s) => s.location.pathname })

  if (!group || !groupId) return null

  const members = users.filter((u) => group.memberIds.includes(u.id))
  const myNet = (currentUserId && net[currentUserId]) || 0

  const segment = path.split(`/app/groups/${groupId}`)[1] ?? '/'
  const tabValue =
    segment.startsWith('/balances')
      ? 'balances'
      : segment.startsWith('/members')
        ? 'members'
        : segment.startsWith('/activity')
          ? 'activity'
          : 'expenses'

  const isMember = currentUserId ? group.memberIds.includes(currentUserId) : false

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/groups">
            <ArrowLeft className="h-4 w-4" /> All groups
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/85 backdrop-blur-sm p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/25 text-cocoa shrink-0">
              <GroupIcon iconKey={group.iconKey} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl md:text-3xl font-semibold truncate">
                {group.name}
              </h1>
              {group.description ? (
                <p className="text-sm text-muted-foreground mt-1 max-w-prose">
                  {group.description}
                </p>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {members.slice(0, 6).map((u) => (
                    <UserAvatar key={u.id} user={u} size="sm" className="ring-2 ring-card" />
                  ))}
                  {members.length > 6 ? (
                    <div className="h-8 w-8 rounded-full bg-muted ring-2 ring-card text-xs font-semibold grid place-items-center">
                      +{members.length - 6}
                    </div>
                  ) : null}
                </div>
                <span className="text-sm text-muted-foreground">
                  {members.length} member{members.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <MyBalance cents={myNet} preferences={preferences} />
            {isMember && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/app/groups/$groupId/settle"
                    params={{ groupId }}
                  >
                    Settle up
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link
                    to="/app/groups/$groupId/expenses/new"
                    params={{ groupId }}
                  >
                    Add expense
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs value={tabValue}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="expenses" asChild>
            <Link
              to="/app/groups/$groupId"
              params={{ groupId }}
              className="inline-flex items-center gap-1.5"
            >
              <Receipt className="h-4 w-4" /> Expenses
            </Link>
          </TabsTrigger>
          <TabsTrigger value="balances" asChild>
            <Link
              to="/app/groups/$groupId/balances"
              params={{ groupId }}
              className="inline-flex items-center gap-1.5"
            >
              <Scale className="h-4 w-4" /> Balances
            </Link>
          </TabsTrigger>
          <TabsTrigger value="members" asChild>
            <Link
              to="/app/groups/$groupId/members"
              params={{ groupId }}
              className="inline-flex items-center gap-1.5"
            >
              <Users className="h-4 w-4" /> Members
            </Link>
          </TabsTrigger>
          <TabsTrigger value="activity" asChild>
            <Link
              to="/app/groups/$groupId/activity"
              params={{ groupId }}
              className="inline-flex items-center gap-1.5"
            >
              <Activity className="h-4 w-4" /> Activity
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div>{children}</div>
    </div>
  )
}

function MyBalance({
  cents,
  preferences,
}: {
  cents: number
  preferences: { currency: string; locale: string }
}) {
  if (cents === 0) {
    return (
      <div className="text-right">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Your balance
        </div>
        <div className="text-lg font-semibold">All settled 🎉</div>
      </div>
    )
  }
  const owed = cents > 0
  return (
    <div className="text-right">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {owed ? 'You’re owed' : 'You owe'}
      </div>
      <div
        className={`text-2xl font-semibold tabular-nums ${
          owed ? 'text-[hsl(var(--success))]' : 'text-destructive'
        }`}
      >
        {formatCents(Math.abs(cents), preferences)}
      </div>
    </div>
  )
}
