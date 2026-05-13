import { createFileRoute } from '@tanstack/react-router'
import { ExpenseFormPage } from '@/components/expenses/ExpenseFormPage'

export const Route = createFileRoute('/app/groups/$groupId/expenses/new')({
  component: () => <ExpenseFormPage mode="create" />,
})
