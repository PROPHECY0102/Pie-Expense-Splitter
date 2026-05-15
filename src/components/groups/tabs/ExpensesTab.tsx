import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Plus, Receipt, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { CATEGORY_META } from '@/components/expenses/categories'
import { useStore } from '@/store'
import { useGroupContext } from '@/hooks/useGroupContext'
import { useCurrentUserId } from '@/hooks/useCurrentUser'
import { formatCents } from '@/lib/currency'
import { format } from 'date-fns'
import { CategoryPie } from '@/components/charts/CategoryPie'

export function ExpensesTab() {
  const { group } = useGroupContext()
  const currentUserId = useCurrentUserId()
  const allExpenses = useStore((s) => s.expenses)
  const users = useStore((s) => s.users)
  const preferences = useStore((s) => s.preferences)
  const expenses = useMemo(
    () => (group ? allExpenses.filter((e) => e.groupId === group.id) : []),
    [group, allExpenses],
  )

  const sorted = useMemo(
    () => [...expenses].sort((a, b) => b.date - a.date || b.createdAt - a.createdAt),
    [expenses],
  )

  if (!group) return null

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses yet"
        description="Add the first expense to start tracking who owes who."
        action={
          <Button asChild>
            <Link to="/app/groups/$groupId/expenses/new" params={{ groupId: group.id }}>
              <Plus className="h-4 w-4" /> Add expense
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-[1.5fr,1fr] gap-5">
      <div className="space-y-1.5">
        {sorted.map((e, i) => {
          const meta = CATEGORY_META[e.category]
          const payer = users.find((u) => u.id === e.paidBy)
          const myShare = currentUserId
            ? e.splits.find((s) => s.userId === currentUserId)?.amountCents ?? 0
            : 0
          const iPaid = e.paidBy === currentUserId
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link
                to="/app/groups/$groupId/expenses/$expenseId"
                params={{ groupId: group.id, expenseId: e.id }}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card/80 px-4 py-3 hover:border-accent/40 hover:bg-accent/5 transition-colors"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-cocoa ${meta.tint}/80`}
                >
                  <meta.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{e.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {payer ? `${payer.name} paid` : 'Paid'} · {format(new Date(e.date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-semibold tabular-nums">
                    {formatCents(e.amountCents, preferences)}
                  </div>
                  {currentUserId && myShare > 0 ? (
                    <div
                      className={`text-xs tabular-nums ${
                        iPaid ? 'text-[hsl(var(--success))]' : 'text-muted-foreground'
                      }`}
                    >
                      {iPaid
                        ? `You lent ${formatCents(e.amountCents - myShare, preferences)}`
                        : `Your share ${formatCents(myShare, preferences)}`}
                    </div>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <CategoryPie expenses={sorted} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
