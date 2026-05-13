import { createFileRoute } from '@tanstack/react-router'
import { GroupsList } from '@/components/groups/GroupsList'

export const Route = createFileRoute('/app/groups/')({
  component: GroupsList,
})
