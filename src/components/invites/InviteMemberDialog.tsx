import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { UserPlus, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useStore } from '@/store'
import type { ID, Group, User } from '@/types'

interface InviteMemberDialogProps {
  group: Group
  inviter: User
  children?: React.ReactNode
}

export function InviteMemberDialog({ group, inviter, children }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const users = useStore((s) => s.users)
  const invites = useStore((s) => s.invites)
  const sendInvite = useStore((s) => s.sendInvite)

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users
      .filter((u) => u.id !== inviter.id)
      .filter((u) => !group.memberIds.includes(u.id))
      .filter((u) => {
        if (!q) return true
        return (
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        )
      })
  }, [users, group.memberIds, inviter.id, query])

  function pendingFor(userId: ID): boolean {
    return invites.some(
      (i) => i.groupId === group.id && i.toUserId === userId && i.status === 'pending',
    )
  }

  function invite(user: User) {
    const inv = sendInvite({ groupId: group.id, fromUserId: inviter.id, toUserId: user.id })
    if (inv) toast.success(`Invitation sent to ${user.name}`)
    else toast.info(`${user.name} already has a pending invite or is a member`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" variant="outline">
            <UserPlus className="h-4 w-4" /> Invite member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people to {group.name}</DialogTitle>
          <DialogDescription>
            Send an invite to any registered account on this device. They’ll see it under their
            Invites once they switch in.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
        />
        <div className="max-h-64 overflow-y-auto -mx-2 px-2">
          {candidates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background/40 p-4 text-center text-sm text-muted-foreground">
              <Mail className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              {users.length <= 1
                ? 'Register more accounts to invite. Use the “Add another account” link in your avatar menu.'
                : 'No more candidates — everyone matching is already a member or invited.'}
            </div>
          ) : (
            <ul className="space-y-1">
              {candidates.map((u) => {
                const pending = pendingFor(u.id)
                return (
                  <li key={u.id}>
                    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/5">
                      <UserAvatar user={u} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                      {pending ? (
                        <span className="text-xs text-muted-foreground">Invite sent</span>
                      ) : (
                        <Button size="sm" variant="berry" onClick={() => invite(u)}>
                          Invite
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
