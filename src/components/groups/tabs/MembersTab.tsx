import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Crown, MoreHorizontal, UserMinus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useGroupContext } from '@/hooks/useGroupContext'
import { InviteMemberDialog } from '@/components/invites/InviteMemberDialog'
import { formatCents } from '@/lib/currency'
import { useGroupBalances } from '@/hooks/useGroupBalances'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User } from '@/types'

export function MembersTab() {
  const { group } = useGroupContext()
  const current = useCurrentUser()
  const users = useStore((s) => s.users)
  const invites = useStore((s) => s.invites)
  const removeMember = useStore((s) => s.removeMember)
  const preferences = useStore((s) => s.preferences)
  const { net } = useGroupBalances(group?.id)
  const [removeTarget, setRemoveTarget] = useState<User | null>(null)

  if (!group || !current) return null

  const isMember = group.memberIds.includes(current.id)

  const pendingForGroup = useMemo(
    () =>
      invites.filter((i) => i.groupId === group.id && i.status === 'pending'),
    [invites, group.id],
  )
  const pendingInviteUsers = pendingForGroup
    .map((i) => users.find((u) => u.id === i.toUserId))
    .filter((u): u is User => !!u)

  const members = users.filter((u) => group.memberIds.includes(u.id))

  function attemptRemove(user: User) {
    const userNet = net[user.id] ?? 0
    if (Math.abs(userNet) > 1) {
      setRemoveTarget(user)
    } else {
      removeMember(group!.id, user.id)
      toast.info(`${user.name} removed from group`)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-xl font-semibold">Members</h2>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length === 1 ? '' : 's'}
            {pendingInviteUsers.length > 0
              ? ` · ${pendingInviteUsers.length} pending invite${pendingInviteUsers.length === 1 ? '' : 's'}`
              : ''}
          </p>
        </div>
        {isMember && (
          <InviteMemberDialog group={group} inviter={current}>
            <Button size="sm">
              <UserPlus className="h-4 w-4" /> Invite member
            </Button>
          </InviteMemberDialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border/60">
          {members.map((m) => {
            const balance = net[m.id] ?? 0
            const isCreator = m.id === group.createdBy
            const canRemove =
              isMember &&
              m.id !== group.createdBy &&
              (current.id === group.createdBy || current.id === m.id)
            return (
              <div key={m.id} className="flex items-center gap-3 p-4">
                <UserAvatar user={m} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{m.name}</span>
                    {isCreator ? (
                      <Badge variant="crust" className="gap-1">
                        <Crown className="h-3 w-3" /> Creator
                      </Badge>
                    ) : null}
                    {m.id === current.id ? <Badge variant="outline">You</Badge> : null}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                </div>
                <BalanceTag cents={balance} preferences={preferences} />
                {canRemove ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => attemptRemove(m)}>
                        <UserMinus className="h-4 w-4" />
                        {m.id === current.id ? 'Leave group' : 'Remove from group'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {pendingInviteUsers.length > 0 ? (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Pending invites
          </h3>
          <ul className="mt-2 space-y-1.5">
            {pendingForGroup.map((inv) => {
              const u = users.find((x) => x.id === inv.toUserId)
              if (!u) return null
              return (
                <li
                  key={inv.id}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-background/40 px-3 py-2"
                >
                  <UserAvatar user={u} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <Dialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settle up before removing</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{removeTarget?.name}</span> has an
              outstanding balance of{' '}
              <span className="font-semibold">
                {removeTarget &&
                  formatCents(Math.abs(net[removeTarget.id] ?? 0), preferences)}
              </span>
              . Use Settle Up to record payments, or wait until the balance is zero.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BalanceTag({
  cents,
  preferences,
}: {
  cents: number
  preferences: { currency: string; locale: string }
}) {
  if (Math.abs(cents) <= 1) {
    return <span className="text-xs text-muted-foreground">Settled</span>
  }
  const owed = cents > 0
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {owed ? 'Is owed' : 'Owes'}
      </div>
      <div
        className={`text-sm font-semibold tabular-nums ${
          owed ? 'text-[hsl(var(--success))]' : 'text-destructive'
        }`}
      >
        {formatCents(Math.abs(cents), preferences)}
      </div>
    </div>
  )
}
