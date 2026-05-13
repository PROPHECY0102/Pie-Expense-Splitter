import { useStore } from '@/store'
import type { User } from '@/types'

export function useCurrentUser(): User | null {
  const currentUserId = useStore((s) => s.currentUserId)
  const users = useStore((s) => s.users)
  return users.find((u) => u.id === currentUserId) ?? null
}

export function useCurrentUserId(): string | null {
  return useStore((s) => s.currentUserId)
}
