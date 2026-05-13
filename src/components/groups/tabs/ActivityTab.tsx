import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { ArrowRight, HandCoins, UserPlus, Activity as ActivityIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useStore } from '@/store'
import { useGroupContext } from '@/hooks/useGroupContext'
import { formatCents } from '@/lib/currency'
import { CATEGORY_META } from '@/components/expenses/categories'
import type { User } from '@/types'

type ActivityItem =
  | {
      kind: 'expense'
      at: number
      id: string
      title: string
      amountCents: number
      paidBy: string
      categoryIcon: React.ComponentType<{ className?: string }>
      categoryLabel: string
    }
  | {
      kind: 'settlement'
      at: number
      id: string
      from: string
      to: string
      amountCents: number
      note?: string
    }
  | {
      kind: 'join'
      at: number
      id: string
      userId: string
    }

export function ActivityTab() {
  const { group, members } = useGroupContext()
  const expenses = useStore((s) =>
    group ? s.expenses.filter((e) => e.groupId === group.id) : [],
  )
  const settlements = useStore((s) =>
    group ? s.settlements.filter((st) => st.groupId === group.id) : [],
  )
  const invites = useStore((s) =>
    group ? s.invites.filter((i) => i.groupId === group.id && i.status === 'accepted') : [],
  )
  const preferences = useStore((s) => s.preferences)

  const items = useMemo<ActivityItem[]>(() => {
    if (!group) return []
    const out: ActivityItem[] = []
    for (const e of expenses) {
      const meta = CATEGORY_META[e.category]
      out.push({
        kind: 'expense',
        at: e.createdAt,
        id: e.id,
        title: e.title,
        amountCents: e.amountCents,
        paidBy: e.paidBy,
        categoryIcon: meta.icon,
        categoryLabel: meta.label,
      })
    }
    for (const s of settlements) {
      out.push({
        kind: 'settlement',
        at: s.createdAt,
        id: s.id,
        from: s.fromUserId,
        to: s.toUserId,
        amountCents: s.amountCents,
        note: s.note,
      })
    }
    // Creator joined at group creation; accepted invites count as joins.
    out.push({ kind: 'join', at: group.createdAt, id: `creator-${group.id}`, userId: group.createdBy })
    for (const i of invites) {
      out.push({
        kind: 'join',
        at: i.respondedAt ?? i.createdAt,
        id: `inv-${i.id}`,
        userId: i.toUserId,
      })
    }
    out.sort((a, b) => b.at - a.at)
    return out
  }, [expenses, settlements, invites, group])

  if (!group) return null
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No activity yet"
        description="Expenses, payments, and joiners will show up here."
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Everything that happened in this group, newest first.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
          >
            <ActivityRow item={item} members={members} preferences={preferences} />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

function ActivityRow({
  item,
  members,
  preferences,
}: {
  item: ActivityItem
  members: User[]
  preferences: { currency: string; locale: string }
}) {
  if (item.kind === 'expense') {
    const Icon = item.categoryIcon
    const payer = members.find((m) => m.id === item.paidBy)
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/25 text-cocoa shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm">
            <span className="font-semibold">{payer?.name ?? 'Someone'}</span> added{' '}
            <span className="font-semibold">“{item.title}”</span>{' '}
            <span className="text-muted-foreground">in {item.categoryLabel.toLowerCase()}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(item.at), 'MMM d, p')} ·{' '}
            {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
          </div>
        </div>
        <div className="text-sm font-semibold tabular-nums shrink-0">
          {formatCents(item.amountCents, preferences)}
        </div>
      </div>
    )
  }
  if (item.kind === 'settlement') {
    const from = members.find((m) => m.id === item.from)
    const to = members.find((m) => m.id === item.to)
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--success)/0.18)] text-[hsl(var(--success))] shrink-0">
          <HandCoins className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm flex flex-wrap items-center gap-1">
            <span className="font-semibold">{from?.name ?? '?'}</span>
            <span className="text-muted-foreground">paid</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold">{to?.name ?? '?'}</span>
            {item.note ? (
              <span className="text-xs text-muted-foreground">· {item.note}</span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
          </div>
        </div>
        <div className="text-sm font-semibold tabular-nums shrink-0 text-[hsl(var(--success))]">
          {formatCents(item.amountCents, preferences)}
        </div>
      </div>
    )
  }
  // join
  const u = members.find((m) => m.id === item.userId)
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent shrink-0">
        <UserPlus className="h-4 w-4" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        {u ? <UserAvatar user={u} size="xs" /> : null}
        <div>
          <div className="text-sm">
            <span className="font-semibold">{u?.name ?? 'Member'}</span>{' '}
            <span className="text-muted-foreground">joined the group</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  )
}

