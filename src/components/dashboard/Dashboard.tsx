import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Layers,
  PiggyBank,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { useStore } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { computeNetBalances } from '@/lib/balances'
import { formatCents } from '@/lib/currency'
import { formatDistanceToNow } from 'date-fns'

export function Dashboard() {
  const current = useCurrentUser()
  const groups = useStore((s) => s.groups)
  const expenses = useStore((s) => s.expenses)
  const settlements = useStore((s) => s.settlements)
  const usersCount = useStore((s) => s.users.length)
  const invites = useStore((s) => s.invites)
  const preferences = useStore((s) => s.preferences)

  const myGroups = useMemo(
    () => groups.filter((g) => current && g.memberIds.includes(current.id)),
    [groups, current],
  )

  const { youAreOwed, youOwe, perGroup } = useMemo(() => {
    if (!current) return { youAreOwed: 0, youOwe: 0, perGroup: [] as PerGroupRow[] }
    let owed = 0
    let owe = 0
    const rows: PerGroupRow[] = []
    for (const g of myGroups) {
      const groupExpenses = expenses.filter((e) => e.groupId === g.id)
      const groupSettlements = settlements.filter((s) => s.groupId === g.id)
      const net = computeNetBalances(g.memberIds, groupExpenses, groupSettlements)
      const myNet = net[current.id] ?? 0
      if (myNet > 0) owed += myNet
      else owe += -myNet
      rows.push({ groupId: g.id, name: g.name, myNet, members: g.memberIds.length })
    }
    rows.sort((a, b) => Math.abs(b.myNet) - Math.abs(a.myNet))
    return { youAreOwed: owed, youOwe: owe, perGroup: rows }
  }, [myGroups, expenses, settlements, current])

  const pendingInvites = useMemo(() => {
    if (!current) return []
    return invites.filter((i) => i.toUserId === current.id && i.status === 'pending')
  }, [invites, current])

  const recentActivity = useMemo(() => {
    if (!current) return [] as Array<{ kind: 'expense'; at: number; title: string; groupName: string; amount: number }>
    const myGroupIds = new Set(myGroups.map((g) => g.id))
    const acts: Array<{ kind: 'expense'; at: number; title: string; groupName: string; amount: number }> = []
    for (const e of expenses) {
      if (!myGroupIds.has(e.groupId)) continue
      const g = groups.find((x) => x.id === e.groupId)
      acts.push({ kind: 'expense', at: e.createdAt, title: e.title, groupName: g?.name ?? '', amount: e.amountCents })
    }
    acts.sort((a, b) => b.at - a.at)
    return acts.slice(0, 5)
  }, [expenses, myGroups, groups, current])

  if (!current) return null

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-balance">
            Hi {current.name.split(' ')[0]} —{' '}
            <span className="text-accent">how’s the pie?</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/app/groups/new">
              <Plus className="h-4 w-4" /> New group
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/groups">
              <Layers className="h-4 w-4" /> View all
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-pie-radial">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--success))]" /> You’re owed
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-cocoa">
              {formatCents(youAreOwed, preferences)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Across {perGroup.filter((r) => r.myNet > 0).length} group
            {perGroup.filter((r) => r.myNet > 0).length === 1 ? '' : 's'}.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-destructive" /> You owe
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums text-cocoa">
              {formatCents(youOwe, preferences)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Across {perGroup.filter((r) => r.myNet < 0).length} group
            {perGroup.filter((r) => r.myNet < 0).length === 1 ? '' : 's'}.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <PiggyBank className="h-4 w-4 text-accent" /> Net position
            </CardDescription>
            <CardTitle
              className={`text-3xl tabular-nums ${
                youAreOwed - youOwe >= 0 ? 'text-[hsl(var(--success))]' : 'text-destructive'
              }`}
            >
              {formatCents(youAreOwed - youOwe, preferences)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Across {myGroups.length} group{myGroups.length === 1 ? '' : 's'}.
          </CardContent>
        </Card>
      </div>

      {pendingInvites.length > 0 && (
        <Card className="border-accent/40 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-4 w-4 text-accent" /> Pending invites
            </CardTitle>
            <CardDescription>
              You have {pendingInvites.length} invitation
              {pendingInvites.length === 1 ? '' : 's'} waiting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="berry" size="sm">
              <Link to="/app/invites">
                Review invites <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Your groups</CardTitle>
                <CardDescription>Where the bills are being split.</CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link to="/app/groups">
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myGroups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No groups yet"
                description="Start a group with your friends, roommates, or trip mates."
                action={
                  <Button asChild>
                    <Link to="/app/groups/new">
                      <Plus className="h-4 w-4" /> Create your first group
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2">
                {perGroup.map((row, i) => (
                  <motion.li
                    key={row.groupId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to="/app/groups/$groupId"
                      params={{ groupId: row.groupId }}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3 hover:bg-accent/5 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.members} members</div>
                      </div>
                      <BalancePill cents={row.myNet} preferences={preferences} />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest expenses in your groups.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No recent activity"
                description="Once your group has a bill, it’ll show up here."
              />
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((a, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium leading-tight">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.groupName} ·{' '}
                        {formatDistanceToNow(new Date(a.at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatCents(a.amount, preferences)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <UsersHint usersCount={usersCount} />
    </div>
  )
}

type PerGroupRow = { groupId: string; name: string; myNet: number; members: number }

function BalancePill({
  cents,
  preferences,
}: {
  cents: number
  preferences: { currency: string; locale: string }
}) {
  if (cents === 0) {
    return <Badge variant="secondary">Settled</Badge>
  }
  const owed = cents > 0
  return (
    <div
      className={`text-right tabular-nums ${
        owed ? 'text-[hsl(var(--success))]' : 'text-destructive'
      }`}
    >
      <div className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
        {owed ? 'You’re owed' : 'You owe'}
      </div>
      <div className="text-base font-semibold">
        {formatCents(Math.abs(cents), preferences)}
      </div>
    </div>
  )
}

function UsersHint({ usersCount }: { usersCount: number }) {
  if (usersCount > 1) return null
  return (
    <Card className="bg-filling/60 border-dashed">
      <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">Demo tip · add another account</CardTitle>
          <CardDescription className="mt-1">
            Pie simulates multiple users on this device. Register a second account to invite,
            accept, and settle — all without leaving the app.
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link to="/register">
            <Plus className="h-4 w-4" /> Add another user
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

