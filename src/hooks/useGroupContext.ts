import { useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { useStore } from '@/store'

/** Resolves the current /app/groups/$groupId context. */
export function useGroupContext() {
  const params = useParams({ strict: false }) as { groupId?: string }
  const groupId = params.groupId
  const group = useStore((s) => s.groups.find((g) => g.id === groupId))
  const users = useStore((s) => s.users)
  const members = useMemo(
    () => (group ? users.filter((u) => group.memberIds.includes(u.id)) : []),
    [group, users],
  )
  return { groupId, group, members }
}
