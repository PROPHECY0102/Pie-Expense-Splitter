import { createFileRoute } from '@tanstack/react-router'
import { GroupNew } from '@/components/groups/GroupNew'

export const Route = createFileRoute('/app/groups/new')({
  component: GroupNew,
})
