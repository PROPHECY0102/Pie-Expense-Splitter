import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Check, Inbox, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/common/EmptyState'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { formatDistanceToNow } from 'date-fns'
import { GroupIcon } from '@/components/groups/GroupIcon'

export function InvitesPage() {
  const current = useCurrentUser()
  const invites = useStore((s) => s.invites)
  const groups = useStore((s) => s.groups)
  const users = useStore((s) => s.users)
  const acceptInvite = useStore((s) => s.acceptInvite)
  const declineInvite = useStore((s) => s.declineInvite)
  const cancelInvite = useStore((s) => s.cancelInvite)

  const incoming = useMemo(() => {
    if (!current) return []
    return invites
      .filter((i) => i.toUserId === current.id && i.status === 'pending')
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [invites, current])

  const outgoing = useMemo(() => {
    if (!current) return []
    return invites
      .filter((i) => i.fromUserId === current.id)
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [invites, current])

  if (!current) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Invites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Accept invitations to join groups or review the ones you’ve sent.
        </p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            <Inbox className="h-4 w-4" /> Incoming
            {incoming.length > 0 ? (
              <Badge variant="berry" className="ml-2">
                {incoming.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            <Send className="h-4 w-4" /> Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          {incoming.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No incoming invites"
              description="When friends invite you to a group, you’ll see it here."
            />
          ) : (
            <ul className="space-y-3">
              {incoming.map((inv, i) => {
                const group = groups.find((g) => g.id === inv.groupId)
                const from = users.find((u) => u.id === inv.fromUserId)
                if (!group || !from) return null
                return (
                  <motion.li
                    key={inv.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/25 text-cocoa shrink-0">
                            <GroupIcon iconKey={group.iconKey} />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl">{group.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <UserAvatar user={from} size="xs" />
                              <span>
                                {from.name} invited you ·{' '}
                                {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            declineInvite(inv.id)
                            toast.info('Invitation declined')
                          }}
                        >
                          <X className="h-4 w-4" /> Decline
                        </Button>
                        <Button
                          variant="berry"
                          onClick={() => {
                            acceptInvite(inv.id)
                            toast.success(`Joined ${group.name}`)
                          }}
                        >
                          <Check className="h-4 w-4" /> Accept
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.li>
                )
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="outgoing">
          {outgoing.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No invites sent"
              description="Open a group → Members → Invite to send one."
            />
          ) : (
            <ul className="space-y-2">
              {outgoing.map((inv) => {
                const group = groups.find((g) => g.id === inv.groupId)
                const to = users.find((u) => u.id === inv.toUserId)
                if (!group || !to) return null
                return (
                  <li
                    key={inv.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card/70 px-4 py-3"
                  >
                    <UserAvatar user={to} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {to.name} · {group.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sent {formatDistanceToNow(new Date(inv.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {inv.status === 'pending' ? (
                      <>
                        <Badge variant="outline">Pending</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            cancelInvite(inv.id)
                            toast.info('Invitation withdrawn')
                          }}
                        >
                          Withdraw
                        </Button>
                      </>
                    ) : inv.status === 'accepted' ? (
                      <Badge variant="success">Accepted</Badge>
                    ) : (
                      <Badge variant="secondary">Declined</Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
