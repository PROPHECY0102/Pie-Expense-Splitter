import { cn } from '@/lib/utils'

export function PieLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('h-8 w-8', className)}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pie logo"
    >
      <defs>
        <radialGradient id="logo-pie" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FBD9B7" />
          <stop offset="55%" stopColor="#E8A07A" />
          <stop offset="100%" stopColor="#B86A4A" />
        </radialGradient>
      </defs>
      <path
        d="M32 6 L58 50 A30 30 0 0 1 6 50 Z"
        fill="url(#logo-pie)"
        stroke="#5A3826"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <circle cx="26" cy="34" r="2.2" fill="#C04F5F" />
      <circle cx="38" cy="40" r="2.2" fill="#C04F5F" />
      <circle cx="32" cy="22" r="1.8" fill="#C04F5F" />
    </svg>
  )
}

export function PieWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-cocoa', className)}>
      <PieLogo className="h-7 w-7" />
      Pie
    </span>
  )
}
