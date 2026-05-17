import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ArrowLeft, HandCoins } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/common/UserAvatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/store'
import { useCurrentUserId } from '@/hooks/useCurrentUser'
import { useGroupContext } from '@/hooks/useGroupContext'
import { useGroupBalances } from '@/hooks/useGroupBalances'
import { formatCents, parseCurrencyToCents, currencySymbol } from '@/lib/currency'
import type { DebtTransaction } from '@/lib/simplify-debts'
import type { User } from '@/types'

export function SettleUp() {
  const { group, members } = useGroupContext()
  const currentUserId = useCurrentUserId()
  const preferences = useStore((s) => s.preferences)
  const recordSettlement = useStore((s) => s.recordSettlement)
  const { simplified } = useGroupBalances(group?.id)

  const [recordOpen, setRecordOpen] = useState(false)
  const [prefilled, setPrefilled] = useState<DebtTransaction | null>(null)

  const mine = useMemo(() => {
    if (!currentUserId) return [] as DebtTransaction[]
    return simplified.filter(
      (t) => t.from === currentUserId || t.to === currentUserId,
    )
  }, [simplified, currentUserId])

  const others = useMemo(
    () =>
      simplified.filter(
        (t) =>
          currentUserId && t.from !== currentUserId && t.to !== currentUserId,
      ),
    [simplified, currentUserId],
  )

  if (!group || !currentUserId) return null

  function record(tx?: DebtTransaction) {
    setPrefilled(tx ?? null)
    setRecordOpen(true)
  }

  function totalTxValue() {
    return simplified.reduce((acc, t) => acc + t.amountCents, 0)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/groups/$groupId" params={{ groupId: group.id }}>
            <ArrowLeft className="h-4 w-4" /> Back to group
          </Link>
        </Button>
        <h1 className="mt-3 font-serif text-3xl font-semibold">Settle up</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pie suggests the minimum number of payments to zero out everyone’s debts. Mark them paid
          when money moves.
        </p>
      </div>

      {simplified.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <HandCoins className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-serif text-xl font-semibold">All settled up 🎉</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No outstanding payments in this group right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-pie-radial">
            <CardHeader>
              <CardTitle>{simplified.length} suggested payment{simplified.length === 1 ? '' : 's'}</CardTitle>
              <CardDescription>
                Total amount in motion: {formatCents(totalTxValue(), preferences)}
              </CardDescription>
            </CardHeader>
          </Card>

          {mine.length > 0 && (
            <SectionList
              title="Involving you"
              subtitle="Pay or receive — then mark it done."
              currentUserId={currentUserId}
              txs={mine}
              members={members}
              preferences={preferences}
              onRecord={(t) => record(t)}
            />
          )}

          {others.length > 0 && (
            <SectionList
              title="Between others"
              subtitle="Watch the room — but you can still record on their behalf."
              currentUserId={currentUserId}
              txs={others}
              members={members}
              preferences={preferences}
              onRecord={(t) => record(t)}
            />
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => record()}>
              Record a custom payment
            </Button>
          </div>
        </>
      )}

      <RecordSettlementDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        prefilled={prefilled}
        members={members}
        currentUserId={currentUserId}
        onSubmit={(p) => {
          if (!group) return
          recordSettlement({
            groupId: group.id,
            fromUserId: p.fromUserId,
            toUserId: p.toUserId,
            amountCents: p.amountCents,
            note: p.note,
            recordedBy: currentUserId!,
          })
          toast.success('Payment recorded')
          setRecordOpen(false)
        }}
      />
    </div>
  )
}

function SectionList({
  title,
  subtitle,
  txs,
  members,
  preferences,
  currentUserId,
  onRecord,
}: {
  title: string
  subtitle: string
  txs: DebtTransaction[]
  members: User[]
  preferences: { currency: string; locale: string }
  currentUserId: string
  onRecord: (tx: DebtTransaction) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {txs.map((tx, i) => {
          const from = members.find((m) => m.id === tx.from)
          const to = members.find((m) => m.id === tx.to)
          if (!from || !to) return null
          const meIsFrom = tx.from === currentUserId
          const meIsTo = tx.to === currentUserId
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
            >
              <UserAvatar user={from} size="sm" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <UserAvatar user={to} size="sm" />
              <div className="flex-1 min-w-0 text-sm">
                <span className="font-semibold">{meIsFrom ? 'You' : from.name}</span>{' '}
                <span className="text-muted-foreground">pay{meIsFrom ? '' : 's'}</span>{' '}
                <span className="font-semibold">{meIsTo ? 'you' : to.name}</span>
              </div>
              <div className="text-base font-semibold tabular-nums">
                {formatCents(tx.amountCents, preferences)}
              </div>
              <Button size="sm" variant="berry" onClick={() => onRecord(tx)}>
                <Check className="h-4 w-4" /> Mark paid
              </Button>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}

interface RecordDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  prefilled: DebtTransaction | null
  members: User[]
  currentUserId: string
  onSubmit: (p: {
    fromUserId: string
    toUserId: string
    amountCents: number
    note?: string
  }) => void
}

function RecordSettlementDialog({
  open,
  onOpenChange,
  prefilled,
  members,
  currentUserId,
  onSubmit,
}: RecordDialogProps) {
  const preferences = useStore((s) => s.preferences)
  const symbol = currencySymbol(preferences.currency, preferences.locale)
  const [from, setFrom] = useState<string>(prefilled?.from ?? currentUserId)
  const [to, setTo] = useState<string>(prefilled?.to ?? '')
  const [amount, setAmount] = useState<string>(
    prefilled ? (prefilled.amountCents / 100).toString() : '',
  )
  const [note, setNote] = useState<string>('')

  useEffect(() => {
    if (open) {
      setFrom(prefilled?.from ?? currentUserId)
      setTo(prefilled?.to ?? members.find((m) => m.id !== currentUserId)?.id ?? '')
      setAmount(prefilled ? (prefilled.amountCents / 100).toString() : '')
      setNote('')
    }
  }, [open, prefilled, currentUserId, members])

  function submit() {
    const cents = parseCurrencyToCents(amount)
    if (!from || !to || from === to) {
      toast.error('Pick two different people.')
      return
    }
    if (!Number.isFinite(cents) || cents <= 0) {
      toast.error('Enter a valid amount.')
      return
    }
    onSubmit({ fromUserId: from, toUserId: to, amountCents: cents, note })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a payment</DialogTitle>
          <DialogDescription>
            Logs a settlement that reduces the debt between two members.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">From</label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">To</label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Recipient" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {symbol}
              </span>
              <Input
                inputMode="decimal"
                className="tabular-nums"
                style={{ paddingLeft: `calc(${symbol.length}ch + 1.25rem)` }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Note (optional)</label>
            <Input
              placeholder="Venmo · #4421"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Record payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
