import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import { CATEGORY_META, CATEGORY_ORDER } from '@/components/expenses/categories'
import { useStore } from '@/store'
import { formatCents } from '@/lib/currency'
import type { Expense } from '@/types'

interface CategoryPieProps {
  expenses: Expense[]
}

const PALETTE = [
  'hsl(22 70% 70%)',
  'hsl(351 50% 65%)',
  'hsl(200 60% 70%)',
  'hsl(95 45% 65%)',
  'hsl(45 70% 70%)',
  'hsl(280 40% 72%)',
  'hsl(340 60% 72%)',
  'hsl(150 45% 65%)',
  'hsl(15 70% 70%)',
]

export function CategoryPie({ expenses }: CategoryPieProps) {
  const preferences = useStore((s) => s.preferences)
  const data = useMemo(() => {
    const totals = new Map<string, number>()
    let grandTotal = 0
    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amountCents)
      grandTotal += e.amountCents
    }
    return CATEGORY_ORDER.filter((c) => totals.has(c)).map((c, i) => ({
      key: c,
      label: CATEGORY_META[c].label,
      value: totals.get(c) ?? 0,
      pct: grandTotal > 0 ? ((totals.get(c) ?? 0) / grandTotal) * 100 : 0,
      color: PALETTE[i % PALETTE.length],
    }))
  }, [expenses])

  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <PieIcon className="h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="font-serif text-lg font-semibold">Spending by category</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some expenses to see the breakdown.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-serif text-lg font-semibold flex items-center gap-2">
        <PieIcon className="h-4 w-4 text-accent" /> Spending by category
      </h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Total {formatCents(total, preferences)}
      </p>
      <div className="mt-3 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={42}
              outerRadius={70}
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                borderRadius: 12,
                border: '1px solid hsl(var(--border))',
                fontSize: 12,
              }}
              formatter={(value: number) => formatCents(value, preferences)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 truncate">{d.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {formatCents(d.value, preferences)} · {d.pct.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
