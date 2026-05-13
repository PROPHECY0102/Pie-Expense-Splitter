import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary-foreground">
          <Icon className="h-7 w-7 text-cocoa" strokeWidth={1.75} />
        </div>
      ) : null}
      <h3 className="font-serif text-xl font-semibold">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
