import { createFileRoute } from '@tanstack/react-router'
import { ExpensesTab } from '@/components/groups/tabs/ExpensesTab'

export const Route = createFileRoute('/app/groups/$groupId/')({
  component: ExpensesTab,
})
