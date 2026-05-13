import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ChevronRight, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useStore } from '@/store'

export function LoginPage() {
  const navigate = useNavigate()
  const users = useStore((s) => s.users)
  const loginAs = useStore((s) => s.loginAs)

  function pick(userId: string, name: string) {
    loginAs(userId)
    toast.success(`Continuing as ${name}`)
    navigate({ to: '/app' })
  }

  return (
    <AuthLayout
      title={users.length === 0 ? 'No accounts yet' : 'Continue as…'}
      subtitle={
        users.length === 0
          ? 'Create your first account to start using Pie.'
          : 'Tap an account to act as that user. You can switch any time from the header.'
      }
      footer={
        <span className="text-muted-foreground">
          Need a new account?{' '}
          <Link to="/register" className="text-accent hover:underline">
            Sign up
          </Link>
        </span>
      }
    >
      {users.length === 0 ? (
        <Button asChild className="w-full" size="lg">
          <Link to="/register">
            <UserPlus className="h-4 w-4" /> Create your first account
          </Link>
        </Button>
      ) : (
        <ul className="space-y-2">
          {users.map((u, i) => (
            <motion.li
              key={u.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => pick(u.id, u.name)}
                className="w-full flex items-center gap-3 rounded-lg border border-border bg-background/70 px-3 py-2.5 hover:bg-accent/10 transition-colors text-left"
              >
                <UserAvatar user={u} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.li>
          ))}
          <li className="pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/register">
                <UserPlus className="h-4 w-4" /> Add another account
              </Link>
            </Button>
          </li>
        </ul>
      )}
    </AuthLayout>
  )
}
