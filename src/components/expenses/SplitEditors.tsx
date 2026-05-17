import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/UserAvatar'
import { resolveSplit, validateSplit } from '@/lib/split'
import { formatCents, parseCurrencyToCents } from '@/lib/currency'
import type { ID, Preferences, SplitMethod, User } from '@/types'

interface SplitEditorProps {
  members: User[]
  inputs: Record<ID, number>
  onChange: (next: Record<ID, number>) => void
  totalCents: number
  preferences: Preferences
  currentUserId?: ID | null
}

interface MethodAwareProps extends SplitEditorProps {
  method: SplitMethod
}

/** Renders the appropriate editor for the chosen split method. */
export function SplitEditor(props: MethodAwareProps) {
  switch (props.method) {
    case 'equal':
      return <EqualSplitEditor {...props} />
    case 'exact':
      return <ExactSplitEditor {...props} />
    case 'percentage':
      return <PercentageSplitEditor {...props} />
    case 'shares':
      return <SharesSplitEditor {...props} />
  }
}

export function useResolvedSplit(
  method: SplitMethod,
  inputs: Record<ID, number>,
  totalCents: number,
) {
  return useMemo(() => {
    if (totalCents <= 0) return new Map<ID, number>()
    try {
      const resolved = resolveSplit(method, inputs, totalCents)
      return new Map(resolved.map((s) => [s.userId, s.amountCents]))
    } catch {
      return new Map<ID, number>()
    }
  }, [method, inputs, totalCents])
}

export function useSplitError(
  method: SplitMethod,
  inputs: Record<ID, number>,
  totalCents: number,
) {
  return useMemo(() => validateSplit(method, inputs, totalCents), [method, inputs, totalCents])
}

function MemberRow({
  user,
  children,
  resolvedCents,
  preferences,
  isCurrentUser,
}: {
  user: User
  children: React.ReactNode
  resolvedCents?: number
  preferences: Preferences
  isCurrentUser?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
        isCurrentUser
          ? 'border-accent/40 bg-accent/10'
          : 'border-border bg-background/60'
      }`}
    >
      <UserAvatar user={user} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{user.name}</span>
          {isCurrentUser ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              You
            </Badge>
          ) : null}
        </div>
        {resolvedCents !== undefined ? (
          <div className="text-xs text-muted-foreground tabular-nums">
            Share: {formatCents(resolvedCents, preferences)}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/** EQUAL: each user has input=1 if included, 0 otherwise. */
function EqualSplitEditor({ members, inputs, onChange, totalCents, preferences, currentUserId }: SplitEditorProps) {
  const resolved = useResolvedSplit('equal', inputs, totalCents)
  function toggle(userId: ID) {
    onChange({ ...inputs, [userId]: inputs[userId] > 0 ? 0 : 1 })
  }
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Tap to include / exclude.</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(Object.fromEntries(members.map((m) => [m.id, 1])))}
          >
            All in
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(Object.fromEntries(members.map((m) => [m.id, 0])))}
          >
            None
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        {members.map((m) => {
          const included = inputs[m.id] > 0
          const isMe = m.id === currentUserId
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={`w-full text-left flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                included
                  ? 'border-accent/40 bg-accent/10'
                  : 'border-border bg-background/60 hover:bg-accent/5'
              }`}
            >
              <UserAvatar user={m} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{m.name}</span>
                  {isMe ? (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      You
                    </Badge>
                  ) : null}
                </div>
                {included ? (
                  <div className="text-xs text-muted-foreground tabular-nums">
                    Share: {formatCents(resolved.get(m.id) ?? 0, preferences)}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Not included</div>
                )}
              </div>
              <span
                className={`h-5 w-5 rounded-md border grid place-items-center ${
                  included ? 'bg-accent border-accent text-accent-foreground' : 'border-border'
                }`}
              >
                {included ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** EXACT: each user enters cents directly. */
function ExactSplitEditor({ members, inputs, onChange, totalCents, preferences, currentUserId }: SplitEditorProps) {
  const allocated = Object.values(inputs).reduce((a, b) => a + (b || 0), 0)
  const remaining = totalCents - allocated
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Sum each person’s exact share.</span>
        <span
          className={`tabular-nums font-medium ${
            remaining === 0
              ? 'text-[hsl(var(--success))]'
              : 'text-destructive'
          }`}
        >
          {remaining === 0
            ? 'Balanced ✓'
            : `${remaining > 0 ? 'Remaining' : 'Over by'} ${formatCents(Math.abs(remaining), preferences)}`}
        </span>
      </div>
      <div className="space-y-1.5">
        {members.map((m) => (
          <MemberRow
            key={m.id}
            user={m}
            preferences={preferences}
            isCurrentUser={m.id === currentUserId}
          >
            <Input
              inputMode="decimal"
              className="w-32 text-right tabular-nums"
              value={inputs[m.id] ? (inputs[m.id] / 100).toString() : ''}
              onChange={(e) => {
                const cents = parseCurrencyToCents(e.target.value)
                onChange({ ...inputs, [m.id]: Number.isFinite(cents) ? cents : 0 })
              }}
              placeholder="0.00"
            />
          </MemberRow>
        ))}
      </div>
    </div>
  )
}

/** PERCENTAGE: each user enters basis points (10000 = 100%). */
function PercentageSplitEditor({
  members,
  inputs,
  onChange,
  totalCents,
  preferences,
  currentUserId,
}: SplitEditorProps) {
  const resolved = useResolvedSplit('percentage', inputs, totalCents)
  const sumBp = Object.values(inputs).reduce((a, b) => a + (b || 0), 0)
  const remaining = 10000 - sumBp
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Percentages must total 100%.</span>
        <span
          className={`tabular-nums font-medium ${
            remaining === 0
              ? 'text-[hsl(var(--success))]'
              : 'text-destructive'
          }`}
        >
          {remaining === 0
            ? 'Balanced ✓'
            : `${remaining > 0 ? 'Remaining' : 'Over by'} ${(Math.abs(remaining) / 100).toFixed(2)}%`}
        </span>
      </div>
      <div className="space-y-1.5">
        {members.map((m) => (
          <MemberRow
            key={m.id}
            user={m}
            preferences={preferences}
            isCurrentUser={m.id === currentUserId}
            resolvedCents={inputs[m.id] > 0 ? resolved.get(m.id) ?? 0 : undefined}
          >
            <div className="flex items-center">
              <Input
                inputMode="decimal"
                className="w-24 text-right tabular-nums"
                value={inputs[m.id] ? (inputs[m.id] / 100).toString() : ''}
                onChange={(e) => {
                  const v = Number(e.target.value.replace(/[^0-9.]/g, ''))
                  onChange({
                    ...inputs,
                    [m.id]: Number.isFinite(v) ? Math.round(v * 100) : 0,
                  })
                }}
                placeholder="0"
              />
              <span className="ml-1 text-sm text-muted-foreground">%</span>
            </div>
          </MemberRow>
        ))}
      </div>
    </div>
  )
}

/** SHARES: each user gets an integer share count. */
function SharesSplitEditor({ members, inputs, onChange, totalCents, preferences, currentUserId }: SplitEditorProps) {
  const resolved = useResolvedSplit('shares', inputs, totalCents)
  const total = Object.values(inputs).reduce((a, b) => a + (b || 0), 0)
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        Each share gets {total > 0 ? `≈ ${(100 / total).toFixed(1)}%` : '—'} of the total.
      </div>
      <div className="space-y-1.5">
        {members.map((m) => (
          <MemberRow
            key={m.id}
            user={m}
            preferences={preferences}
            isCurrentUser={m.id === currentUserId}
            resolvedCents={inputs[m.id] > 0 ? resolved.get(m.id) ?? 0 : undefined}
          >
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  onChange({ ...inputs, [m.id]: Math.max(0, (inputs[m.id] ?? 0) - 1) })
                }
              >
                –
              </Button>
              <Input
                inputMode="numeric"
                className="w-14 text-center tabular-nums px-2"
                value={inputs[m.id] ?? 0}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  onChange({ ...inputs, [m.id]: Number.isFinite(v) ? Math.max(0, v) : 0 })
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange({ ...inputs, [m.id]: (inputs[m.id] ?? 0) + 1 })}
              >
                +
              </Button>
            </div>
          </MemberRow>
        ))}
      </div>
    </div>
  )
}
