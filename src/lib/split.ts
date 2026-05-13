import type { ExpenseSplit, ID, SplitMethod } from '@/types'

/**
 * Splits the given total (in integer cents) across the entries.
 *
 * `weights` maps userId → non-negative number representing their share of the
 * total. The sum of weights must be > 0. Each user's share is computed as
 * `floor(total * weight / sumWeights)`. Any remainder cents (always < N users)
 * are distributed deterministically by sorting userIds ascending and granting
 * one extra cent to the first `remainder` users — guarantees exact sum and
 * stability across re-renders.
 */
function distributeByWeights(
  totalCents: number,
  weights: Record<ID, number>,
): Array<{ userId: ID; amountCents: number }> {
  const entries = Object.entries(weights).filter(([, w]) => w > 0)
  if (entries.length === 0) return []
  const sumWeights = entries.reduce((acc, [, w]) => acc + w, 0)
  if (sumWeights <= 0) return []

  const base = entries.map(([userId, weight]) => {
    const share = Math.floor((totalCents * weight) / sumWeights)
    return { userId, amountCents: share }
  })
  const allocated = base.reduce((acc, s) => acc + s.amountCents, 0)
  let remainder = totalCents - allocated

  // Distribute remainder cents to users sorted by id ascending (stable).
  const sorted = [...base].sort((a, b) => a.userId.localeCompare(b.userId))
  let i = 0
  while (remainder > 0 && sorted.length > 0) {
    sorted[i % sorted.length].amountCents += 1
    remainder -= 1
    i += 1
  }
  while (remainder < 0 && sorted.length > 0) {
    // Negative remainder shouldn't occur in well-formed inputs, but guard anyway.
    sorted[i % sorted.length].amountCents -= 1
    remainder += 1
    i += 1
  }
  // Re-emit in input order.
  const indexById = new Map(base.map((b, idx) => [b.userId, idx]))
  const result = base.slice()
  for (const item of sorted) {
    const idx = indexById.get(item.userId)
    if (idx !== undefined) result[idx] = item
  }
  return result
}

/** Equal split among the given user IDs. */
export function splitEqual(totalCents: number, userIds: ID[]): ExpenseSplit[] {
  const weights = Object.fromEntries(userIds.map((id) => [id, 1]))
  return distributeByWeights(totalCents, weights).map(({ userId, amountCents }) => ({
    userId,
    input: 1,
    amountCents,
  }))
}

/** Exact-amount split. `inputs[userId]` is cents. Must sum to totalCents (validated at the form layer). */
export function splitExact(
  _totalCents: number,
  inputs: Record<ID, number>,
): ExpenseSplit[] {
  return Object.entries(inputs)
    .filter(([, v]) => Number.isFinite(v))
    .map(([userId, v]) => ({ userId, input: v, amountCents: Math.round(v) }))
}

/** Percentage split. `inputs[userId]` is basis points (10000 = 100%). */
export function splitPercentage(
  totalCents: number,
  inputs: Record<ID, number>,
): ExpenseSplit[] {
  const weights: Record<ID, number> = {}
  for (const [userId, bp] of Object.entries(inputs)) {
    if (bp > 0) weights[userId] = bp
  }
  const distributed = distributeByWeights(totalCents, weights)
  return distributed.map(({ userId, amountCents }) => ({
    userId,
    input: inputs[userId] ?? 0,
    amountCents,
  }))
}

/** Shares/weights split. `inputs[userId]` is integer share count. */
export function splitShares(
  totalCents: number,
  inputs: Record<ID, number>,
): ExpenseSplit[] {
  const weights: Record<ID, number> = {}
  for (const [userId, shares] of Object.entries(inputs)) {
    if (shares > 0) weights[userId] = shares
  }
  const distributed = distributeByWeights(totalCents, weights)
  return distributed.map(({ userId, amountCents }) => ({
    userId,
    input: inputs[userId] ?? 0,
    amountCents,
  }))
}

/** Method-agnostic dispatch — used by the store when persisting an expense. */
export function resolveSplit(
  method: SplitMethod,
  inputs: Record<ID, number>,
  totalCents: number,
): ExpenseSplit[] {
  switch (method) {
    case 'equal': {
      const included = Object.entries(inputs)
        .filter(([, v]) => v > 0)
        .map(([id]) => id)
      return splitEqual(totalCents, included)
    }
    case 'exact':
      return splitExact(totalCents, inputs)
    case 'percentage':
      return splitPercentage(totalCents, inputs)
    case 'shares':
      return splitShares(totalCents, inputs)
  }
}

/** Validation helpers (used by the form layer) — returns an error message or null. */
export function validateSplit(
  method: SplitMethod,
  inputs: Record<ID, number>,
  totalCents: number,
): string | null {
  switch (method) {
    case 'equal': {
      const n = Object.values(inputs).filter((v) => v > 0).length
      return n === 0 ? 'Select at least one person.' : null
    }
    case 'exact': {
      const sum = Object.values(inputs).reduce((a, b) => a + (b || 0), 0)
      if (sum !== totalCents) {
        return `Sum of shares (${(sum / 100).toFixed(2)}) must equal total (${(
          totalCents / 100
        ).toFixed(2)}).`
      }
      return null
    }
    case 'percentage': {
      const sum = Object.values(inputs).reduce((a, b) => a + (b || 0), 0)
      if (sum !== 10000) {
        return `Percentages must sum to 100% (currently ${(sum / 100).toFixed(2)}%).`
      }
      return null
    }
    case 'shares': {
      const total = Object.values(inputs).reduce((a, b) => a + (b || 0), 0)
      return total <= 0 ? 'Assign at least one share to one person.' : null
    }
  }
}
