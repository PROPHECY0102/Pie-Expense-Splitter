import { createFileRoute } from '@tanstack/react-router'
import { BalancesTab } from '@/components/groups/tabs/BalancesTab'

export const Route = createFileRoute('/app/groups/$groupId/balances')({
  component: BalancesTab,
})
