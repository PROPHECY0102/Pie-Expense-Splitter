import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/store'
import { useCurrentUserId } from '@/hooks/useCurrentUser'
import { useGroupContext } from '@/hooks/useGroupContext'
import { CATEGORY_META, CATEGORY_ORDER } from '@/components/expenses/categories'
import {
  SplitEditor,
  useSplitError,
} from '@/components/expenses/SplitEditors'
import {
  currencySymbol,
  formatCents,
  parseCurrencyToCents,
} from '@/lib/currency'
import { UserAvatar } from '@/components/common/UserAvatar'
import type { ID, SplitMethod, ExpenseCategory } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  amount: z.string().min(1, 'Amount is required'),
  paidBy: z.string().min(1),
  category: z.string().min(1),
  date: z.string().min(1),
  notes: z.string().max(300).optional(),
})

type FormValues = z.infer<typeof schema>

interface ExpenseFormPageProps {
  mode: 'create' | 'edit'
}

export function ExpenseFormPage({ mode }: ExpenseFormPageProps) {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { groupId?: string; expenseId?: string }
  const groupId = params.groupId
  const expenseId = params.expenseId
  const { group, members } = useGroupContext()
  const currentUserId = useCurrentUserId()
  const preferences = useStore((s) => s.preferences)
  const addExpense = useStore((s) => s.addExpense)
  const updateExpense = useStore((s) => s.updateExpense)
  const deleteExpense = useStore((s) => s.deleteExpense)
  const existing = useStore((s) =>
    expenseId ? s.expenses.find((e) => e.id === expenseId) : undefined,
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [method, setMethod] = useState<SplitMethod>(existing?.splitMethod ?? 'equal')
  const [inputs, setInputs] = useState<Record<ID, number>>(() => {
    if (existing) {
      const map: Record<ID, number> = {}
      for (const split of existing.splits) map[split.userId] = split.input
      return map
    }
    return {}
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existing
      ? {
          title: existing.title,
          amount: (existing.amountCents / 100).toString(),
          paidBy: existing.paidBy,
          category: existing.category,
          date: new Date(existing.date).toISOString().slice(0, 10),
          notes: existing.notes ?? '',
        }
      : {
          title: '',
          amount: '',
          paidBy: currentUserId ?? '',
          category: 'food',
          date: new Date().toISOString().slice(0, 10),
          notes: '',
        },
  })

  // Default split inputs when in create mode: all-in equal.
  useEffect(() => {
    if (mode === 'create' && members.length && Object.keys(inputs).length === 0) {
      setInputs(Object.fromEntries(members.map((m) => [m.id, 1])))
    }
  }, [mode, members, inputs])

  const totalCents = useMemo(() => {
    const cents = parseCurrencyToCents(form.watch('amount'))
    return Number.isFinite(cents) ? cents : 0
  }, [form.watch('amount')])

  const splitError = useSplitError(method, inputs, totalCents)

  if (!groupId || !group || !currentUserId) return null

  function onSubmit(values: FormValues) {
    const amountCents = parseCurrencyToCents(values.amount)
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      form.setError('amount', { message: 'Enter a valid amount greater than 0' })
      return
    }
    if (splitError) {
      toast.error(splitError)
      return
    }
    const dateMs = new Date(values.date).getTime()
    const payload = {
      groupId: groupId!,
      title: values.title,
      amountCents,
      category: values.category as ExpenseCategory,
      date: dateMs,
      notes: values.notes,
      paidBy: values.paidBy,
      splitMethod: method,
      inputs,
      createdBy: currentUserId!,
    }
    if (mode === 'create') {
      addExpense(payload)
      toast.success('Expense added')
    } else if (existing) {
      updateExpense(existing.id, payload)
      toast.success('Expense updated')
    }
    navigate({ to: '/app/groups/$groupId', params: { groupId: groupId! } })
  }

  function onDelete() {
    if (!existing) return
    deleteExpense(existing.id)
    toast.info('Expense deleted')
    navigate({ to: '/app/groups/$groupId', params: { groupId: groupId! } })
  }

  function onMethodChange(value: string) {
    if (!value) return
    const next = value as SplitMethod
    setMethod(next)
    // Reset inputs to sensible defaults for the new method.
    if (next === 'equal') {
      setInputs(Object.fromEntries(members.map((m) => [m.id, 1])))
    } else if (next === 'exact') {
      const per = totalCents > 0 ? Math.floor(totalCents / members.length) : 0
      const remainder = totalCents - per * members.length
      setInputs(
        Object.fromEntries(
          members.map((m, i) => [m.id, per + (i < remainder ? 1 : 0)]),
        ),
      )
    } else if (next === 'percentage') {
      const per = Math.floor(10000 / members.length)
      const remainder = 10000 - per * members.length
      setInputs(
        Object.fromEntries(
          members.map((m, i) => [m.id, per + (i < remainder ? 1 : 0)]),
        ),
      )
    } else if (next === 'shares') {
      setInputs(Object.fromEntries(members.map((m) => [m.id, 1])))
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/groups/$groupId" params={{ groupId }}>
            <ArrowLeft className="h-4 w-4" /> Back to group
          </Link>
        </Button>
        <h1 className="mt-3 font-serif text-3xl font-semibold">
          {mode === 'create' ? 'Add expense' : 'Edit expense'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adding to <span className="font-medium text-foreground">{group.name}</span>
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Dinner at Trattoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {currencySymbol(preferences.currency, preferences.locale)}
                        </span>
                        <Input
                          inputMode="decimal"
                          placeholder="0.00"
                          className="pl-7 tabular-nums"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paidBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid by</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Who paid?" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <span className="inline-flex items-center gap-2">
                                <UserAvatar user={m} size="xs" />
                                {m.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_ORDER.map((c) => {
                            const meta = CATEGORY_META[c]
                            return (
                              <SelectItem key={c} value={c}>
                                <span className="inline-flex items-center gap-2">
                                  <meta.icon className="h-3.5 w-3.5" />
                                  {meta.label}
                                </span>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tip details, receipt info, etc." rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">How should it split?</CardTitle>
              <CardDescription>
                Pie supports four methods. Try them — share previews update live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleGroup
                type="single"
                value={method}
                onValueChange={onMethodChange}
                className="w-full"
              >
                <ToggleGroupItem value="equal">Equal</ToggleGroupItem>
                <ToggleGroupItem value="exact">Exact</ToggleGroupItem>
                <ToggleGroupItem value="percentage">Percent</ToggleGroupItem>
                <ToggleGroupItem value="shares">Shares</ToggleGroupItem>
              </ToggleGroup>

              <SplitEditor
                method={method}
                members={members}
                inputs={inputs}
                onChange={setInputs}
                totalCents={totalCents}
                preferences={preferences}
              />

              {splitError ? (
                <p className="text-sm text-destructive font-medium">{splitError}</p>
              ) : (
                <p className="text-sm text-[hsl(var(--success))] font-medium">
                  Total: {formatCents(totalCents, preferences)} · split balanced ✓
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDelete(true)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  navigate({ to: '/app/groups/$groupId', params: { groupId } })
                }
              >
                Cancel
              </Button>
            </div>
            <Button type="submit" size="lg">
              {mode === 'create' ? 'Add expense' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this expense?</DialogTitle>
            <DialogDescription>
              This removes the expense and recomputes everyone’s balances. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
