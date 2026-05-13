import type { ID } from '@/types'

export interface DebtTransaction {
  from: ID
  to: ID
  amountCents: number
}

/**
 * Greedy minimum-cash-flow settlement.
 *
 * Given net per-user balances (positive = owed, negative = owes), repeatedly
 * pair the maximum creditor with the maximum debtor and settle `min(|debt|,
 * credit)`. This produces a transaction list that zeroes every balance with
 * at most N-1 transactions, where N is the count of non-zero participants —
 * provably the minimum.
 *
 * Complexity O(N²) on the number of members in the group; fine for typical
 * group sizes (<50).
 *
 * A tolerance of 1 cent absorbs deterministic-rounding artifacts from the
 * splitters.
 */
export function simplifyDebts(netBalances: Record<ID, number>): DebtTransaction[] {
  const TOL = 1 // cents
  const balances = Object.entries(netBalances)
    .map(([id, v]) => ({ id, amount: v }))
    .filter((b) => Math.abs(b.amount) > TOL)

  const transactions: DebtTransaction[] = []
  let guard = 1000 // belt-and-suspenders against runaway loops

  while (guard-- > 0) {
    balances.sort((a, b) => a.amount - b.amount)
    const debtor = balances[0]
    const creditor = balances[balances.length - 1]
    if (
      !debtor ||
      !creditor ||
      Math.abs(debtor.amount) <= TOL ||
      Math.abs(creditor.amount) <= TOL
    ) {
      break
    }
    const transferred = Math.min(-debtor.amount, creditor.amount)
    if (transferred <= 0) break
    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amountCents: transferred,
    })
    debtor.amount += transferred
    creditor.amount -= transferred
  }

  return transactions
}
