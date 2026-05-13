import { createFileRoute } from '@tanstack/react-router'
import { SettleUp } from '@/components/groups/SettleUp'

export const Route = createFileRoute('/app/groups/$groupId/settle')({
  component: SettleUp,
})
