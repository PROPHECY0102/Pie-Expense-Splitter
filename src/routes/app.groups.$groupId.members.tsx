import { createFileRoute } from '@tanstack/react-router'
import { MembersTab } from '@/components/groups/tabs/MembersTab'

export const Route = createFileRoute('/app/groups/$groupId/members')({
  component: MembersTab,
})
