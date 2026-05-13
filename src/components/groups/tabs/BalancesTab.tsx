import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/UserAvatar'
import { EmptyState } from '@/components/common/EmptyState'
import { useStore } from '@/store'
import { useGroupContext } from '@/hooks/useGroupContext'
import { useGroupBalances } from '@/hooks/useGroupBalances'
import { formatCents } from '@/lib/currency'

export function BalancesTab() {
  const { group, members } = useGroupContext()
  const preferences = useStore((s) => s.preferences)
  const { net, pairs, simplified } = useGroupBalances(group?.id)

  if (!group) return null

  const totals = members.map((m) => ({ user: m, cents: net[m.id] ?? 0 }))
  totals.sort((a, b) => b.cents - a.cents)

  const allSettled = totals.every((t) => Math.abs(t.cents) <= 1)

  if (members.length <= 1 || allSettled) {
    return (
      <div className="grid lg:grid-cols-2 gap-5">
        <EmptyState
          icon={Scale}
          title={allSettled ? 'Everyone’s settled' : 'No balances yet'}
          description={
            allSettled
              ? 'No outstanding debts in this group right now.'
              : 'Invite members and add expenses to see balances.'
          }
        />
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Net balances</CardTitle>
          <CardDescription>
            Who’s up and who’s down across this whole group.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {totals.map((t, i) => (
            <motion.div
              key={t.user.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5"
            >
              <UserAvatar user={t.user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.user.name}</div>
              </div>
              {Math.abs(t.cents) <= 1 ? (
                <Badge variant="secondary">Settled</Badge>
              ) : t.cents > 0 ? (
                <Badge variant="success" className="tabular-nums">
                  +{formatCents(t.cents, preferences)}
                </Badge>
              ) : (
                <Badge variant="destructive" className="tabular-nums">
                  −{formatCents(-t.cents, preferences)}
                </Badge>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Suggested payments</CardTitle>
              <CardDescription>
                Pie simplified {pairs.length} raw debt
                {pairs.length === 1 ? '' : 's'} into {simplified.length} payment
                {simplified.length === 1 ? '' : 's'}.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="berry">
              <Link to="/app/groups/$groupId/settle" params={{ groupId: group.id }}>
                Settle up
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {simplified.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No outstanding payments — everything balances out.
            </p>
          ) : (
            <ul className="space-y-2">
              {simplified.map((tx, i) => {
                const from = members.find((m) => m.id === tx.from)
                const to = members.find((m) => m.id === tx.to)
                if (!from || !to) return null
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5"
                  >
                    <UserAvatar user={from} size="sm" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <UserAvatar user={to} size="sm" />
                    <div className="flex-1 min-w-0 text-sm">
                      <span className="font-semibold">{from.name}</span>{' '}
                      <span className="text-muted-foreground">pays</span>{' '}
                      <span className="font-semibold">{to.name}</span>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatCents(tx.amountCents, preferences)}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {pairs.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Raw pairwise debts</CardTitle>
            <CardDescription>
              Useful for auditing — every direct IOU between two members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-2">
              {pairs.map((p, i) => {
                const from = members.find((m) => m.id === p.debtor)
                const to = members.find((m) => m.id === p.creditor)
                if (!from || !to) return null
                return (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5"
                  >
                    <UserAvatar user={from} size="xs" />
                    <span className="text-xs text-muted-foreground">owes</span>
                    <UserAvatar user={to} size="xs" />
                    <div className="flex-1 min-w-0 text-sm truncate">
                      <span className="font-medium">{from.name}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="font-medium">{to.name}</span>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatCents(p.amountCents, preferences)}
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
