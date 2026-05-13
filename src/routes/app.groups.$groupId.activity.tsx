import { createFileRoute } from '@tanstack/react-router'
import { ActivityTab } from '@/components/groups/tabs/ActivityTab'

export const Route = createFileRoute('/app/groups/$groupId/activity')({
  component: ActivityTab,
})
