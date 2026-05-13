import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'
import { GroupDetailLayout } from '@/components/groups/GroupDetailLayout'
import { useStore } from '@/store'

export const Route = createFileRoute('/app/groups/$groupId')({
  beforeLoad: ({ params }) => {
    const { groups } = useStore.getState()
    if (!groups.find((g) => g.id === params.groupId)) {
      throw notFound()
    }
  },
  component: GroupRoute,
})

function GroupRoute() {
  return (
    <GroupDetailLayout>
      <Outlet />
    </GroupDetailLayout>
  )
}
