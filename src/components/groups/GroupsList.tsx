import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { GroupCard } from '@/components/groups/GroupCard'
import { useStore } from '@/store'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { computeNetBalances } from '@/lib/balances'

export function GroupsList() {
  const current = useCurrentUser()
  const groups = useStore((s) => s.groups)
  const expenses = useStore((s) => s.expenses)
  const settlements = useStore((s) => s.settlements)

  const rows = useMemo(() => {
    if (!current) return []
    return groups
      .filter((g) => g.memberIds.includes(current.id))
      .map((g) => {
        const net = computeNetBalances(
          g.memberIds,
          expenses.filter((e) => e.groupId === g.id),
          settlements.filter((s) => s.groupId === g.id),
        )
        return { group: g, myNet: net[current.id] ?? 0 }
      })
      .sort((a, b) => b.group.createdAt - a.group.createdAt)
  }, [groups, expenses, settlements, current])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Your groups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            One slice for each shared bill: a trip, a household, a weekly dinner.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/groups/new">
            <Plus className="h-4 w-4" /> New group
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Start your first group — invite friends, add bills, and let Pie do the math."
          action={
            <Button asChild>
              <Link to="/app/groups/new">
                <Plus className="h-4 w-4" /> Create a group
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((row, i) => (
            <motion.div
              key={row.group.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GroupCard group={row.group} myNetCents={row.myNet} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
