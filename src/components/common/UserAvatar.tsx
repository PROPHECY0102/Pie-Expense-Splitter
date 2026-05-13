import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, initialsOf } from '@/lib/utils'
import type { User } from '@/types'

interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatarColor'> | null | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
} as const

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  if (!user) {
    return (
      <Avatar className={cn(sizeMap[size], className)}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    )
  }
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      <AvatarFallback
        className="text-white font-semibold"
        style={{ backgroundColor: user.avatarColor }}
      >
        {initialsOf(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}
