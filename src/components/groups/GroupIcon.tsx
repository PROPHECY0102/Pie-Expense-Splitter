import { Cake, Cookie, Coffee, Home, IceCream, Plane, Pizza } from 'lucide-react'
import type { GroupIconKey } from '@/types'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, typeof Cake> = {
  pie: Pizza, // pizza-slice as pie placeholder
  cake: Cake,
  cookie: Cookie,
  donut: Cookie,
  'ice-cream': IceCream,
  coffee: Coffee,
  plane: Plane,
  home: Home,
}

interface GroupIconProps {
  iconKey?: string
  className?: string
}

export function GroupIcon({ iconKey, className }: GroupIconProps) {
  const Icon = ICON_MAP[iconKey ?? 'pie'] ?? Pizza
  return <Icon className={cn('h-5 w-5', className)} strokeWidth={1.75} />
}

export const GROUP_ICON_OPTIONS: { key: GroupIconKey; label: string }[] = [
  { key: 'pie', label: 'Pie' },
  { key: 'cake', label: 'Cake' },
  { key: 'cookie', label: 'Cookie' },
  { key: 'donut', label: 'Donut' },
  { key: 'ice-cream', label: 'Ice cream' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'plane', label: 'Travel' },
  { key: 'home', label: 'Home' },
]
