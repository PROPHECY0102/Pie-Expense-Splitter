import { useMemo } from 'react'
import { useStore } from '@/store'
import {
  computeNetBalances,
  computePairBalances,
  type PairBalance,
} from '@/lib/balances'
import { simplifyDebts, type DebtTransaction } from '@/lib/simplify-debts'
import type { ID } from '@/types'

export interface GroupBalanceData {
  net: Record<ID, number>
  pairs: PairBalance[]
  simplified: DebtTransaction[]
}

export function useGroupBalances(groupId: ID | undefined): GroupBalanceData {
  const groups = useStore((s) => s.groups)
  const expenses = useStore((s) => s.expenses)
  const settlements = useStore((s) => s.settlements)

  return useMemo(() => {
    const group = groups.find((g) => g.id === groupId)
    if (!group) return { net: {}, pairs: [], simplified: [] }
    const groupExpenses = expenses.filter((e) => e.groupId === groupId)
    const groupSettlements = settlements.filter((s) => s.groupId === groupId)
    const net = computeNetBalances(group.memberIds, groupExpenses, groupSettlements)
    const pairs = computePairBalances(groupExpenses, groupSettlements)
    const simplified = simplifyDebts(net)
    return { net, pairs, simplified }
  }, [groupId, groups, expenses, settlements])
}
