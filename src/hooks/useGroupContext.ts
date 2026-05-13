import { useParams } from '@tanstack/react-router'
import { useStore } from '@/store'

/** Resolves the current /app/groups/$groupId context. */
export function useGroupContext() {
  const params = useParams({ strict: false }) as { groupId?: string }
  const groupId = params.groupId
  const group = useStore((s) => s.groups.find((g) => g.id === groupId))
  const members = useStore((s) => {
    if (!group) return []
    return s.users.filter((u) => group.memberIds.includes(u.id))
  })
  return { groupId, group, members }
}
