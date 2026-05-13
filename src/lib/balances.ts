import type { Expense, ID, Settlement } from '@/types'

/** Canonical pair key. Sorted alphabetically so (a, b) and (b, a) collapse. */
export function pairKey(a: ID, b: ID): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

/**
 * Net per-user balance.
 *
 * Positive  → others owe this user (creditor).
 * Negative  → this user owes others (debtor).
 *
 * For each expense:
 *   - paidBy receives credit of (total amount - their own share).
 *   - every other participant is debited their share.
 *
 * For each settlement:
 *   - fromUser pays toUser: fromUser's balance goes up (they owed less),
 *     toUser's balance goes down (they're owed less).
 */
export function computeNetBalances(
  memberIds: ID[],
  expenses: Expense[],
  settlements: Settlement[],
): Record<ID, number> {
  const net: Record<ID, number> = {}
  for (const id of memberIds) net[id] = 0

  for (const e of expenses) {
    for (const split of e.splits) {
      if (split.userId === e.paidBy) continue
      net[e.paidBy] = (net[e.paidBy] ?? 0) + split.amountCents
      net[split.userId] = (net[split.userId] ?? 0) - split.amountCents
    }
  }

  for (const s of settlements) {
    // fromUser paying back the toUser reduces their debt.
    net[s.fromUserId] = (net[s.fromUserId] ?? 0) + s.amountCents
    net[s.toUserId] = (net[s.toUserId] ?? 0) - s.amountCents
  }

  return net
}

export interface PairBalance {
  /** Net amount that `debtor` owes to `creditor`. Always > 0. */
  debtor: ID
  creditor: ID
  amountCents: number
}

/**
 * Per-pair net balances. For every pair (a, b) we compute the signed amount
 * `a → b` (positive means a owes b). Direction is normalized so the result
 * always carries debtor / creditor with a positive amount. Pairs with zero
 * balance are omitted.
 */
export function computePairBalances(
  expenses: Expense[],
  settlements: Settlement[],
): PairBalance[] {
  // For each ordered (debtor, creditor), accumulate amount owed.
  const owe = new Map<string, number>() // key: `${debtor}|${creditor}` → cents

  function add(debtor: ID, creditor: ID, cents: number) {
    if (debtor === creditor || cents === 0) return
    const k = `${debtor}|${creditor}`
    owe.set(k, (owe.get(k) ?? 0) + cents)
  }

  for (const e of expenses) {
    for (const split of e.splits) {
      if (split.userId === e.paidBy) continue
      add(split.userId, e.paidBy, split.amountCents)
    }
  }

  for (const s of settlements) {
    // Settlement reduces fromUser's debt to toUser (or flips it).
    add(s.toUserId, s.fromUserId, s.amountCents)
  }

  // Collapse opposite-direction pairs.
  const result: PairBalance[] = []
  const visited = new Set<string>()
  for (const [k, v] of owe.entries()) {
    if (visited.has(k)) continue
    const [a, b] = k.split('|')
    const reverseKey = `${b}|${a}`
    const reverse = owe.get(reverseKey) ?? 0
    const net = v - reverse
    visited.add(k)
    visited.add(reverseKey)
    if (net > 0) result.push({ debtor: a, creditor: b, amountCents: net })
    else if (net < 0) result.push({ debtor: b, creditor: a, amountCents: -net })
  }

  // Stable sort: largest amount first.
  result.sort((x, y) => y.amountCents - x.amountCents)
  return result
}
