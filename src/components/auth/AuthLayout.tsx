import { Link } from '@tanstack/react-router'
import { PieLogo } from '@/components/common/PieLogo'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="container py-6">
        <Link to="/" className="inline-flex items-center gap-2 font-serif text-xl font-semibold">
          <PieLogo className="h-7 w-7" /> Pie
        </Link>
      </header>
      <main className="flex-1 grid place-items-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card/85 backdrop-blur p-8 shadow-[0_30px_60px_-30px_rgba(61,44,32,0.25)]">
            <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
            <div className="mt-6">{children}</div>
          </div>
          {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
        </motion.div>
      </main>
    </div>
  )
}
